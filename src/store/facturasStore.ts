import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useFacturasStore = create<FacturasState>()(
  persist(
    (set, get) => ({
      facturas: [],

      registrarFactura: (factura) =>
        set((state) => ({
          facturas: [
            ...state.facturas,
            {
              ...factura,
              estado: "facturado",
              synced: true,
            },
          ],
        })),

      cancelarFactura: (numeroFactura, notaCredito) =>
        set((state) => ({
          facturas: state.facturas.map((f) =>
            f.numero === numeroFactura
              ? {
                  ...f,
                  estado: "cancelado",
                  facturaAsociada: notaCredito.numero,
                  synced: true,
                }
              : f
          ),
        })),

      syncPendientes: async () => {},
    }),
    {
      name: "facturas-storage", // 🔥 CLAVE
    }
  )
);