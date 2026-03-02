import Dexie, { Table } from "dexie";

// Tipos de datos
export interface Perfil {
  id?: number;
  nombre: string;
  telefono: string;
  email: string;
}

export interface Cliente {
  id?: number;
  nombre: string;
  telefono: string;
  direccion?: string;
}

export interface Presupuesto {
  id?: number;
  clienteId: number;
  items: any[];
  total: number;
  fecha: string;
}

export interface ItemCatalogo {
  id?: number;
  nombre: string;
  precio: number;
}

// Base de datos Dexie
export class AppDB extends Dexie {
  perfil!: Table<Perfil, number>;
  clientes!: Table<Cliente, number>;
  presupuestos!: Table<Presupuesto, number>;
  catalogo!: Table<ItemCatalogo, number>;

  constructor() {
    super("PresupuestoDB");

    this.version(1).stores({
      perfil: "++id",
      clientes: "++id, nombre",
      presupuestos: "++id, clienteId",
      catalogo: "++id, nombre"
    });
  }
}

export const db = new AppDB();