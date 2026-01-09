
import React from 'react';
import { 
  Palette, 
  Clapperboard, 
  Scissors, 
  Music, 
  Briefcase, 
  PlusCircle,
  Camera,
  Layers,
  Zap,
  PenTool,
  Monitor,
  Video,
  Mic,
  Settings
} from 'lucide-react';
import { RateItem, ServiceItem, CategoryType } from './types';

// Registry of available icons for the picker
export const ICON_REGISTRY: Record<string, React.ReactNode> = {
  'Palette': <Palette size={16} />,
  'Clapperboard': <Clapperboard size={16} />,
  'Scissors': <Scissors size={16} />,
  'Music': <Music size={16} />,
  'Briefcase': <Briefcase size={16} />,
  'PlusCircle': <PlusCircle size={16} />,
  'Camera': <Camera size={16} />,
  'Layers': <Layers size={16} />,
  'Zap': <Zap size={16} />,
  'PenTool': <PenTool size={16} />,
  'Monitor': <Monitor size={16} />,
  'Video': <Video size={16} />,
  'Mic': <Mic size={16} />,
  'Settings': <Settings size={16} />
};

export const COLOR_PALETTE = [
  { name: 'Pink', hex: '#ec4899', bg: 'bg-pink-500/10' },
  { name: 'Blue', hex: '#3b82f6', bg: 'bg-blue-500/10' },
  { name: 'Purple', hex: '#a855f7', bg: 'bg-purple-500/10' },
  { name: 'Green', hex: '#22c55e', bg: 'bg-green-500/10' },
  { name: 'Yellow', hex: '#eab308', bg: 'bg-yellow-500/10' },
  { name: 'Red', hex: '#ef4444', bg: 'bg-red-500/10' },
  { name: 'Cyan', hex: '#06b6d4', bg: 'bg-cyan-500/10' },
  { name: 'Gray', hex: '#94a3b8', bg: 'bg-gray-400/10' },
];

export const CATEGORIES: Record<CategoryType, { label: string; icon: React.ReactNode; iconName: string; color: string; bgColor: string; hex: string }> = {
  '創意策略': { label: '創意策略', icon: <Palette size={16} />, iconName: 'Palette', color: 'text-pink-500', bgColor: 'bg-pink-500/10', hex: '#ec4899' },
  '動態製作': { label: '動態製作', icon: <Clapperboard size={16} />, iconName: 'Clapperboard', color: 'text-blue-500', bgColor: 'bg-blue-500/10', hex: '#3b82f6' },
  '後期剪輯': { label: '後期剪輯', icon: <Scissors size={16} />, iconName: 'Scissors', color: 'text-purple-500', bgColor: 'bg-purple-500/10', hex: '#a855f7' },
  '音效製作': { label: '音效製作', icon: <Music size={16} />, iconName: 'Music', color: 'text-green-500', bgColor: 'bg-green-500/10', hex: '#22c55e' },
  '專案管理': { label: '專案管理', icon: <Briefcase size={16} />, iconName: 'Briefcase', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', hex: '#eab308' },
  '其他': { label: '其他', icon: <PlusCircle size={16} />, iconName: 'PlusCircle', color: 'text-gray-400', bgColor: 'bg-gray-400/10', hex: '#94a3b8' },
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
