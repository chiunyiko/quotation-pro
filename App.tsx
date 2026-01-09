
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { 
  Plus, 
  Calendar,
  Cloud,
  LogOut,
  ChevronRight,
  LayoutDashboard,
  ShieldCheck,
  Zap,
  Trash2,
  FolderOpen,
  Clock,
  ArrowRight,
  Users,
  Copy
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { calculateWorkdays } from './utils/dateUtils';
import { generateId } from './utils/idUtils';
import { ServiceItem, Project, RateItem } from './types';
import { INITIAL_RATES, INITIAL_ITEMS, CATEGORIES } from './constants';
import { supabase } from './services/supabaseClient';

import SidebarNav from './components/SidebarNav';
import RateCardView from './components/RateCardView';
import ItemRow from './components/ItemRow';
import Button from './components/Button';
import { Auth } from './components/Auth';

type ViewType = 'quote' | 'rates' | 'history';

// 圓餅圖標籤渲染器
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, fill }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 1.35; 
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <g>
      <text 
        x={x} 
        y={y} 
        fill={fill} 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-[11px] font-black"
        style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.8))' }}
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    </g>
  );
};

const App: React.FC = () => {
  const [session, setSession] = useState<any>({ user: { email: 'local-user@mixcode.tv', id: 'local-dev' }, isLocal: true });
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [rates, setRates] = useState<RateItem[]>(INITIAL_RATES);
  const [currentView, setCurrentView] = useState<ViewType>('quote');
  const [isInitialized, setIsInitialized] = useState(false);

  const startPickerRef = useRef<HTMLInputElement>(null);
  const endPickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadInitialData = () => {
      const savedProjects = localStorage.getItem('studio_projects_v2');
      if (savedProjects) {
        const parsed = JSON.parse(savedProjects);
        setProjects(parsed);
        if (parsed.length > 0) setActiveProjectId(parsed[0].id);
      } else {
        const firstProject: Project = {
          id: generateId(),
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
      setIsInitialized(true);
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (isInitialized && projects.length > 0) {
      localStorage.setItem('studio_projects_v2', JSON.stringify(projects));
    }
  }, [projects, isInitialized]);

  const currentProject = useMemo(() => 
    projects.find(p => p.id === activeProjectId) || projects[0] || null
  , [projects, activeProjectId]);

  const stats = useMemo(() => {
    if (!currentProject) return { days: 0, rawCost: 0, quoteExclTax: 0, taxAmount: 0, totalInclTax: 0 };
    
    const workdays = calculateWorkdays(currentProject.startDate, currentProject.endDate).days;
    const rawCost = currentProject.items.reduce((sum, i) => sum + (i.dailyCost * i.estimatedDays), 0);
    
    const marginRatio = currentProject.margin / 100;
    const quoteExclTax = marginRatio >= 1 ? rawCost : rawCost / (1 - marginRatio);
    
    const taxAmount = quoteExclTax * (currentProject.taxRate / 100);
    const totalInclTax = quoteExclTax + taxAmount;

    return { 
      days: workdays, 
      rawCost, 
      quoteExclTax, 
      taxAmount, 
      totalInclTax 
    };
  }, [currentProject]);

  const chartData = useMemo(() => {
    if (!currentProject) return [];
    const map: Record<string, { value: number, fill: string }> = {};
    
    currentProject.items.forEach(i => {
      const cost = i.dailyCost * i.estimatedDays;
      if (cost <= 0) return;

      const name = i.name || '未命名職務';
      const color = i.customColor || CATEGORIES[i.category]?.hex || '#94a3b8';

      if (map[name]) {
        map[name].value += cost;
      } else {
        map[name] = { value: cost, fill: color };
      }
    });

    return Object.entries(map).map(([name, data]) => ({
      name,
      value: data.value,
      fill: data.fill
    }));
  }, [currentProject]);

  const updateProject = (updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, ...updates, updatedAt: Date.now() } : p));
  };

  const deleteProject = (id: string) => {
    if (projects.length <= 1) return alert('必須保留至少一個專案。');
    const newProjects = projects.filter(p => p.id !== id);
    setProjects(newProjects);
    setActiveProjectId(newProjects[0].id);
  };

  const duplicateProject = (project: Project) => {
    const newId = generateId();
    const newProject: Project = {
      ...project,
      id: newId,
      projectName: `複製 - ${project.projectName}`,
      updatedAt: Date.now(),
      items: project.items.map(item => ({ ...item, id: generateId() }))
    };
    setProjects([newProject, ...projects]);
    setActiveProjectId(newId);
    setCurrentView('quote');
  };

  const handleAddItem = () => {
    const newItem: ServiceItem = { id: generateId(), category: '動態製作', name: '', remark: '', dailyCost: 0, estimatedDays: 0 };
    updateProject({ items: [...(currentProject?.items || []), newItem] });
  };

  const openPicker = (ref: React.RefObject<HTMLInputElement>) => {
    if (ref.current && 'showPicker' in ref.current) {
      ref.current.showPicker();
    } else {
      ref.current?.focus();
    }
  };

  if (!isInitialized) return null;
  if (!currentProject) return null;

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-zinc-900 px-8 py-6 flex items-center justify-between no-print">
        <div className="flex items-center gap-8">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black font-black italic shadow-2xl">M</div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">Active Workspace</span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-800 rounded-full border border-zinc-700">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-[8px] font-bold text-zinc-300 uppercase tracking-tighter">Local Development</span>
              </div>
            </div>
            <input 
              value={currentProject.projectName} 
              onChange={e => updateProject({ projectName: e.target.value })} 
              className="bg-transparent text-2xl font-black border-none focus:ring-0 p-0 w-[500px] text-white" 
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-4 text-[10px] font-black uppercase text-zinc-400 tracking-widest mr-4">
            <Cloud size={14} className="text-zinc-500" /> Auto-saved
          </div>
          <Button variant="outline" size="sm" onClick={() => window.print()}>預覽列印</Button>
          <Button variant="primary" size="sm" onClick={() => setCurrentView('history')}>管理所有專案</Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <SidebarNav currentView={currentView} onViewChange={setCurrentView} onNewProject={() => {
           const id = generateId();
           const np: Project = { 
             id, 
             projectName: '新製作專案_' + new Date().toLocaleDateString(), 
             clientName: 'New Client',
             startDate: new Date().toISOString().split('T')[0],
             endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
             items: [], 
             taxRate: 5,
             margin: 30,
             updatedAt: Date.now() 
           };
           setProjects([np, ...projects]);
           setActiveProjectId(id);
           setCurrentView('quote');
        }} />

        <main className="flex-1 overflow-y-auto p-12 bg-black">
          {currentView === 'quote' ? (
            <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in duration-700 pb-32">
              <section className="flex justify-between items-end relative z-10">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={14} className="text-zinc-300"/> 專案時程 Timeline
                  </h3>
                  <div className="flex items-center bg-zinc-900/50 border border-zinc-800 rounded-2xl px-2 py-2 gap-4">
                    <div 
                      className="group flex items-center gap-3 cursor-pointer bg-zinc-800/20 hover:bg-zinc-800/60 border border-zinc-700/50 hover:border-zinc-500 px-5 py-3 rounded-xl transition-all shadow-inner" 
                      onClick={() => openPicker(startPickerRef)}
                    >
                      <Calendar size={16} className="text-zinc-500 group-hover:text-blue-400 transition-colors shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-zinc-500 uppercase leading-none mb-1">Start Date</span>
                        <input 
                          ref={startPickerRef} 
                          type="date" 
                          value={currentProject.startDate} 
                          onChange={e => updateProject({ startDate: e.target.value })} 
                          className="bg-transparent border-none text-white font-bold text-sm outline-none cursor-pointer w-[110px] p-0" 
                        />
                      </div>
                    </div>
                    
                    <div className="w-6 h-px bg-zinc-800" />
                    
                    <div 
                      className="group flex items-center gap-3 cursor-pointer bg-zinc-800/20 hover:bg-zinc-800/60 border border-zinc-700/50 hover:border-zinc-500 px-5 py-3 rounded-xl transition-all shadow-inner" 
                      onClick={() => openPicker(endPickerRef)}
                    >
                      <Calendar size={16} className="text-zinc-500 group-hover:text-pink-400 transition-colors shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-zinc-500 uppercase leading-none mb-1">End Date</span>
                        <input 
                          ref={endPickerRef} 
                          type="date" 
                          value={currentProject.endDate} 
                          onChange={e => updateProject({ endDate: e.target.value })} 
                          className="bg-transparent border-none text-white font-bold text-sm outline-none cursor-pointer w-[110px] p-0" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right px-8 py-4 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-inner">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase block tracking-wider">總預估製作天數</span>
                  <span className="text-3xl font-black text-white">{stats.days} <span className="text-xs text-zinc-500">Days</span></span>
                </div>
              </section>

              {/* Items Table */}
              <section className="bg-zinc-900/20 border border-zinc-800 rounded-3xl shadow-2xl relative">
                <table className="w-full border-collapse">
                  <thead className="bg-zinc-900/50 text-[10px] uppercase font-black text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="py-5 px-8 text-left rounded-tl-3xl">職務 Role</th>
                      <th className="py-5 px-4 text-left">製作備註 Remark</th>
                      <th className="py-5 px-4 text-right w-32">日單價</th>
                      <th className="py-5 px-4 text-center w-32">天數</th>
                      <th className="py-5 px-4 text-right w-40 pr-8">小計 Cost</th>
                      <th className="w-10 no-print rounded-tr-3xl"></th>
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
                <div className="p-6 no-print bg-zinc-900/10 rounded-b-3xl">
                  <button onClick={handleAddItem} className="flex items-center gap-2 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-widest transition-all group">
                    <Plus size={16} className="text-zinc-500 group-hover:text-white transition-colors" /> 新增製作項目
                  </button>
                </div>
              </section>

              {/* Financial Summary */}
              <div className="grid grid-cols-2 gap-20 pt-10 border-t border-zinc-900">
                <div className="space-y-8">
                  {/* 1. 重要數據區塊提升至上方 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-900/60 p-8 rounded-[2rem] border border-zinc-800 hover:border-zinc-700 transition-all group shadow-xl">
                      <span className="text-[10px] font-black text-zinc-500 uppercase block mb-2 tracking-[0.2em] group-hover:text-zinc-300 transition-colors">製作總成本 (Cost)</span>
                      <span className="text-2xl font-black font-mono text-zinc-100">${Math.round(stats.rawCost).toLocaleString()}</span>
                    </div>
                    <div className="bg-zinc-900/60 p-8 rounded-[2rem] border border-zinc-800 hover:border-zinc-700 transition-all group shadow-xl">
                      <span className="text-[10px] font-black text-zinc-500 uppercase block mb-2 tracking-[0.2em] group-hover:text-blue-300 transition-colors">稅前報價金額 (Quote)</span>
                      <span className="text-2xl font-black font-mono text-blue-300">${Math.round(stats.quoteExclTax).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* 2. 圓餅圖輔助區塊 */}
                  <div className="h-[440px] bg-zinc-800/40 backdrop-blur-xl rounded-[2.5rem] border border-zinc-700/50 flex items-center justify-center p-8 shadow-2xl relative overflow-visible">
                    <div className="absolute inset-0 bg-white/5 blur-[100px] rounded-full pointer-events-none opacity-20"></div>
                    
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={chartData} 
                            innerRadius={70} 
                            outerRadius={100} 
                            paddingAngle={8} 
                            dataKey="value"
                            stroke="none"
                            label={renderCustomizedLabel}
                            labelLine={{ stroke: '#ffffff20', strokeWidth: 1 }}
                            isAnimationActive={true}
                          >
                            {chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              background: '#18181b', 
                              border: '1px solid #3f3f46', 
                              borderRadius: '16px', 
                              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                              padding: '12px 16px'
                            }} 
                            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: '800' }} 
                            cursor={{ fill: 'transparent' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Waiting for Data</div>
                    )}
                    
                    <div className="absolute top-8 left-10">
                       <span className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em]">Role Cost Allocation</span>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900 p-12 rounded-[3rem] border border-zinc-800 space-y-12 shadow-2xl relative overflow-hidden h-fit">
                  <div className="space-y-8 relative z-10">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">目標毛利率 Margin</span>
                      <div className="flex items-center gap-2">
                        <input type="number" value={currentProject.margin} onChange={e => updateProject({ margin: Number(e.target.value) })} className="w-16 bg-zinc-800 rounded-lg text-right font-bold py-1.5 px-3 focus:ring-1 focus:ring-white outline-none text-white border border-zinc-700" />
                        <span className="text-zinc-400 font-bold">%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">營業稅率 Tax</span>
                      <div className="flex items-center gap-2">
                        <input type="number" value={currentProject.taxRate} onChange={e => updateProject({ taxRate: Number(e.target.value) })} className="w-16 bg-zinc-800 rounded-lg text-right font-bold py-1.5 px-3 focus:ring-1 focus:ring-white outline-none text-white border border-zinc-700" />
                        <span className="text-zinc-400 font-bold">%</span>
                      </div>
                    </div>
                    <div className="h-px bg-zinc-800/60" />
                    <div className="flex justify-between text-zinc-400">
                      <span className="text-[10px] font-black uppercase tracking-widest">稅額加計 (Tax Amount)</span>
                      <span className="font-mono text-zinc-200 text-sm font-bold">+ ${Math.round(stats.taxAmount).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2 relative z-10">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase block tracking-[0.2em]">總報價金額 (含稅) Grand Total</span>
                    <span className="text-8xl font-black tracking-tighter text-white drop-shadow-2xl">
                      ${Math.round(stats.totalInclTax).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : currentView === 'rates' ? (
            <RateCardView rates={rates} onUpdateRates={setRates} />
          ) : (
            <div className="max-w-6xl mx-auto py-8 animate-in slide-in-from-bottom-6 duration-700">
              <div className="flex justify-between items-center mb-16">
                <h2 className="text-5xl font-black tracking-tighter flex items-center gap-6 text-white italic">
                  <Clock className="text-zinc-400" size={40} /> 專案歷史紀錄 HISTORY
                </h2>
              </div>
              <div className="grid gap-6">
                {projects.map(p => (
                  <div key={p.id} onClick={() => { setActiveProjectId(p.id); setCurrentView('quote'); }} className={`group flex items-center justify-between p-10 bg-zinc-900/40 border rounded-[2.5rem] transition-all cursor-pointer hover:bg-zinc-900 hover:shadow-2xl hover:scale-[1.01] ${activeProjectId === p.id ? 'border-white bg-zinc-900 shadow-xl shadow-white/5' : 'border-zinc-800 hover:border-zinc-600'}`}>
                    <div className="flex items-center gap-10">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl ${activeProjectId === p.id ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-100 group-hover:bg-zinc-700 group-hover:text-white transition-colors'}`}>{p.projectName.charAt(0)}</div>
                      <div>
                        <h4 className="text-2xl font-black mb-2 text-white group-hover:translate-x-1 transition-transform tracking-tight">{p.projectName}</h4>
                        <div className="flex items-center gap-6 text-[10px] font-black uppercase text-zinc-300 tracking-[0.15em]">
                          <span className="flex items-center gap-2"><Calendar size={12} className="text-zinc-400"/> {p.startDate} - {p.endDate}</span>
                          <span className="flex items-center gap-2"><Users size={12} className="text-zinc-400"/> {p.clientName}</span>
                          <span className="flex items-center gap-2 text-zinc-500 font-bold">Last Edit: {new Date(p.updatedAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <span className="text-[10px] font-black text-zinc-400 uppercase block tracking-[0.2em] mb-1">Project Value</span>
                        <span className="text-3xl font-black text-white">${Math.round(p.items.reduce((s, i) => s + (i.dailyCost * i.estimatedDays), 0) / (1 - (p.margin || 0)/100) * (1 + (p.taxRate || 0)/100)).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={(e) => { e.stopPropagation(); duplicateProject(p); }} 
                          className="p-4 text-zinc-500 hover:text-blue-400 transition-all rounded-2xl hover:bg-blue-500/10 active:scale-90"
                          title="複製此專案建立新報價"
                        >
                          <Copy size={24} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }} className="p-4 text-zinc-500 hover:text-red-400 transition-all rounded-2xl hover:bg-red-500/10 active:scale-90"><Trash2 size={24} /></button>
                        <ChevronRight size={32} className="text-zinc-600 group-hover:text-white group-hover:translate-x-2 transition-all" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
