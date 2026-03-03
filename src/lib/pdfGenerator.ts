import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Budget, Profile } from "@/types";

// -----------------------------------------------------
// DESCARGAR PDF DEL PRESUPUESTO
// -----------------------------------------------------
export async function downloadPDF(budget: Budget, profile: Profile) {
  const doc = new jsPDF();

  // ----------------------------
  // HEADER
  // ----------------------------
  doc.setFontSize(18);
  doc.text(profile.businessName || profile.name, 14, 20);

  doc.setFontSize(11);
  doc.text(`Presupuesto #${budget.number}`, 14, 28);

  if (profile.address) doc.text(profile.address, 14, 34);
  if (profile.phone) doc.text(`Tel: ${profile.phone}`, 14, 40);
  if (profile.email) doc.text(`Email: ${profile.email}`, 14, 46);

  doc.line(14, 50, 196, 50);

  // ----------------------------
  // CLIENTE
  // ----------------------------
  doc.setFontSize(14);
  doc.text("Cliente", 14, 60);

  doc.setFontSize(11);
  doc.text(budget.clientName, 14, 68);

  if (budget.createdAt) {
    const date = new Date(budget.createdAt).toLocaleDateString("es-AR");
    doc.text(`Fecha: ${date}`, 14, 74);
  }

  // ----------------------------
  // ITEMS
  // ----------------------------
  doc.setFontSize(14);
  doc.text("Detalle", 14, 90);

  const tableData = budget.items.map((item) => [
    `${item.quantity}x ${item.description}`,
    `$${item.total.toLocaleString("es-AR")}`,
  ]);

  autoTable(doc, {
    startY: 96,
    head: [["Descripción", "Total"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [0, 0, 0] },
  });

  let y = (doc as any).lastAutoTable.finalY + 10;

  // ----------------------------
  // RESUMEN
  // ----------------------------
  doc.setFontSize(14);
  doc.text("Resumen", 14, y);
  y += 6;

  const totals = [
    ["Materiales", `$${budget.subtotal.toLocaleString("es-AR")}`],
    ["Mano de obra", `$${budget.laborCost.toLocaleString("es-AR")}`],
  ];

  if (budget.taxRate > 0) {
    totals.push([
      `IVA (${budget.taxRate}%)`,
      `$${budget.taxAmount.toLocaleString("es-AR")}`,
    ]);
  }

  if (budget.discount > 0) {
    totals.push([
      "Descuento",
      `-$${budget.discount.toLocaleString("es-AR")}`,
    ]);
  }

  totals.push([
    "TOTAL",
    `$${budget.total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`,
  ]);

  autoTable(doc, {
    startY: y,
    body: totals,
    theme: "plain",
    styles: { fontSize: 11 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // ----------------------------
  // CONDICIONES
  // ----------------------------
  doc.setFontSize(14);
  doc.text("Condiciones", 14, y);
  y += 8;

  doc.setFontSize(11);

  doc.text(`Validez: ${budget.validityDays} días`, 14, y);
  y += 6;

  doc.text(`Garantía: ${budget.warranty}`, 14, y);
  y += 6;

  doc.text(`Forma de pago: ${budget.paymentTerms}`, 14, y);
  y += 6;

  if (budget.notes) {
    doc.text("Observaciones:", 14, y);
    y += 6;
    doc.text(budget.notes, 14, y);
  }

  // ----------------------------
  // GUARDAR ARCHIVO
  // ----------------------------
  const filename = `presupuesto_${budget.number}.pdf`;
  doc.save(filename);
}