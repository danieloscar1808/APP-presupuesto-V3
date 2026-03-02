import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

//Generación de numero de presupuestos ascendente
function generarNumeroPresupuesto() {
  // Fecha actual
  const ahora = new Date();
  const year = ahora.getFullYear();
  const month = String(ahora.getMonth() + 1).padStart(2, "0");

  // Clave por año-mes
  const key = `${year}${month}`;

  // Obtener valor guardado (por ej. localStorage)
  const ultimo = Number(localStorage.getItem(`presupuesto_${key}`) || 0);

  // Nuevo número secuencial
  const nuevo = ultimo + 1;

  // Guardarlo
  localStorage.setItem(`presupuesto_${key}`, String(nuevo));

  // Formato final => AAAAMM-XXX
  return `${key}-${String(nuevo).padStart(3, "0")}`;
}