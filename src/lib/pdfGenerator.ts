import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Budget, Profile, CATEGORY_LABELS } from "@/types";
import logoHeader from "@/assets/logo-header.png";

// Azul del encabezado
const HEADER_BLUE = { r: 45, g: 69, b: 122 };

// Generador AAAAMM-XXX
const generarNumeroPresupuesto = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const key = `${year}${month}`;
  const last = Number(localStorage.getItem(`presupuesto_${key}`) || "0");
  const next = last + 1;

  localStorage.setItem(`presupuesto_${key}`, String(next));

  return `${key}-${String(next).padStart(3, "0")}`;
};

export const generateBudgetPDF = (budget: Budget, profile: Profile): jsPDF => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 10;

  // -----------------------------------------------------
  // ENCABEZADO
  // -----------------------------------------------------
  doc.setFillColor(HEADER_BLUE.r, HEADER_BLUE.g, HEADER_BLUE.b);
  doc.rect(0, 0, pageWidth, 25, "F");

  // LOGO SIN ESTIRAR (altura fija – mantiene proporción)
  const LOGO_HEIGHT = 20;
  doc.addImage(logoHeader, "PNG", 10, 2, 0, LOGO_HEIGHT); // 0 = width auto

  // -----------------------------------------------------
  // TÍTULO EN 3 LÍNEAS
  // -----------------------------------------------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);

  // Línea 1
  doc.text("Servicios Integrales de ", pageWidth / 2, 8, { align: "center" });

  // Línea 2
  doc.setFontSize(18);
  doc.text("Climatización y Energía", pageWidth / 2, 15, { align: "center" });

  // Línea 3
  doc.setFontSize(10);
   doc.text(`${profile.phone} - ${profile.email}`, pageWidth / 2, 22, { align: "center" });

  // -----------------------------------------------------
  // BLOQUE DERECHA - TITULO + NUMERO + FECHA
  // -----------------------------------------------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Presupuesto", pageWidth - 12, 9, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  // Número debajo del título "Presupuesto"
  doc.text(`Nº: ${budget.number}`, pageWidth - 12, 14, { align: "right" });

  // Fecha en la linea siguiente
  doc.text(
    `Fecha: ${new Date(budget.createdAt).toLocaleDateString("es-AR")}`,
    pageWidth - 12,
    19,
    { align: "right" }
  );


  // CLIENTE
  y = 32;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text("Datos del Cliente", 12, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Nombre: ${budget.clientName}`, 12, y);
  y += 10;

  // TIPO DE INSTALACIÓN
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Tipo de Instalación", 12, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.text(CATEGORY_LABELS[budget.category], 12, y);
  y += 10;

  // CAMPOS SEGÚN CATEGORÍA
  if (budget.category === "ac" && budget.acEquipment) {
    doc.setFont("helvetica", "bold");
    doc.text("Datos del Equipo:", 12, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.text(`Capacidad: ${budget.acEquipment.capacity} frigorías`, 12, y); y += 6;
    doc.text(`Tecnología: ${budget.acEquipment.technology}`, 12, y); y += 6;
    doc.text(`Estado: ${budget.acEquipment.status}`, 12, y); y += 10;
  }

  if (budget.category === "electric" && budget.electricWorkDescription) {
    doc.setFont("helvetica", "bold");
    doc.text("Descripción del trabajo eléctrico:", 12, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(
      budget.electricWorkDescription,
      pageWidth - 24
    );
    doc.text(lines, 12, y);
    y += lines.length * 5 + 5;
  }

  if (budget.category === "solar" && budget.solarSystem) {
    doc.setFont("helvetica", "bold");
    doc.text("Datos del Sistema Solar:", 12, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.text(`Sistema: ${budget.solarSystem.systemType}`, 12, y); y += 6;
    doc.text(`Panel: ${budget.solarSystem.panelType}`, 12, y); y += 6;
    doc.text(`Potencia por panel: ${budget.solarSystem.panelPower} W`, 12, y); y += 6;
    doc.text(`Cantidad de paneles: ${budget.solarSystem.quantity}`, 12, y); y += 6;
    doc.text(
      `Potencia total: ${budget.solarSystem.totalPower} W`,
      12,
      y
    );
    y += 12;
  }

  // TABLA DE ITEMS
  const tableData = budget.items.map((i) => {
    const itemTotal = (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0);

    return [
      i.quantity,
      i.description,
      `$${Number(i.unitPrice || 0).toLocaleString("es-AR")}`,
      `$${itemTotal.toLocaleString("es-AR")}`,
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [["Cant.", "Descripción de Items de Materiales", "P. Unitario", "Total"]],
    body: tableData,
    headStyles: {
      fillColor: [HEADER_BLUE.r, HEADER_BLUE.g, HEADER_BLUE.b],
      textColor: 255,
      fontStyle: "bold",
    },
    styles: { fontSize: 10 },
    columnStyles: { 1: { halign: "left" } },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

// -------------------------------------
// TABLA MANO DE OBRA (ESTILO MATERIALES)
// -------------------------------------
if (budget.laborItems && budget.laborItems.length > 0) {

  const laborTableData = budget.laborItems.map((item) => [
    1, // cantidad fija
    item.name,
    `$${Number(item.price || 0).toLocaleString("es-AR")}`,
    `$${Number(item.price || 0).toLocaleString("es-AR")}`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Cant.", "Descripción de Items de Mano de Obra", "P. Unitario", "Total"]],
    body: laborTableData,

    headStyles: {
      fillColor: [HEADER_BLUE.r, HEADER_BLUE.g, HEADER_BLUE.b],
      textColor: 255,
      fontStyle: "bold",
    },

    styles: { fontSize: 10 },

    columnStyles: {
      1: { halign: "left" },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 6;

    y += 10;
}


 // POSICIONES
const leftX = 12;
const rightX = 90;
let yStart = y;

// 🔵 línea superior
doc.setDrawColor(0);      // negro (más profesional)
doc.setLineWidth(0.5);    // más grosor

doc.line(10, yStart - 8, pageWidth - 10, yStart - 8);

// ----------------------
// IZQUIERDA (COSTOS)
// ----------------------
let yLeft = yStart;

doc.setFont("helvetica", "bold");
doc.setFontSize(11);
doc.text("Resumen de Costos", leftX, yLeft);
yLeft += 8;

doc.setFont("helvetica", "normal");
doc.setFontSize(10);

doc.text(`Subtotal materiales: $${Number(budget.subtotal || 0).toLocaleString("es-AR")}`, leftX, yLeft); 
yLeft += 6;

doc.text(`Mano de Obra: $${Number(budget.laborCost || 0).toLocaleString("es-AR")}`, leftX, yLeft); 
yLeft += 6;

if (budget.taxRate > 0) {
  doc.text(`IVA (${budget.taxRate}%): $${Number(budget.taxAmount || 0).toLocaleString("es-AR")}`, leftX, yLeft); 
  yLeft += 6;
}

if (budget.discount > 0) {
  doc.text(`Descuento: -$${Number(budget.discount || 0).toLocaleString("es-AR")}`, leftX, yLeft); 
  yLeft += 6;
}

doc.setFont("helvetica", "bold");
doc.setFontSize(12);
yLeft += 4;
doc.text(`TOTAL: $${Number(budget.total || 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`, leftX, yLeft);


// ----------------------
// DERECHA (CONDICIONES)
// ----------------------
let yRight = yStart;

doc.setFont("helvetica", "bold");
doc.setFontSize(11);
doc.text("Condiciones", rightX, yRight);
yRight += 7;

doc.setFont("helvetica", "normal");
doc.setFontSize(10);

doc.text(`Validez: ${budget.validityDays} días`, rightX, yRight); 
yRight += 6;

doc.text(`Garantía: ${budget.warranty}`, rightX, yRight); 
yRight += 6;

doc.text(`Forma de pago: ${budget.paymentTerms}`, rightX, yRight); 
yRight += 6;


// ----------------------
// CALCULAR FINAL DE COLUMNAS
// ----------------------
y = Math.max(yLeft, yRight) + 10;

// 🔵 línea inferior
doc.setLineWidth(0.5); // mismo grosor que arriba
doc.line(10, y - 3, pageWidth - 10, y - 3);

// ----------------------
// OBSERVACIONES (ABAJO, ANCHO COMPLETO)
// ----------------------
if (budget.notes) {
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.text("Observaciones:", 12, y);
  y += 6;

  doc.setFont("helvetica", "normal");

  const notesWrapped = doc.splitTextToSize(budget.notes, pageWidth - 24);
  doc.text(notesWrapped, 12, y);

  y += notesWrapped.length * 5 + 10;
}

  return doc;
};

export const downloadPDF = (budget: Budget, profile: Profile) => {
  const doc = generateBudgetPDF(budget, profile);
  const num = budget.number || "sin_numero";
  doc.save(`Presupuesto_${num}_${budget.clientName}.pdf`);
};

export const downloadFacturaPDF = (factura: any, profile: any) => {
  const doc = generateFacturaPDF(factura, profile);

  const num = factura?.numero || "sin_numero";
  const cliente = factura?.cliente || "cliente";

  doc.save(`Factura_${num}_${cliente.replace(/\s/g, "_")}.pdf`);
};