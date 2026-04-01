import { create } from "zustand";

type Factura = {
  id: string;
  fecha: string;
  total: number;

  numero?: number;
  puntoVenta?: number;
  cae?: string;
  vencimientoCae?: string;

  estado: "facturado" | "cancelado";

  facturaAsociada?: number; // para nota de crédito

  synced?: boolean;
};

type FacturasState = {
  facturas: Factura[];

  // Registrar factura emitida desde budget
  registrarFactura: (factura: Factura) => void;

  // Marcar como cancelada (nota de crédito)
  cancelarFactura: (numeroFactura: number, notaCredito: any) => void;

  // Sync futuro
  syncPendientes: () => Promise<void>;
};

export const useFacturasStore = create<FacturasState>((set, get) => ({
  facturas: [],

  // 🔹 Se llama después de emitir factura desde backend
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

  // 🔹 Se llama después de cancelar (nota de crédito)
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

  // 🔹 Preparado para futuro (no obligatorio ahora)
  syncPendientes: async () => {
    const pendientes = get().facturas.filter((f) => !f.synced);

    for (const factura of pendientes) {
      try {
        await fetch(
          "https://facturacion-server-backend.onrender.com/api/facturas/sync",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ factura }),
          }
        );

        set((state) => ({
          facturas: state.facturas.map((f) =>
            f.id === factura.id ? { ...f, synced: true } : f
          ),
        }));
      } catch (error) {
        console.error("Error sync factura", factura.id);
      }
    }
  },
}));