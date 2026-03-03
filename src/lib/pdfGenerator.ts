import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Budget, Profile, CATEGORY_LABELS } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// LOGO TRANSPARENTE
import logoHeader from "../logo-header.png";

// COLOR CORPORATIVO (ENCABEZADO Y TOTAL)
const HEADER_BLUE: [number, number, number] = [31, 61, 99];

// GENERAR NÚMERO AAAAMM-XXX
const generarNumeroPresupuesto = () => {
  const ahora = new Date();
  const year = ahora.getFullYear();
  const month = String(ahora.getMonth() + 1).padStart(2, "0");

  const key = `${year}${month}`;
  const ultimo = Number(localStorage.getItem(`presupuesto_${key}`) || 0);
  const nuevo = ultimo + 1;

  localStorage.setItem(`presupuesto_${key}`, String(nuevo));

  return `${key}-${String(nuevo).padStart(3, "0")}`;
};

// ======================================
//  GENERADOR PRINCIPAL
// ======================================
export const generateBudgetPDF = (budget: Budget, profile: Profile): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();


  // -----------------------------------------------------
// ENCABEZADO AZUL CON LOGO A LA IZQUIERDA (COLORS OK)
// -----------------------------------------------------
const HEADER_BLUE = { r: 45, g: 69, b: 122 }; // color perfecto del PDF

// Dibujar fondo azul
doc.setFillColor(HEADER_BLUE.r, HEADER_BLUE.g, HEADER_BLUE.b);
doc.rect(0, 0, pageWidth, 40, "F");

// LOGO (mantener proporción automática)
try {
  const logoImg = logoHeader; // importado: import logoHeader from "../assets/logo-header.png";

  // Tamaño recomendado para tu logo
  const logoDisplayWidth = 38; // ancho fijo
  const logoOriginalRatio = 0.55; // proporción aproximada (alto/ancho)

  const logoDisplayHeight = logoDisplayWidth * logoOriginalRatio;

  // Posición clásica del PDF viejo
  const logoX = 10;
  const logoY = (40 - logoDisplayHeight) / 2;

  doc.addImage(
    logoImg,
    "PNG",
    logoX,
    logoY,
    logoDisplayWidth,
    logoDisplayHeight
  );
} catch (err) {
  console.error("Error cargando logo", err);
}

// TÍTULO CENTRADO
doc.setFont("helvetica", "bold");
doc.setFontSize(16);
doc.setTextColor(255, 255, 255);
doc.text(
  "Servicios Integrales de Climatización y Energía",
  pageWidth / 2,
  15,
  { align: "center" }
);

// SUBTÍTULO
doc.setFontSize(11);
doc.text("Presupuesto", pageWidth / 2, 23, {
  align: "center",
});

  // --------------------------------------
  // FECHA - NUMERO DE PRESUPUESTO
  // --------------------------------------
  const numeroPresupuesto = generarNumeroPresupuesto();

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Presupuesto Nº: ${numeroPresupuesto}`, 10, 50);
  doc.text(
    `Fecha: ${format(new Date(budget.createdAt), "d 'de' MMMM, yyyy", {
      locale: es,
    })}`,
    10,
    56
  );

  // --------------------------------------
  // DATOS DEL CLIENTE
  // --------------------------------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  let y = 70;
  doc.setTextColor(0, 0, 0);
  doc.text("Datos del Cliente", 10, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  y += 8;
  doc.text(`Nombre: ${budget.clientName || ""}`, 10, y);

  // --------------------------------------
  // TABLA DE ÍTEMS
  // --------------------------------------
  const body = budget.items.map((item) => [
    String(item.quantity),
    item.description,
    `$${item.unitPrice.toLocaleString("es-AR")}`,
    `$${item.total.toLocaleString("es-AR")}`,
  ]);

  autoTable(doc, {
    startY: y + 10,
    head: [["Cant.", "Descripción", "Precio Unit.", "Total"]],
    body,
    headStyles: {
      fillColor: HEADER_BLUE,
      textColor: 255,
      fontSize: 11,
      halign: "center",
    },
    styles: {
      fontSize: 10,
      halign: "center",
    },
    columnStyles: {
      1: { halign: "left" },
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    margin: { left: 10, right: 10 },
  });

  let finalY = (doc as any).lastAutoTable.finalY + 10;

  // --------------------------------------
  // TOTALES
  // --------------------------------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Resumen de Costos", 10, finalY);
  finalY += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  doc.text(`Subtotal Materiales: $${budget.subtotal.toLocaleString("es-AR")}`, 10, finalY);
  finalY += 6;

  doc.text(`Mano de Obra: $${budget.laborCost.toLocaleString("es-AR")}`, 10, finalY);
  finalY += 6;

  if (budget.taxRate > 0) {
    doc.text(
      `IVA (${budget.taxRate}%): $${budget.taxAmount.toLocaleString("es-AR")}`,
      10,
      finalY
    );
    finalY += 6;
  }

  if (budget.discount > 0) {
    doc.text(`Descuento: -$${budget.discount.toLocaleString("es-AR")}`, 10, finalY);
    finalY += 6;
  }

  // TOTAL CON BARRA AZUL ESTILO ORIGINAL
  doc.setFillColor(...HEADER_BLUE);
  doc.rect(10, finalY + 4, 80, 10, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL", 12, finalY + 11);

  doc.text(
    `$${budget.total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`,
    88,
    finalY + 11
  );

  doc.setTextColor(0, 0, 0);
  finalY += 25;

  // --------------------------------------
  // CONDICIONES
  // --------------------------------------
  doc.setFont("helvetica", "bold");
  doc.text("Condiciones", 10, finalY);
  doc.setFont("helvetica", "normal");
  finalY += 7;

  doc.text(`Validez del presupuesto: ${budget.validityDays} días`, 10, finalY);
  finalY += 6;

  doc.text(`Garantía: ${budget.warranty}`, 10, finalY);
  finalY += 6;

  doc.text(`Forma de Pago: ${budget.paymentTerms}`, 10, finalY);
  finalY += 6;

  if (budget.notes) {
    finalY += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Observaciones:", 10, finalY);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(budget.notes, 190);
    finalY += 6;
    doc.text(lines, 10, finalY);
  }

  // --------------------------------------
  // FOOTER SIMPLE COMO EL ORIGINAL
  // --------------------------------------
  const footerY = 285;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(HEADER_BLUE[0], HEADER_BLUE[1], HEADER_BLUE[2]);
  doc.text(profile.businessName || profile.name, pageWidth / 2, footerY, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(`${profile.phone} - ${profile.email}`, pageWidth / 2, footerY + 6, {
    align: "center",
  });

  return doc;
};

// DESCARGAR PDF
export const downloadPDF = (budget: Budget, profile: Profile): void => {
  const num = generarNumeroPresupuesto();
  const doc = generateBudgetPDF(budget, profile);
  doc.save(`Presupuesto_${num}_${budget.clientName.replace(/\s/g, "_")}.pdf`);
};