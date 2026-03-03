import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Budget, Profile, CATEGORY_LABELS } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Import del logo transparente (ubicado en src/assets/)
import logoHeader from "../assets/logo-header.png";

// -----------------------------------------------------
// COLOR EXACTO DEL ENCABEZADO (extraído de tu PDF/Logo)
// -----------------------------------------------------
const HEADER_BLUE = { r: 45, g: 69, b: 122 };

// -----------------------------------------------------
// Generador AAAAMM-XXX (se mantiene como versión original)
// -----------------------------------------------------
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

// -----------------------------------------------------
// GENERAR PDF PRINCIPAL
// -----------------------------------------------------
export const generateBudgetPDF = (budget: Budget, profile: Profile): jsPDF => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // -----------------------------------------------------
  // ENCABEZADO AZUL COMPLETO — LOGO IZQUIERDA
  // -----------------------------------------------------
  doc.setFillColor(HEADER_BLUE.r, HEADER_BLUE.g, HEADER_BLUE.b);
  doc.rect(0, 0, pageWidth, 40, "F");

  // Logo con proporciones correctas
  const logoWidth = 36;
  const logoRatio = 0.55; // relación estimada para evitar estiramiento
  const logoHeight = logoWidth * logoRatio;
  const logoX = 10;
  const logoY = (40 - logoHeight) / 2;

  doc.addImage(logoHeader, "PNG", logoX, logoY, logoWidth, logoHeight);

  // TÍTULO CENTRADO
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(
    "Servicios Integrales de Climatización y Energía",
    pageWidth / 2,
    15,
    { align: "center" }
  );

  // SUBTÍTULO
  doc.setFontSize(11);
  doc.text("Presupuesto Profesional", pageWidth / 2, 23, {
    align: "center",
  });

  // -----------------------------------------------------
  // DATOS CLIENTE + NÚMERO DE PRESUPUESTO
  // -----------------------------------------------------
  let y = 50;
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const numeroGenerado = generarNumeroPresupuesto();

  doc.text(`Presupuesto Nº: ${numeroGenerado}`, 10, y);
  y += 6;

  doc.text(
    `Fecha: ${format(new Date(budget.createdAt), "d 'de' MMMM, yyyy", {
      locale: es,
    })}`,
    10,
    y
  );
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.text("Datos del Cliente", 10, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.text(`Nombre: ${budget.clientName || ""}`, 10, y);
  y += 10;

// -----------------------------------------------------
// DESCRIPCIÓN DEL TRABAJO (solo eléctrica)
// -----------------------------------------------------
if (budget.category === "electric" && budget.electricWorkDescription) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 58, 95); // mismo azul del header
  doc.text("Descripción del trabajo a realizar", 14, y);

  y += 5;

  doc.setFillColor(245, 247, 250);
  doc.roundedRect(14, y, pageWidth - 28, 30, 3, 3, "F");

  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);

  const textLines = doc.splitTextToSize(
    budget.electricWorkDescription,
    pageWidth - 40
  );

  doc.text(textLines, 20, y);

  y += textLines.length * 5 + 12;
}


  // -----------------------------------------------------
  // TABLA DE ITEMS
  // -----------------------------------------------------
  const tableData = budget.items.map((item) => [
    item.quantity,
    item.description,
    `$${item.unitPrice.toLocaleString("es-AR")}`,
    `$${item.total.toLocaleString("es-AR")}`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Cant.", "Descripción", "Precio Unit.", "Total"]],
    body: tableData,
    headStyles: {
      fillColor: [HEADER_BLUE.r, HEADER_BLUE.g, HEADER_BLUE.b],
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
    margin: { left: 10, right: 10 },
  });

  let finalY = (doc as any).lastAutoTable.finalY + 12;

  // -----------------------------------------------------
  // RESUMEN DE COSTOS
  // -----------------------------------------------------
  doc.setFont("helvetica", "bold");
  doc.text("Resumen de Costos", 10, finalY);
  finalY += 8;

  doc.setFont("helvetica", "normal");

  doc.text(
    `Subtotal materiales: $${budget.subtotal.toLocaleString("es-AR")}`,
    10,
    finalY
  );
  finalY += 6;

  doc.text(
    `Mano de obra: $${budget.laborCost.toLocaleString("es-AR")}`,
    10,
    finalY
  );
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
    doc.setTextColor(200, 0, 0);
    doc.text(
      `Descuento: -$${budget.discount.toLocaleString("es-AR")}`,
      10,
      finalY
    );
    doc.setTextColor(0, 0, 0);
    finalY += 6;
  }

  // TOTAL destacado
  doc.setFont("helvetica", "bold");
  finalY += 3;
  doc.text(
    `TOTAL: $${budget.total.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
    })}`,
    10,
    finalY
  );

  // -----------------------------------------------------
  // CONDICIONES
  // -----------------------------------------------------
  finalY += 15;
  doc.setFont("helvetica", "bold");
  doc.text("Condiciones", 10, finalY);

  doc.setFont("helvetica", "normal");
  finalY += 7;

  doc.text(`Validez del presupuesto: ${budget.validityDays} días`, 10, finalY);
  finalY += 6;

  doc.text(`Garantía: ${budget.warranty}`, 10, finalY);
  finalY += 6;

  doc.text(`Forma de pago: ${budget.paymentTerms}`, 10, finalY);
  finalY += 6;

  if (budget.notes) {
    finalY += 4;
    doc.text("Observaciones:", 10, finalY);
    finalY += 5;
    const lines = doc.splitTextToSize(budget.notes, 190);
    doc.text(lines, 10, finalY);
  }

  // -----------------------------------------------------
  // FOOTER (igual estilo al PDF original)
  // -----------------------------------------------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(HEADER_BLUE.r, HEADER_BLUE.g, HEADER_BLUE.b);

  doc.text(profile.businessName || profile.name, pageWidth / 2, 285, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(`${profile.phone} - ${profile.email}`, pageWidth / 2, 291, {
    align: "center",
  });

  return doc;
};

// -----------------------------------------------------
// DESCARGA DIRECTA
// -----------------------------------------------------
export const downloadPDF = (budget: Budget, profile: Profile): void => {
  const num = generarNumeroPresupuesto();
  const doc = generateBudgetPDF(budget, profile);
  doc.save(`Presupuesto_${num}_${budget.clientName.replace(/\s/g, "_")}.pdf`);
};

// -----------------------------------------------------
// EXPORTACIONES AUXILIARES
// -----------------------------------------------------
export const getPDFBlob = (budget: Budget, profile: Profile): Blob => {
  const doc = generateBudgetPDF(budget, profile);
  return doc.output("blob");
};

export const getPDFBase64 = (budget: Budget, profile: Profile): string => {
  const doc = generateBudgetPDF(budget, profile);
  return doc.output("datauristring");
};