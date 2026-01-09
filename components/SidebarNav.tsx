
import React from 'react';
import { 
  FileText, 
  Users, 
  History, 
  PlusCircle,
  Settings
} from 'lucide-react';

type ViewType = 'quote' | 'rates' | 'history';

interface SidebarNavProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onNewProject: () => void;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ currentView, onViewChange, onNewProject }) => {
  const navItems = [
    { id: 'quote', label: '報價單製作', icon: <FileText size={20} /> },
    { id: 'rates', label: '人力單價管理', icon: <Users size={20} /> },
    { id: 'history', label: '專案歷史紀錄', icon: <History size={20} /> },
  ];

  return (
    <aside className="w-full md:w-72 border-r border-zinc-800 p-6 shrink-0 no-print flex flex-col gap-10 bg-black">
      <div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-8 px-3">主選單 MENU</h3>
        <nav className="flex flex-col gap-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as ViewType)}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold text-sm tracking-tight ${
                currentView === item.id 
                ? 'bg-white text-black shadow-2xl shadow-white/10' 
                : 'text-zinc-300 hover:bg-zinc-900 hover:text-white group'
              }`}
            >
              <span className={`${currentView === item.id ? 'text-black' : 'text-zinc-400 group-hover:text-white transition-colors'}`}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto space-y-6">
        <button
          onClick={onNewProject}
          className="w-full flex items-center justify-center gap-3 py-5 bg-zinc-900 border border-zinc-800 rounded-[1.5rem] text-zinc-100 hover:bg-zinc-800 hover:border-zinc-600 transition-all text-sm font-black group shadow-xl active:scale-[0.98]"
        >
          <PlusCircle size={20} className="text-zinc-400 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
          開啟新報價單
        </button>
        <div className="px-3">
          <p className="text-[9px] text-zinc-500 leading-relaxed font-black uppercase tracking-[0.2em] opacity-80">
            Quotation Pro System<br/>
            Mixcode Studio Tools v2.5
          </p>
        </div>
      </div>
    </aside>
  );
};

export default SidebarNav;
