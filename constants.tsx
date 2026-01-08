
import React from 'react';
import { 
  Palette, 
  Clapperboard, 
  Scissors, 
  Music, 
  Briefcase, 
  PlusCircle
} from 'lucide-react';
import { RateItem, ServiceItem, CategoryType } from './types';

export const CATEGORIES: Record<CategoryType, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  '創意策略': { label: '創意策略', icon: <Palette size={16} />, color: 'text-pink-500', bgColor: 'bg-pink-500/10' },
  '動態製作': { label: '動態製作', icon: <Clapperboard size={16} />, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  '後期剪輯': { label: '後期剪輯', icon: <Scissors size={16} />, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  '音效製作': { label: '音效製作', icon: <Music size={16} />, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  '專案管理': { label: '專案管理', icon: <Briefcase size={16} />, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  '其他': { label: '其他', icon: <PlusCircle size={16} />, color: 'text-gray-400', bgColor: 'bg-gray-400/10' },
};

export const INITIAL_RATES: RateItem[] = [
  { id: 'r1', roleName: '創意總監 Creative Director', category: '創意策略', price: 8000 },
  { id: 'r2', roleName: '藝術總監 Art Director', category: '創意策略', price: 6000 },
  { id: 'r3', roleName: '專案經理 Project Manager', category: '專案管理', price: 4500 },
  { id: 'r4', roleName: '資深設計師 Senior Designer', category: '動態製作', price: 3500 },
  { id: 'r5', roleName: '3D 動態設計師 3D Artist', category: '動態製作', price: 4000 },
  { id: 'r6', roleName: '2D/VFX 特效師 2D/VFX Artist', category: '後期剪輯', price: 3000 },
];

export const INITIAL_ITEMS: Omit<ServiceItem, 'id'>[] = [
  {
    category: '創意策略',
    name: 'Creative Director',
    remark: '負責前期視覺方向控管',
    dailyCost: 8000,
    estimatedDays: 12
  },
  {
    category: '動態製作',
    name: 'Art Director',
    remark: '負責核心場景美術設計',
    dailyCost: 6000,
    estimatedDays: 45
  }
];
