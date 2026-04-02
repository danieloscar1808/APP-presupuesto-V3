import { create } from "zustand";
import { persist } from "zustand/middleware";

type ResumenImpositivo = {
  totalFacturado: number;
  iibb: number;
  retenciones: number;
  saldo: number;
};

type EstadoMes = {
  mes: number;
  anio: number;
  cerrado: boolean;
  fecha: string; // 👉 agregado
  snapshot: ResumenImpositivo;
};

type TaxState = {
  cierres: EstadoMes[];

  cerrarMes: (
    mes: number,
    anio: number,
    resumen: ResumenImpositivo
  ) => void;

  obtenerEstadoMes: (mes: number, anio: number) => EstadoMes | undefined;
};

export const useTaxStore = create<TaxState>()(
  persist(
    (set, get) => ({
      cierres: [],

      cerrarMes: (mes, anio, resumen) => {
        const existe = get().cierres.find(
          (c) => c.mes === mes && c.anio === anio
        );

        if (existe) return;

        const nuevo: EstadoMes = {
          mes,
          anio,
          cerrado: true,
          fecha: new Date().toISOString(), // 👉 importante
          snapshot: resumen,
        };

        set((state) => ({
          cierres: [...state.cierres, nuevo],
        }));
      },

      obtenerEstadoMes: (mes, anio) => {
        return get().cierres.find(
          (c) => c.mes === mes && c.anio === anio
        );
      },
    }),
    {
      name: "tax-storage", // 👉 guarda en localStorage
    }
  )
);