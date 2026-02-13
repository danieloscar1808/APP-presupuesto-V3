import { Profile, Client, Budget, CatalogItem } from '@/types';

const STORAGE_KEYS = {
  PROFILE: 'presupuestos_profile',
  CLIENTS: 'presupuestos_clients',
  BUDGETS: 'presupuestos_budgets',
  CATALOG: 'presupuestos_catalog',
};

// Profile
export const getProfile = (): Profile | null => {
  const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
  return data ? JSON.parse(data) : null;
};

export const saveProfile = (profile: Profile): void => {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
};

// Clients
export const getClients = (): Client[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
  return data ? JSON.parse(data) : [];
};

export const saveClient = (client: Client): void => {
  const clients = getClients();
  const existingIndex = clients.findIndex(c => c.id === client.id);
  
  if (existingIndex >= 0) {
    clients[existingIndex] = client;
  } else {
    clients.push(client);
  }
  
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
};

export const deleteClient = (id: string): void => {
  const clients = getClients().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
};

export const getClientById = (id: string): Client | undefined => {
  return getClients().find(c => c.id === id);
};

// Budgets
export const getBudgets = (): Budget[] => {
  const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
  return data ? JSON.parse(data) : [];
};

export const saveBudget = (budget: Budget): void => {
  const budgets = getBudgets();
  const existingIndex = budgets.findIndex(b => b.id === budget.id);
  
  if (existingIndex >= 0) {
    budgets[existingIndex] = budget;
  } else {
    budgets.push(budget);
  }
  
  localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
};

export const deleteBudget = (id: string): void => {
  const budgets = getBudgets().filter(b => b.id !== id);
  localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
};

export const getBudgetById = (id: string): Budget | undefined => {
  return getBudgets().find(b => b.id === id);
};

export const updateBudgetStatus = (id: string, status: Budget['status']): void => {
  const budgets = getBudgets();
  const budget = budgets.find(b => b.id === id);
  if (budget) {
    budget.status = status;
    if (status === 'sent') {
      budget.sentAt = new Date().toISOString();
    }
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  }
};

// Catalog
export const getCatalogItems = (): CatalogItem[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CATALOG);
  return data ? JSON.parse(data) : [];
};

export const saveCatalogItem = (item: CatalogItem): void => {
  const items = getCatalogItems();
  const existingIndex = items.findIndex(i => i.id === item.id);
  
  if (existingIndex >= 0) {
    items[existingIndex] = item;
  } else {
    items.push(item);
  }
  
  localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(items));
};

export const deleteCatalogItem = (id: string): void => {
  const items = getCatalogItems().filter(i => i.id !== id);
  localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(items));
};

export const getCatalogItemByName = (name: string): CatalogItem | undefined => {
  return getCatalogItems().find(i => i.name.toLowerCase() === name.toLowerCase());
};
