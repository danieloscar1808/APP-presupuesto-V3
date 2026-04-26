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
      profile: '&id',
      clients: 'id, name',
      budgets: 'id, clientId',
      catalog: 'id, name',
    });
  }
}

export const db = new AppDB();

// -----------------------------------------------------
// PROFILE
// -----------------------------------------------------
export const getProfile = async (): Promise<Profile | null> => {
  return (await db.profile.get('profile')) || null;
};

export const saveProfile = async (profile: Profile): Promise<void> => {
  profile.id = 'profile';
  await db.profile.put(profile);
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

export const getClientById = async (
  id: string
): Promise<Client | undefined> => {
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

export const getBudgetById = async (
  id: string
): Promise<Budget | undefined> => {
  return await db.budgets.get(id);
};

export const updateBudgetStatus = async (
  id: string,
  status: Budget['status']
): Promise<void> => {
  const budget = await db.budgets.get(id);
  if (!budget) return;

  // Bloqueo global
  if (
    budget.status === 'facturado' ||
    budget.status === 'cancelado' ||
    budget.status === 'listo_para_facturar'
  ) {
    console.warn('No se puede modificar este presupuesto en este estado');
    return;
  }

  budget.status = status;

  if (status === 'sent') {
    budget.sentAt = new Date().toISOString();
  }

  await db.budgets.put(budget);
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

export const getCatalogItemByName = async (
  name: string
): Promise<CatalogItem | undefined> => {
  const items = await db.catalog.toArray();
  return items.find((item) => item.name.toLowerCase() === name.toLowerCase());
};

const LABOR_KEY = 'catalog_labor';

// -------------------------------
// OBTENER MANO DE OBRA
// -------------------------------
export const getLaborItems = async (): Promise<CatalogItem[]> => {
  const data = localStorage.getItem(LABOR_KEY);
  return data ? JSON.parse(data) : [];
};

// -------------------------------
// GUARDAR MANO DE OBRA
// -------------------------------
export const saveLaborItem = async (item: CatalogItem) => {
  const items = await getLaborItems();
  const existingIndex = items.findIndex((existing) => existing.id === item.id);

  if (existingIndex >= 0) {
    items[existingIndex] = item;
  } else {
    items.push(item);
  }

  localStorage.setItem(LABOR_KEY, JSON.stringify(items));
};

// -------------------------------
// ELIMINAR MANO DE OBRA
// -------------------------------
export const deleteLaborItem = async (id: string) => {
  const items = await getLaborItems();
  const updated = items.filter((item) => item.id !== id);

  localStorage.setItem(LABOR_KEY, JSON.stringify(updated));
};

// -----------------------------------------------------
// BACKUP
// -----------------------------------------------------
export async function generateBackup(): Promise<any> {
  const profile = await getProfile();
  const clients = await getClients();
  const budgets = await getBudgets();
  const catalog = await getCatalogItems();
  const laborCatalog = await getLaborItems();

  const backup = {
    profile,
    clients,
    budgets,
    catalog,
    laborCatalog,
    timestamp: new Date().toISOString(),
  };

  localStorage.setItem('lastBackup', JSON.stringify(backup));

  return backup;
}

// -----------------------------------------------------
// IMPORTAR BACKUP
// -----------------------------------------------------
export async function importBackup(backup: any): Promise<void> {
  console.log('>>> IMPORT BACKUP INICIADO');
  console.log('Backup recibido:', backup);

  if (!backup) {
    console.error('Backup vacio');
    return;
  }

  // 1. Limpiar todas las tablas
  await db.profile.clear();
  await db.clients.clear();
  await db.budgets.clear();
  await db.catalog.clear();
  localStorage.removeItem(LABOR_KEY);

  // 2. Restaurar perfil
  if (backup.profile) {
    const fixedProfile = { ...backup.profile, id: 'profile' };
    console.log('Restaurando perfil:', fixedProfile);
    await db.profile.put(fixedProfile);
  }

  // 3. Restaurar clientes
  if (Array.isArray(backup.clients)) {
    console.log('Restaurando clientes:', backup.clients.length);
    for (const client of backup.clients) {
      if (client.id) await db.clients.put(client);
    }
  }

  // 4. Restaurar presupuestos
  if (Array.isArray(backup.budgets)) {
    console.log('Restaurando presupuestos:', backup.budgets.length);
    for (const budget of backup.budgets) {
      if (budget.id) await db.budgets.put(budget);
    }
  }

  // 5. Restaurar catalogo de materiales
  if (Array.isArray(backup.catalog)) {
    console.log('Restaurando items catalogo:', backup.catalog.length);
    for (const item of backup.catalog) {
      if (item.id) await db.catalog.put(item);
    }
  }

  // 6. Restaurar catalogo de mano de obra
  if (Array.isArray(backup.laborCatalog)) {
    console.log('Restaurando mano de obra:', backup.laborCatalog.length);
    localStorage.setItem(LABOR_KEY, JSON.stringify(backup.laborCatalog));
  }

  console.log('>>> IMPORT TERMINADO');
}
