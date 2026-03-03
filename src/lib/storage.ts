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
      profile: '&id',       // clave fija
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
  return await db.profile.get("profile") || null;
};

export const saveProfile = async (profile: Profile): Promise<void> => {
  profile.id = "profile";  // clave fija
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

export const getCatalogItemByName = async (name: string): Promise<CatalogItem | undefined> => {
  const items = await db.catalog.toArray();
  return items.find(i => i.name.toLowerCase() === name.toLowerCase());
};

// -----------------------------------------------------
// BACKUP
// -----------------------------------------------------
export async function generateBackup(): Promise<any> {
  const profile = await getProfile();
  const clients = await getClients();
  const budgets = await getBudgets();
  const catalog = await getCatalogItems();

  const backup = {
    profile,
    clients,
    budgets,
    catalog,
    timestamp: new Date().toISOString(),
  };

  localStorage.setItem("lastBackup", JSON.stringify(backup));

  return backup;
}

// -----------------------------------------------------
// IMPORTAR BACKUP (FUNCIONA 100%)
// -----------------------------------------------------
export async function importBackup(backup: any): Promise<void> {
  console.log(">>> IMPORT BACKUP INICIADO");
  console.log("Backup recibido:", backup);

  if (!backup) {
    console.error("Backup vacío");
    return;
  }

  // 1. Limpiar todas las tablas
  await db.profile.clear();
  await db.clients.clear();
  await db.budgets.clear();
  await db.catalog.clear();

  // 2. Restaurar Perfil (id fijo)
  if (backup.profile) {
    const fixedProfile = { ...backup.profile, id: "profile" };
    console.log("Restaurando perfil:", fixedProfile);
    await db.profile.put(fixedProfile);
  }

  // 3. Restaurar clientes
  if (Array.isArray(backup.clients)) {
    console.log("Restaurando clientes:", backup.clients.length);
    for (const c of backup.clients) {
      if (c.id) await db.clients.put(c);
    }
  }

  // 4. Restaurar presupuestos
  if (Array.isArray(backup.budgets)) {
    console.log("Restaurando presupuestos:", backup.budgets.length);
    for (const b of backup.budgets) {
      if (b.id) await db.budgets.put(b);
    }
  }

  // 5. Restaurar catálogo
  if (Array.isArray(backup.catalog)) {
    console.log("Restaurando items catálogo:", backup.catalog.length);
    for (const item of backup.catalog) {
      if (item.id) await db.catalog.put(item);
    }
  }

  console.log(">>> IMPORT TERMINADO");
}