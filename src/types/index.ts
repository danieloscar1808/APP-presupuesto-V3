export type BudgetCategory = 'ac' | 'electric' | 'solar';

export interface CatalogItem {
  id: string;
  name: string;
  price: number;
  category?: BudgetCategory | 'general';
  createdAt: string;
}

export interface Profile {
  id: string;
  name: string;
  businessName: string;
  taxId: string;
  phone: string;
  email: string;
  address: string;
  logo?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
}

export interface BudgetItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Budget {
  id: string;
  clientId: string;
  clientName: string;
  category: BudgetCategory;
  items: BudgetItem[];
  laborCost: number;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  notes: string;
  validityDays: number;
  warranty: string;
  paymentTerms: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  createdAt: string;
  sentAt?: string;
   // AC Equipment Data
   acEquipment?: {
     capacity: string;
     technology: string;
     status: string;
   };
   // Solar System Data
   solarSystem?: {
     systemType: string;
     panelType: string;
     panelPower: string;
     quantity: number;
     totalPower: number;
   };
}

// AC Specific
export interface ACDetails {
  capacity: string; // Frigorias
  pipeMeters: number;
  installationKit: boolean;
  brackets: boolean;
  heightWork: boolean;
  drainKit: boolean;
}

// Electric Specific
export interface ElectricDetails {
  outlets: number;
  cableMeters: number;
  panelReplacement: boolean;
  breakers: number;
  conduits: boolean;
  groundingSystem: boolean;
}

// Solar Specific
export interface SolarDetails {
  panelCount: number;
  panelWatts: number;
  inverterType: string;
  mountingStructure: string;
  batteryBank: boolean;
  batteryCapacity?: number;
  dcProtection: boolean;
  acProtection: boolean;
}

export const CATEGORY_LABELS: Record<BudgetCategory, string> = {
  ac: 'Aire Acondicionado Split',
  electric: 'Instalacion Electrica',
  solar: 'Sistema Fotovoltaico',
};

export const CATEGORY_COLORS: Record<BudgetCategory, string> = {
  ac: 'badge-ac',
  electric: 'badge-electric',
  solar: 'badge-solar',
};
