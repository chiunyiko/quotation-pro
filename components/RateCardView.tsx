
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
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black tracking-tight flex items-center gap-4"><Users className="text-zinc-800" /> RATE CARD</h2>
        <Button onClick={addRate} icon={<Plus size={18}/>}>Add Role</Button>
      </div>
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-900 text-[10px] font-black uppercase text-zinc-600 border-b border-zinc-800">
            <tr>
              <th className="py-4 px-8">Role Name</th>
              <th className="py-4 px-4 w-48">Category</th>
              <th className="py-4 px-4 text-right w-48">Standard Rate</th>
              <th className="w-16"></th>
            </tr>
          </thead>
          <tbody>
            {rates.map(r => (
              <tr key={r.id} className="border-b border-zinc-900 hover:bg-zinc-900/20 transition-colors">
                <td className="py-4 px-8"><input value={r.roleName} onChange={e => onUpdateRates(rates.map(x => x.id === r.id ? {...x, roleName: e.target.value} : x))} className="bg-transparent border-none w-full font-bold focus:ring-0" /></td>
                <td className="py-4 px-4">
                  <select value={r.category} onChange={e => onUpdateRates(rates.map(x => x.id === r.id ? {...x, category: e.target.value as CategoryType} : x))} className="bg-zinc-950/50 border border-zinc-800 rounded-lg px-2 py-1 text-xs outline-none">
                    {Object.keys(CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </td>
                <td className="py-4 px-4 text-right font-mono font-bold"><input type="number" value={r.price} onChange={e => onUpdateRates(rates.map(x => x.id === r.id ? {...x, price: Number(e.target.value)} : x))} className="bg-transparent border-none text-right focus:ring-0 w-24" /></td>
                <td className="py-4 pr-8 text-right"><button onClick={() => onUpdateRates(rates.filter(x => x.id !== r.id))} className="text-zinc-800 hover:text-red-500 transition-colors"><Trash2 size={16}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RateCardView;
