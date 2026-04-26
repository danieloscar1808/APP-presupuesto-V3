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
  const pageHeight = doc.internal.pageSize.getHeight();
  const logoHeight = 20;
  const contentTop = 32;
  const bottomMargin = 14;
  let y = contentTop;

  const drawHeader = () => {
    doc.setFillColor(HEADER_BLUE.r, HEADER_BLUE.g, HEADER_BLUE.b);
    doc.rect(0, 0, pageWidth, 25, "F");

    doc.addImage(logoHeader, "PNG", 10, 2, 0, logoHeight);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("Servicios Integrales de ", pageWidth / 2, 8, { align: "center" });
    doc.text("Climatizacion y Energia", pageWidth / 2, 15, { align: "center" });

    doc.setFontSize(10);
    doc.text(`${profile.phone} - ${profile.email}`, pageWidth / 2, 22, {
      align: "center",
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Presupuesto", pageWidth - 12, 9, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Nro: ${budget.number}`, pageWidth - 12, 14, { align: "right" });
    doc.text(
      `Fecha: ${new Date(budget.createdAt).toLocaleDateString("es-AR")}`,
      pageWidth - 12,
      19,
      { align: "right" }
    );

    doc.setTextColor(0, 0, 0);
  };

  const addPageWithHeader = () => {
    doc.addPage();
    drawHeader();
    return contentTop;
  };

  const ensureSpace = (requiredHeight = 10) => {
    if (y + requiredHeight > pageHeight - bottomMargin) {
      y = addPageWithHeader();
    }
  };

  const drawWrappedText = (text: string, x: number, maxWidth: number) => {
    const lines = doc.splitTextToSize(text, maxWidth);

    lines.forEach((line: string) => {
      ensureSpace(5);
      doc.text(line, x, y);
      y += 5;
    });
  };

  drawHeader();

  ensureSpace(16);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text("Datos del Cliente", 12, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Nombre: ${budget.clientName}`, 12, y);
  y += 10;

  ensureSpace(16);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Tipo de Instalacion", 12, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.text(CATEGORY_LABELS[budget.category], 12, y);
  y += 10;

  if (budget.category === "ac" && budget.acEquipment) {
    ensureSpace(28);
    doc.setFont("helvetica", "bold");
    doc.text("Datos del Equipo:", 12, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.text(`Capacidad: ${budget.acEquipment.capacity} frigorias`, 12, y);
    y += 6;
    doc.text(`Tecnologia: ${budget.acEquipment.technology}`, 12, y);
    y += 6;
    doc.text(`Estado: ${budget.acEquipment.status}`, 12, y);
    y += 10;
  }

  if (budget.category === "electric" && budget.electricWorkDescription) {
    ensureSpace(12);
    doc.setFont("helvetica", "bold");
    doc.text("Descripcion del trabajo electrico:", 12, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    drawWrappedText(budget.electricWorkDescription, 12, pageWidth - 24);
    y += 5;
  }

  if (budget.category === "solar" && budget.solarSystem) {
    ensureSpace(34);
    doc.setFont("helvetica", "bold");
    doc.text("Datos del Sistema Solar:", 12, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.text(`Sistema: ${budget.solarSystem.systemType}`, 12, y);
    y += 6;
    doc.text(`Panel: ${budget.solarSystem.panelType}`, 12, y);
    y += 6;
    doc.text(`Potencia por panel: ${budget.solarSystem.panelPower} W`, 12, y);
    y += 6;
    doc.text(`Cantidad de paneles: ${budget.solarSystem.quantity}`, 12, y);
    y += 6;
    doc.text(`Potencia total: ${budget.solarSystem.totalPower} W`, 12, y);
    y += 12;
  }

  const tableData = budget.items.map((item) => {
    const itemTotal =
      (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);

    return [
      item.quantity,
      item.description,
      `$${Number(item.unitPrice || 0).toLocaleString("es-AR")}`,
      `$${itemTotal.toLocaleString("es-AR")}`,
    ];
  });

  autoTable(doc, {
    startY: y,
    margin: { top: contentTop, bottom: bottomMargin, left: 12, right: 12 },
    didDrawPage: () => drawHeader(),
    head: [["Cant.", "Descripcion de Items de Materiales", "P. Unitario", "Total"]],
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

  if (budget.laborItems && budget.laborItems.length > 0) {
    const laborTableData = budget.laborItems.map((item) => [
      1,
      item.name,
      `$${Number(item.price || 0).toLocaleString("es-AR")}`,
      `$${Number(item.price || 0).toLocaleString("es-AR")}`,
    ]);

    autoTable(doc, {
      startY: y,
      margin: { top: contentTop, bottom: bottomMargin, left: 12, right: 12 },
      didDrawPage: () => drawHeader(),
      head: [["Cant.", "Descripcion de Items de Mano de Obra", "P. Unitario", "Total"]],
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

    y = (doc as any).lastAutoTable.finalY + 16;
  }

  const leftX = 12;
  const rightX = 90;

  ensureSpace(52);
  const yStart = y;

  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  if (yStart > contentTop) {
    doc.line(10, yStart - 8, pageWidth - 10, yStart - 8);
  }

  let yLeft = yStart;
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Resumen de Costos", leftX, yLeft);
  yLeft += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    `Subtotal materiales: $${Number(budget.subtotal || 0).toLocaleString("es-AR")}`,
    leftX,
    yLeft
  );
  yLeft += 6;
  doc.text(
    `Mano de Obra: $${Number(budget.laborCost || 0).toLocaleString("es-AR")}`,
    leftX,
    yLeft
  );
  yLeft += 6;

  if (budget.taxRate > 0) {
    doc.text(
      `IVA (${budget.taxRate}%): $${Number(budget.taxAmount || 0).toLocaleString("es-AR")}`,
      leftX,
      yLeft
    );
    yLeft += 6;
  }

  if (budget.discount > 0) {
    doc.text(
      `Descuento: -$${Number(budget.discount || 0).toLocaleString("es-AR")}`,
      leftX,
      yLeft
    );
    yLeft += 6;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  yLeft += 4;
  doc.text(
    `TOTAL: $${Number(budget.total || 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`,
    leftX,
    yLeft
  );

  let yRight = yStart;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Condiciones", rightX, yRight);
  yRight += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Validez: ${budget.validityDays} dias`, rightX, yRight);
  yRight += 6;
  doc.text(`Garantia: ${budget.warranty}`, rightX, yRight);
  yRight += 6;

  const paymentTermsLines = doc.splitTextToSize(
    `Forma de pago: ${budget.paymentTerms}`,
    pageWidth - rightX - 12
  );

  paymentTermsLines.forEach((line: string) => {
    doc.text(line, rightX, yRight);
    yRight += 6;
  });

  y = Math.max(yLeft, yRight) + 10;
  doc.setLineWidth(0.5);
  doc.line(10, y - 3, pageWidth - 10, y - 3);

  if (budget.notes) {
    const notesLines = doc.splitTextToSize(budget.notes, pageWidth - 24);

    ensureSpace(17);
    y += 6;
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("Observaciones:", 12, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    notesLines.forEach((line: string) => {
      ensureSpace(5);
      doc.setTextColor(0, 0, 0);
      doc.text(line, 12, y);
      y += 5;
    });

    y += 5;
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
