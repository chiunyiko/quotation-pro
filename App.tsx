
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { 
  Plus, 
  Calendar,
  Cloud,
  LogOut,
  ChevronRight,
  LayoutDashboard,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { calculateWorkdays } from './utils/dateUtils';
import { generateId } from './utils/idUtils';
import { ServiceItem, Project, RateItem } from './types';
import { INITIAL_RATES, INITIAL_ITEMS } from './constants';
import { supabase } from './services/supabaseClient';

import SidebarNav from './components/SidebarNav';
import RateCardView from './components/RateCardView';
import ItemRow from './components/ItemRow';
import Button from './components/Button';
import { Auth } from './components/Auth';

type ViewType = 'quote' | 'rates' | 'history';

const CHART_PALETTE = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#2DD4BF', '#F472B6'];

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [rates, setRates] = useState<RateItem[]>(INITIAL_RATES);
  const [currentView, setCurrentView] = useState<ViewType>('quote');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // 用於觸發原生日期選擇器
  const startPickerRef = useRef<HTMLInputElement>(null);
  const endPickerRef = useRef<HTMLInputElement>(null);

  // 1. 初始化登入狀態
  useEffect(() => {
    const initSession = async () => {
      const demoSession = localStorage.getItem('demo_session');
      if (demoSession) {
        setSession(JSON.parse(demoSession));
      } else {
        try {
          const { data: { session: s } } = await supabase.auth.getSession();
          if (s) setSession(s);
        } catch (e) {}
      }
      setIsInitialized(true);
    };
    initSession();
  }, []);

  // 2. 加載專案資料
  useEffect(() => {
    if (!session || !isInitialized) return;

    const loadProjects = async () => {
      setIsSyncing(true);
      try {
        let loaded: Project[] = [];
        if (session.isDemo) {
          const local = localStorage.getItem('demo_projects');
          if (local) loaded = JSON.parse(local);
        } else {
          const { data, error } = await supabase.from('projects').select('*').order('updatedAt', { ascending: false });
          if (!error && data) loaded = data;
        }

        if (loaded.length > 0) {
          setProjects(loaded);
          setActiveProjectId(loaded[0].id);
        } else {
          const firstProject: Project = {
            id: generateId(),
            user_id: session.user?.id,
            projectName: 'Mixcode 範例製作專案 _ 2025',
            clientName: 'Demo Client',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            items: INITIAL_ITEMS.map(i => ({ ...i, id: generateId() })) as ServiceItem[],
            taxRate: 5,
            margin: 30,
            updatedAt: Date.now()
          };
          setProjects([firstProject]);
          setActiveProjectId(firstProject.id);
        }
      } catch (err) {
        console.error("Data fetch error", err);
      } finally {
        setIsSyncing(false);
      }
    };

    loadProjects();
  }, [session, isInitialized]);

  // 3. 自動存檔
  useEffect(() => {
    if (!session || projects.length === 0) return;
    const saveTimer = setTimeout(() => {
      if (session.isDemo) {
        localStorage.setItem('demo_projects', JSON.stringify(projects));
      } else {
        const curr = projects.find(p => p.id === activeProjectId);
        if (curr) supabase.from('projects').upsert({ ...curr, user_id: session.user.id }).catch(() => {});
      }
    }, 1000);
    return () => clearTimeout(saveTimer);
  }, [projects, activeProjectId, session]);

  const currentProject = useMemo(() => 
    projects.find(p => p.id === activeProjectId) || projects[0] || null
  , [projects, activeProjectId]);

  const stats = useMemo(() => {
    if (!currentProject) return { days: 0, cost: 0, quote: 0 };
    const workdays = calculateWorkdays(currentProject.startDate, currentProject.endDate).days;
    const cost = currentProject.items.reduce((sum, i) => sum + (i.dailyCost * i.estimatedDays), 0);
    const quote = cost / (1 - (currentProject.margin / 100) || 0.01);
    return { days: workdays, cost, quote };
  }, [currentProject]);

  const chartData = useMemo(() => {
    if (!currentProject) return [];
    const map: any = {};
    currentProject.items.forEach(i => {
      const c = i.dailyCost * i.estimatedDays;
      if (c > 0) map[i.name || '未命名'] = (map[i.name || '未命名'] || 0) + c;
    });
    return Object.entries(map).map(([name, value], idx) => ({ name, value, fill: CHART_PALETTE[idx % CHART_PALETTE.length] }));
  }, [currentProject]);

  const updateProject = (updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, ...updates, updatedAt: Date.now() } : p));
  };

  const handleAddItem = () => {
    const newItem: ServiceItem = { id: generateId(), category: '動態製作', name: '', remark: '', dailyCost: 0, estimatedDays: 0 };
    updateProject({ items: [...(currentProject?.items || []), newItem] });
  };

  const openPicker = (ref: React.RefObject<HTMLInputElement | null>) => {
    const el = ref.current;
    if (!el) return;
    
    // 將 el 斷言為 any 以徹底避開 TypeScript 對 showPicker 及其分支的靜態分析錯誤
    const input = el as any;
    if (input.showPicker) {
      input.showPicker();
    } else if (input.focus) {
      input.focus();
    }
  };

  if (!isInitialized) return null;
  if (!session) return <Auth />;
  if (!currentProject) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-800 font-black tracking-[0.5em] animate-pulse uppercase">Initializing Studio...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-zinc-900 px-8 py-6 flex items-center justify-between no-print">
        <div className="flex items-center gap-8">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black font-black italic shadow-2xl">M</div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Workspace</span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-900 rounded-full border border-zinc-800">
                <div className={`w-1.5 h-1.5 rounded-full ${session.isDemo ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">{session.isDemo ? 'Demo Mode' : session.user.email}</span>
              </div>
            </div>
            <input 
              value={currentProject.projectName} 
              onChange={e => updateProject({ projectName: e.target.value })} 
              className="bg-transparent text-2xl font-black border-none focus:ring-0 p-0 w-[500px]" 
            />
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => { localStorage.removeItem('demo_session'); window.location.reload(); }} className="text-zinc-600 hover:text-white transition-colors"><LogOut size={20}/></button>
          <Button variant="primary" onClick={() => window.print()}>匯出報價單</Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <SidebarNav currentView={currentView} onViewChange={setCurrentView} onNewProject={() => {
           const id = generateId();
           const np = { ...currentProject, id, projectName: '新專案_' + id.substring(0,4), items: [], updatedAt: Date.now() };
           setProjects([np, ...projects]);
           setActiveProjectId(id);
        }} />

        <main className="flex-1 overflow-y-auto p-12">
          {currentView === 'quote' ? (
            <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in duration-700">
              <section className="flex justify-between items-end">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2"><Calendar size={14}/> Timeline</h3>
                  <div className="flex items-center bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-3 gap-6">
                    <div 
                      className="group flex items-center gap-3 cursor-pointer hover:bg-zinc-800/50 px-4 py-2 rounded-xl transition-all"
                      onClick={() => openPicker(startPickerRef)}
                    >
                      <input 
                        ref={startPickerRef}
                        type="date" 
                        value={currentProject.startDate} 
                        onChange={e => updateProject({ startDate: e.target.value })} 
                        className="bg-transparent border-none text-white font-bold text-sm outline-none cursor-pointer w-[120px]" 
                      />
                    </div>
                    <div className="w-8 h-px bg-zinc-800" />
                    <div 
                      className="group flex items-center gap-3 cursor-pointer hover:bg-zinc-800/50 px-4 py-2 rounded-xl transition-all"
                      onClick={() => openPicker(endPickerRef)}
                    >
                      <input 
                        ref={endPickerRef}
                        type="date" 
                        value={currentProject.endDate} 
                        onChange={e => updateProject({ endDate: e.target.value })} 
                        className="bg-transparent border-none text-white font-bold text-sm outline-none cursor-pointer w-[120px]" 
                      />
                    </div>
                  </div>
                </div>
                <div className="text-right px-8 py-4 bg-zinc-900 rounded-2xl border border-zinc-800">
                  <span className="text-[9px] font-bold text-zinc-600 uppercase block">工作天預估</span>
                  <span className="text-3xl font-black">{stats.days} <span className="text-xs text-zinc-700">Days</span></span>
                </div>
              </section>

              <section className="bg-zinc-900/20 border border-zinc-800 rounded-3xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-zinc-900/50 text-[10px] uppercase font-black text-zinc-600 border-b border-zinc-800">
                    <tr>
                      <th className="py-5 px-8 text-left">Role</th>
                      <th className="py-5 px-4 text-left">Remark</th>
                      <th className="py-5 px-4 text-right w-32">Rate/Day</th>
                      <th className="py-5 px-4 text-center w-32">Days</th>
                      <th className="py-5 px-4 text-right w-40 pr-8">Subtotal</th>
                      <th className="w-10 no-print"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {currentProject.items.map(item => (
                      <ItemRow key={item.id} item={item} rates={rates} 
                        onUpdate={(id, upd) => updateProject({ items: currentProject.items.map(i => i.id === id ? {...i, ...upd} : i) })} 
                        onDelete={(id) => updateProject({ items: currentProject.items.filter(i => i.id !== id) })} 
                      />
                    ))}
                  </tbody>
                </table>
                <div className="p-6 no-print">
                  <button onClick={handleAddItem} className="flex items-center gap-2 text-zinc-500 hover:text-white font-bold text-xs uppercase tracking-widest transition-all">
                    <Plus size={16}/> Add Service Item
                  </button>
                </div>
              </section>

              <div className="grid grid-cols-2 gap-20 pt-10 border-t border-zinc-900">
                <div className="h-[300px]">
                  {chartData.length > 0 && (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: '12px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="bg-zinc-900 p-10 rounded-[2.5rem] border border-zinc-800 space-y-8">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Markup Margin</span>
                    <div className="flex items-center gap-2">
                      <input type="number" value={currentProject.margin} onChange={e => updateProject({ margin: Number(e.target.value) })} className="w-16 bg-zinc-800 rounded-lg text-right font-bold py-1 px-2 focus:ring-1 focus:ring-white outline-none" />
                      <span className="text-zinc-600 font-bold">%</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-600 uppercase block">Grand Total</span>
                    <span className="text-6xl font-black tracking-tighter">${Math.round(stats.quote * (1 + currentProject.taxRate/100)).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            currentView === 'rates' ? <RateCardView rates={rates} onUpdateRates={setRates} /> : <div className="text-zinc-800 font-black text-8xl opacity-10 uppercase select-none">History</div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
