import { create } from "zustand";

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
  snapshot?: ResumenImpositivo;
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

export const useTaxStore = create<TaxState>((set, get) => ({
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
}));