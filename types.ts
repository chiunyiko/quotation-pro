
export type CategoryType = '創意策略' | '動態製作' | '後期剪輯' | '音效製作' | '專案管理' | '其他';

export interface ServiceItem {
  id: string;
  roleId?: string;
  category: CategoryType;
  name: string;
  remark: string;
  dailyCost: number;
  estimatedDays: number;
  customIcon?: string; // Icon name from Lucide
  customColor?: string; // Hex color code
}

export interface RateItem {
  id: string;
  roleName: string;
  category: CategoryType;
  price: number;
}

export interface Project {
  id: string;
  user_id?: string;
  projectName: string;
  clientName: string;
  startDate: string;
  endDate: string;
  items: ServiceItem[];
  taxRate: number;
  margin: number;
  updatedAt: number;
}

export interface AIResponseItem {
  name: string;
  description: string;
  category: CategoryType;
  unit: string;
  suggestedQuantity: number;
  suggestedUnitPrice: number;
}
