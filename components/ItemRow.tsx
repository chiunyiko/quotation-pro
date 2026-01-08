
import React from 'react';
import { Trash2, ChevronDown, Minus, Plus } from 'lucide-react';
import { ServiceItem, RateItem } from '../types';
import { CATEGORIES } from '../constants';

interface ItemRowProps {
  item: ServiceItem;
  rates: RateItem[];
  onUpdate: (id: string, updates: Partial<ServiceItem>) => void;
  onDelete: (id: string) => void;
}

const ItemRow: React.FC<ItemRowProps> = ({ item, rates, onUpdate, onDelete }) => {
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roleId = e.target.value;
    const selectedRate = rates.find(r => r.id === roleId);
    if (selectedRate) {
      onUpdate(item.id, { 
        roleId, 
        category: selectedRate.category,
        name: selectedRate.roleName,
        dailyCost: selectedRate.price 
      });
    }
  };

  const adjustDays = (delta: number) => {
    onUpdate(item.id, { estimatedDays: Math.max(0, item.estimatedDays + delta) });
  };

  const categoryInfo = CATEGORIES[item.category];

  return (
    <tr className="group border-b border-zinc-800/30 transition-colors">
      <td className="py-3 px-0 min-w-[220px]">
        <div className="flex items-center gap-3">
          <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${categoryInfo.bgColor} ${categoryInfo.color}`}>
            {categoryInfo.icon}
          </div>
          <div className="relative flex-1">
            <select 
              value={item.roleId || ''} 
              onChange={handleRoleChange}
              className="w-full bg-zinc-800/30 text-sm text-zinc-300 rounded-lg pl-3 pr-8 py-2.5 border border-zinc-700/30 appearance-none focus:ring-1 focus:ring-zinc-500 outline-none"
            >
              <option value="" disabled>選擇職位...</option>
              {rates.map(r => <option key={r.id} value={r.id}>{r.roleName}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
          </div>
        </div>
      </td>
      
      <td className="py-3 px-4">
        <input 
          type="text" 
          value={item.remark}
          onChange={(e) => onUpdate(item.id, { remark: e.target.value })}
          className="w-full bg-zinc-800/20 border border-zinc-800/50 rounded-lg px-4 py-2.5 text-xs text-zinc-400 focus:ring-1 focus:ring-zinc-600 outline-none placeholder:text-zinc-800"
          placeholder="備註..."
        />
      </td>

      <td className="py-3 px-2 w-32">
        <div className="bg-zinc-900/50 rounded-lg px-3 py-2.5 text-right border border-zinc-800/30">
          <span className="text-xs font-mono text-zinc-300">{item.dailyCost.toLocaleString()}</span>
        </div>
      </td>

      <td className="py-3 px-2 w-36">
        <div className="flex items-center bg-zinc-800/30 border border-zinc-800/50 rounded-lg overflow-hidden h-[42px] relative z-10">
          <input 
            type="number" 
            value={item.estimatedDays === 0 ? '' : item.estimatedDays}
            onFocus={(e) => e.target.select()}
            onChange={(e) => {
              const val = e.target.value === '' ? 0 : Number(e.target.value);
              onUpdate(item.id, { estimatedDays: val });
            }}
            className="w-full bg-transparent border-none text-center text-sm font-bold text-white focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="0"
          />
          <div className="flex flex-col border-l border-zinc-800 no-print">
            <button onClick={() => adjustDays(1)} className="px-2 flex-1 hover:bg-zinc-700 text-zinc-600 hover:text-white transition-colors border-b border-zinc-800"><Plus size={10}/></button>
            <button onClick={() => adjustDays(-1)} className="px-2 flex-1 hover:bg-zinc-700 text-zinc-600 hover:text-white transition-colors"><Minus size={10}/></button>
          </div>
        </div>
      </td>

      <td className="py-3 px-2 w-40 text-right">
        <div className="bg-zinc-900/80 rounded-lg px-4 py-2.5 text-right border border-zinc-800/50">
          <span className="mono text-sm font-black text-white">
            {(item.dailyCost * item.estimatedDays).toLocaleString()}
          </span>
        </div>
      </td>

      <td className="py-3 pl-4 pr-0 w-10 text-right no-print">
        <button 
          onClick={() => onDelete(item.id)}
          className="text-zinc-800 hover:text-red-500 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
};

export default ItemRow;
