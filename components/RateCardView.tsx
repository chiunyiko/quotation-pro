
import React from 'react';
import { Plus, Trash2, Users } from 'lucide-react';
import { RateItem, CategoryType } from '../types';
import { CATEGORIES } from '../constants';
import { generateId } from '../utils/idUtils';
import Button from './Button';

interface RateCardViewProps {
  rates: RateItem[];
  onUpdateRates: (rates: RateItem[]) => void;
}

const RateCardView: React.FC<RateCardViewProps> = ({ rates, onUpdateRates }) => {
  const addRate = () => {
    const newRate: RateItem = { id: generateId(), roleName: 'New Role', category: '其他', price: 0 };
    onUpdateRates([...rates, newRate]);
  };

  return (
    <div className="max-w-5xl mx-auto py-12 space-y-12 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <h2 className="text-4xl font-black tracking-tighter flex items-center gap-5 text-white italic">
          <Users className="text-zinc-400" size={36} /> RATE CARD
        </h2>
        <Button onClick={addRate} icon={<Plus size={18}/>} className="rounded-2xl px-6 py-4 font-black uppercase tracking-widest text-xs">Add New Role</Button>
      </div>
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-zinc-900 text-[10px] font-black uppercase text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="py-6 px-10 tracking-[0.2em]">Role Name</th>
              <th className="py-6 px-4 w-48 tracking-[0.2em]">Category</th>
              <th className="py-6 px-4 text-right w-48 tracking-[0.2em]">Standard Rate</th>
              <th className="w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {rates.map(r => (
              <tr key={r.id} className="hover:bg-zinc-900/60 transition-colors group">
                <td className="py-5 px-10">
                  <input 
                    value={r.roleName} 
                    onChange={e => onUpdateRates(rates.map(x => x.id === r.id ? {...x, roleName: e.target.value} : x))} 
                    className="bg-transparent border-none w-full font-black text-zinc-100 focus:ring-0 text-base placeholder:text-zinc-700" 
                    placeholder="Enter Role Name..."
                  />
                </td>
                <td className="py-5 px-4">
                  <select 
                    value={r.category} 
                    onChange={e => onUpdateRates(rates.map(x => x.id === r.id ? {...x, category: e.target.value as CategoryType} : x))} 
                    className="bg-zinc-950/80 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs font-bold outline-none text-zinc-200 focus:border-zinc-400 transition-colors"
                  >
                    {Object.keys(CATEGORIES).map(c => <option key={c} value={c} className="bg-black text-white">{c}</option>)}
                  </select>
                </td>
                <td className="py-5 px-4 text-right">
                  <div className="flex items-center justify-end gap-2 bg-zinc-950/40 border border-zinc-800 rounded-xl px-4 py-2 font-mono font-black text-zinc-100 group-hover:border-zinc-700 transition-colors">
                    <span className="text-zinc-500 text-[10px] font-bold">$</span>
                    <input 
                      type="number" 
                      value={r.price} 
                      onChange={e => onUpdateRates(rates.map(x => x.id === r.id ? {...x, price: Number(e.target.value)} : x))} 
                      className="bg-transparent border-none text-right focus:ring-0 w-28 p-0" 
                    />
                  </div>
                </td>
                <td className="py-5 pr-10 text-right">
                  <button 
                    onClick={() => onUpdateRates(rates.filter(x => x.id !== r.id))} 
                    className="text-zinc-600 hover:text-red-400 transition-all p-3 hover:bg-red-500/10 rounded-xl active:scale-90"
                  >
                    <Trash2 size={20}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RateCardView;
