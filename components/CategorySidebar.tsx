
import React from 'react';
import { CATEGORIES } from '../constants';
import { CategoryType } from '../types';

interface SidebarProps {
  activeCategory: CategoryType | 'All';
  onCategoryChange: (cat: CategoryType | 'All') => void;
}

const CategorySidebar: React.FC<SidebarProps> = ({ activeCategory, onCategoryChange }) => {
  return (
    <aside className="w-full md:w-64 border-r border-zinc-800 p-4 shrink-0 no-print">
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 px-2">服務類別 SERVICES</h3>
        <nav className="flex flex-col gap-1">
          <button
            onClick={() => onCategoryChange('All')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
              activeCategory === 'All' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900'
            }`}
          >
            <div className={`w-2 h-2 rounded-full bg-white ${activeCategory === 'All' ? 'opacity-100' : 'opacity-20'}`} />
            全部類別
          </button>
          {/* 修正：CATEGORIES 為 Record 物件，使用 Object.keys 進行迭代 */}
          {(Object.keys(CATEGORIES) as CategoryType[]).map((id) => {
            const cat = CATEGORIES[id];
            return (
              <button
                key={id}
                onClick={() => onCategoryChange(id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                  activeCategory === id ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900'
                }`}
              >
                <span className={cat.color}>{cat.icon}</span>
                {cat.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
        <h4 className="text-xs font-bold text-zinc-300 mb-2">專家建議</h4>
        <p className="text-xs text-zinc-500 leading-relaxed">
          您可以點擊上方「AI 估算」，讓系統根據您的專案描述自動生成建議的報價項。
        </p>
      </div>
    </aside>
  );
};

export default CategorySidebar;
