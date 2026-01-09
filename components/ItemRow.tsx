
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Trash2, ChevronDown, Minus, Plus, X, Check } from 'lucide-react';
import { ServiceItem, RateItem } from '../types';
import { CATEGORIES, ICON_REGISTRY, COLOR_PALETTE } from '../constants';

interface ItemRowProps {
  item: ServiceItem;
  rates: RateItem[];
  onUpdate: (id: string, updates: Partial<ServiceItem>) => void;
  onDelete: (id: string) => void;
}

const ItemRow: React.FC<ItemRowProps> = ({ item, rates, onUpdate, onDelete }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerPos, setPickerPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // 實時計算彈窗位置，確保其永遠出現在按鈕正下方並浮於最上層
  useLayoutEffect(() => {
    if (showPicker && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPickerPos({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX
      });
    }
  }, [showPicker]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };
    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', () => setShowPicker(false), { once: true });
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPicker]);

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
  const currentIconName = item.customIcon || categoryInfo.iconName;
  const currentIcon = ICON_REGISTRY[currentIconName] || categoryInfo.icon;
  const currentHex = item.customColor || categoryInfo.hex;
  const currentBgColor = item.customColor ? `${item.customColor}25` : categoryInfo.bgColor;

  return (
    <tr className="group border-b border-zinc-800/50 transition-colors hover:bg-zinc-900/40">
      <td className="py-4 px-8 min-w-[240px]">
        <div className="flex items-center gap-4">
          <button 
            ref={buttonRef}
            onClick={() => setShowPicker(!showPicker)}
            className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-all active:scale-95 border border-white/5 relative z-10`}
            style={{ backgroundColor: currentBgColor, color: currentHex }}
          >
            {currentIcon}
          </button>

          {showPicker && (
            <>
              {/* 使用 fixed 定位確保絕對不會被遮擋 */}
              <div 
                ref={pickerRef}
                className="fixed z-[9999] w-72 bg-zinc-950 border border-zinc-700/50 rounded-[2.5rem] shadow-[0_30px_90px_rgba(0,0,0,0.95)] p-7 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-3xl"
                style={{ 
                  top: `${pickerPos.top}px`, 
                  left: `${pickerPos.left}px`,
                  transformOrigin: 'top left'
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Appearance Settings</span>
                  <button onClick={() => setShowPicker(false)} className="text-zinc-600 hover:text-white transition-colors p-1"><X size={18}/></button>
                </div>
                
                <div className="grid grid-cols-5 gap-3 mb-10">
                  {Object.entries(ICON_REGISTRY).map(([name, icon]) => (
                    <button
                      key={name}
                      onClick={() => onUpdate(item.id, { customIcon: name })}
                      className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all ${currentIconName === name ? 'bg-white text-black scale-110 shadow-xl' : 'bg-zinc-900 text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>

                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 block mb-5">Custom Palette</span>
                <div className="grid grid-cols-4 gap-4">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => onUpdate(item.id, { customColor: c.hex })}
                      className="w-full aspect-square rounded-full flex items-center justify-center transition-all hover:scale-110 relative border border-white/5 shadow-lg"
                      style={{ backgroundColor: c.hex }}
                    >
                      {currentHex === c.hex && <Check size={14} className="text-white drop-shadow-xl" strokeWidth={4} />}
                    </button>
                  ))}
                  <button
                    onClick={() => onUpdate(item.id, { customColor: undefined, customIcon: undefined })}
                    className="w-full aspect-square rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all text-[8px] font-black uppercase leading-tight text-center"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="relative flex-1">
            <select 
              value={item.roleId || ''} 
              onChange={handleRoleChange}
              className="w-full bg-zinc-800/40 text-sm font-bold text-zinc-100 rounded-xl pl-4 pr-10 py-3 border border-zinc-700/50 appearance-none focus:ring-1 focus:ring-zinc-400 outline-none hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <option value="" disabled className="bg-black text-zinc-500">選擇職位 Role...</option>
              {rates.map(r => <option key={r.id} value={r.id} className="bg-black text-white">{r.roleName}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none group-hover:text-white transition-colors" />
          </div>
        </div>
      </td>
      
      <td className="py-4 px-4">
        <input 
          type="text" 
          value={item.remark}
          onChange={(e) => onUpdate(item.id, { remark: e.target.value })}
          className="w-full bg-zinc-800/20 border border-zinc-800/50 rounded-xl px-4 py-3 text-xs text-zinc-200 focus:ring-1 focus:ring-zinc-500 outline-none placeholder:text-zinc-700 hover:border-zinc-700 transition-all"
          placeholder="製作細節備註..."
        />
      </td>

      <td className="py-4 px-3 w-32 text-right">
        <div className="bg-zinc-900/50 rounded-xl px-4 py-3 text-right border border-zinc-800/50 group-hover:border-zinc-700 transition-colors">
          <span className="text-xs font-black font-mono text-zinc-100">{item.dailyCost.toLocaleString()}</span>
        </div>
      </td>

      <td className="py-4 px-3 w-36">
        <div className="flex items-center bg-zinc-800/40 border border-zinc-800/50 rounded-xl overflow-hidden h-[46px] relative z-10 hover:border-zinc-600 transition-all shadow-inner">
          <input 
            type="number" 
            value={item.estimatedDays === 0 ? '' : item.estimatedDays}
            onFocus={(e) => e.target.select()}
            onChange={(e) => {
              const val = e.target.value === '' ? 0 : Number(e.target.value);
              onUpdate(item.id, { estimatedDays: val });
            }}
            className="w-full bg-transparent border-none text-center text-sm font-black text-white focus:ring-0"
            placeholder="0"
          />
          <div className="flex flex-col border-l border-zinc-800 no-print">
            <button onClick={() => adjustDays(1)} className="px-2.5 flex-1 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors border-b border-zinc-800"><Plus size={10}/></button>
            <button onClick={() => adjustDays(-1)} className="px-2.5 flex-1 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"><Minus size={10}/></button>
          </div>
        </div>
      </td>

      <td className="py-4 px-3 w-40 text-right">
        <div className="bg-zinc-900/80 rounded-xl px-5 py-3 text-right border border-zinc-800 group-hover:border-zinc-600 transition-all">
          <span className="mono text-sm font-black text-white">
            {(item.dailyCost * item.estimatedDays).toLocaleString()}
          </span>
        </div>
      </td>

      <td className="py-4 pl-4 pr-8 w-10 text-right no-print">
        <button 
          onClick={() => onDelete(item.id)}
          className="text-zinc-500 hover:text-red-400 transition-all p-2 hover:bg-red-500/10 rounded-xl active:scale-90"
        >
          <Trash2 size={18} />
        </button>
      </td>
    </tr>
  );
};

export default ItemRow;
