import { create } from "zustand";

type Retencion = {
  fecha: string;
  monto: number;
};

type RetencionesState = {
  retenciones: Retencion[];
  agregarRetencion: (r: Retencion) => void;
};

export const useRetencionesStore = create<RetencionesState>((set) => ({
  retenciones: [],

  agregarRetencion: (retencion) =>
    set((state) => ({
      retenciones: [...state.retenciones, retencion],
    })),
}));