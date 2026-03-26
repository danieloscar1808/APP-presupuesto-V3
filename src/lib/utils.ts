import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

//Generación de numero de presupuestos ascendente
export function generarNumeroAFIP(tipo: "factura" | "nc") {
  const puntoVenta = "00001";

  const key = tipo === "factura" ? "factura_numero" : "nc_numero";

  const ultimo = Number(localStorage.getItem(key) || 0);
  const nuevo = ultimo + 1;

  localStorage.setItem(key, String(nuevo));

  const numeroComprobante = String(nuevo).padStart(8, "0");

  return {
    puntoVenta,
    numero: numeroComprobante,
    numeroCompleto: `${puntoVenta}-${numeroComprobante}`
  };
}