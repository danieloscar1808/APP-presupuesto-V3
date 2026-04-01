import { create } from "zustand";

type ConfigState = {
  alicuota: number;
};

export const useConfigStore = create<ConfigState>(() => ({
  alicuota: 0.035,
}));