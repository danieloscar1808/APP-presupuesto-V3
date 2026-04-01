import { create } from "zustand";

type Factura = {
  id: string;
  fecha: string;
  total: number;
};

type FacturasState = {
  facturas: Factura[];
  agregarFactura: (f: Factura) => void;
};

export const useFacturasStore = create<FacturasState>((set) => ({
  facturas: [],

  agregarFactura: (factura) =>
    set((state) => ({
      facturas: [...state.facturas, factura],
    })),
}));