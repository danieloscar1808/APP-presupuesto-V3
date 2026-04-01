console.log("✅ PDF TAX CARGADO");
import jsPDF from "jspdf";

export function generarPDFImpositivo(resumen) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Resumen Impositivo Mensual", 10, 20);

  doc.setFontSize(12);

  doc.text(`Total Facturado: $${resumen.totalFacturado}`, 10, 40);
  doc.text(`IIBB Calculado: $${resumen.iibb}`, 10, 50);
  doc.text(`Retenciones: $${resumen.retenciones}`, 10, 60);
  doc.text(`Saldo a Pagar: $${resumen.saldo}`, 10, 70);

  doc.save("resumen-impositivo.pdf");
}