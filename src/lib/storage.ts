import Dexie, { Table } from 'dexie';
import { Profile, Client, Budget, CatalogItem } from '@/types';

// -----------------------------------------------------
// BASE DE DATOS
// -----------------------------------------------------
class AppDB extends Dexie {
  profile!: Table<Profile, string>;
  clients!: Table<Client, string>;
  budgets!: Table<Budget, string>;
  catalog!: Table<CatalogItem, string>;

  constructor() {
    super('PresupuestoDB');

    this.version(1).stores({
      profile: 'id',
      clients: 'id, name',
      budgets: 'id, clientId',
      catalog: 'id, name'
    });
  }
}

export const db = new AppDB();

// -----------------------------------------------------
// PROFILE
// -----------------------------------------------------
export const getProfile = async (): Promise<Profile | null> => {
  const data = await db.profile.toArray();
  return data[0] || null;
};

export const saveProfile = async (profile: Profile): Promise<void> => {
  await db.profile.clear();
  await db.profile.put(profile, profile.id);
};

// -----------------------------------------------------
// CLIENTS
// -----------------------------------------------------
export const getClients = async (): Promise<Client[]> => {
  return await db.clients.toArray();
};

export const saveClient = async (client: Client): Promise<void> => {
  await db.clients.put(client, client.id);
};

export const deleteClient = async (id: string): Promise<void> => {
  await db.clients.delete(id);
};

export const getClientById = async (id: string): Promise<Client | undefined> => {
  return await db.clients.get(id);
};

// -----------------------------------------------------
// BUDGETS
// -----------------------------------------------------
export const getBudgets = async (): Promise<Budget[]> => {
  return await db.budgets.toArray();
};

export const saveBudget = async (budget: Budget): Promise<void> => {
  await db.budgets.put(budget, budget.id);
};

export const deleteBudget = async (id: string): Promise<void> => {
  await db.budgets.delete(id);
};

export const getBudgetById = async (id: string): Promise<Budget | undefined> => {
  return await db.budgets.get(id);
};

export const updateBudgetStatus = async (id: string, status: Budget['status']): Promise<void> => {
  const budget = await db.budgets.get(id);
  if (!budget) return;

  budget.status = status;
  if (status === 'sent') {
    budget.sentAt = new Date().toISOString();
  }

  await db.budgets.put(budget, id);
};

// -----------------------------------------------------
// CATALOG
// -----------------------------------------------------
export const getCatalogItems = async (): Promise<CatalogItem[]> => {
  return await db.catalog.toArray();
};

export const saveCatalogItem = async (item: CatalogItem): Promise<void> => {
  await db.catalog.put(item, item.id);
};

export const deleteCatalogItem = async (id: string): Promise<void> => {
  await db.catalog.delete(id);
};

export const getCatalogItemByName = async (name: string): Promise<CatalogItem | undefined> => {
  const items = await db.catalog.toArray();
  return items.find(i => i.name.toLowerCase() === name.toLowerCase());
};