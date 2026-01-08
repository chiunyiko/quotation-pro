
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
    <aside className="w-full md:w-64 border-r border-zinc-800 p-4 shrink-0 no-print flex flex-col gap-8">
      <div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-6 px-2">主選單 MENU</h3>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as ViewType)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                currentView === item.id 
                ? 'bg-white text-black shadow-lg shadow-white/5' 
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto">
        <button
          onClick={onNewProject}
          className="w-full flex items-center justify-center gap-2 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all text-sm font-bold"
        >
          <PlusCircle size={18} />
          開啟新報價單
        </button>
        <div className="mt-4 px-2">
          <p className="text-[10px] text-zinc-600 leading-relaxed font-medium">
            STUDIO QUOTATION SYSTEM<br/>
            專業影視製作報價工具 v2.5
          </p>
        </div>
      </div>
    </aside>
  );
};

export default SidebarNav;
