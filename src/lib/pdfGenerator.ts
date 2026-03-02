import { jsPDF } from "jspdf";
import { Budget, Profile } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/* Utilidad para clases */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* Generación número de presupuesto */
export function generarNumeroPresupuesto() {
  const ahora = new Date();
  const year = ahora.getFullYear();
  const month = String(ahora.getMonth() + 1).padStart(2, "0");
  const key = `${year}${month}`;
  const ultimo = Number(localStorage.getItem(`presupuesto_${key}`) || 0);
  const nuevo = ultimo + 1;
  localStorage.setItem(`presupuesto_${key}`, String(nuevo));
  return `${key}-${String(nuevo).padStart(3, "0")}`;
}

/* ✔ FUNCIÓN que ShareOptions necesita */
export async function downloadPDF(budget: Budget, profile: Profile) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(`Presupuesto #${budget.number}`, 10, 15);

  doc.setFontSize(12);
  doc.text(`Cliente: ${budget.clientName}`, 10, 30);
  doc.text(`Fecha: ${new Date(budget.createdAt).toLocaleDateString("es-AR")}`, 10, 37);

  doc.text("Detalle:", 10, 50);

  let y = 58;
  budget.items.forEach((item) => {
    doc.text(
      `${item.quantity}x ${item.description} - $${item.total.toLocaleString("es-AR")}`,
      10,
      y
    );
    y += 7;
  });

  y += 10;
  doc.text(`Subtotal: $${budget.subtotal.toLocaleString("es-AR")}`, 10, y);
  y += 7;
  doc.text(`Mano de obra: $${budget.laborCost.toLocaleString("es-AR")}`, 10, y);
  y += 7;
  doc.text(`IVA: $${budget.taxAmount.toLocaleString("es-AR")}`, 10, y);
  y += 7;

  doc.setFontSize(14);
  doc.text(`TOTAL: $${budget.total.toLocaleString("es-AR")}`, 10, y + 10);

  doc.save(`presupuesto-${budget.number}.pdf`);
}