import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Budget, Profile, CATEGORY_LABELS } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const generateBudgetPDF = (budget: Budget, profile: Profile): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colors
  const primaryColor: [number, number, number] = [30, 58, 95];
  const accentColor: [number, number, number] = [46, 125, 102];
  const textColor: [number, number, number] = [51, 51, 51];
  
  // Header background
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Company info
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(profile.businessName || profile.name, 14, 18);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`CUIT: ${profile.taxId}`, 14, 26);
  doc.text(`Tel: ${profile.phone} | ${profile.email}`, 14, 32);
  doc.text(profile.address, 14, 38);
  
  // Budget number and date on the right
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PRESUPUESTO', pageWidth - 14, 18, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`No. ${budget.id.substring(0, 8).toUpperCase()}`, pageWidth - 14, 26, { align: 'right' });
  doc.text(format(new Date(budget.createdAt), "d 'de' MMMM, yyyy", { locale: es }), pageWidth - 14, 32, { align: 'right' });
  
  // Category badge
  doc.setFillColor(...accentColor);
  const categoryText = CATEGORY_LABELS[budget.category];
  doc.roundedRect(pageWidth - 14 - doc.getTextWidth(categoryText) - 8, 35, doc.getTextWidth(categoryText) + 8, 7, 2, 2, 'F');
  doc.setFontSize(8);
  doc.text(categoryText, pageWidth - 14, 40, { align: 'right' });
  
  // Client section
  let yPos = 55;
  doc.setTextColor(...textColor);
  doc.setFillColor(245, 247, 250);
   doc.roundedRect(14, yPos, pageWidth - 28, 20, 3, 3, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENTE', 20, yPos + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(budget.clientName, 20, yPos + 15);
  
   // Technical data section based on category
   yPos = 82;
   
   if (budget.category === 'ac' && budget.acEquipment) {
     doc.setFillColor(240, 248, 255);
     doc.roundedRect(14, yPos, pageWidth - 28, 28, 3, 3, 'F');
     
     doc.setFontSize(10);
     doc.setFont('helvetica', 'bold');
     doc.setTextColor(...primaryColor);
     doc.text('DATOS DEL EQUIPO', 20, yPos + 8);
     
     doc.setFont('helvetica', 'normal');
     doc.setTextColor(...textColor);
     doc.setFontSize(9);
     
     const equipData = [
       `Capacidad: ${budget.acEquipment.capacity} frigorias`,
       `Tecnologia: ${budget.acEquipment.technology}`,
       `Estado: ${budget.acEquipment.status}`
     ];
     doc.text(equipData.join('   |   '), 20, yPos + 17);
     
     yPos += 35;
   } else if (budget.category === 'solar' && budget.solarSystem) {
     doc.setFillColor(240, 255, 240);
     doc.roundedRect(14, yPos, pageWidth - 28, 28, 3, 3, 'F');
     
     doc.setFontSize(10);
     doc.setFont('helvetica', 'bold');
     doc.setTextColor(...accentColor);
     doc.text('DATOS DEL SISTEMA FOTOVOLTAICO', 20, yPos + 8);
     
     doc.setFont('helvetica', 'normal');
     doc.setTextColor(...textColor);
     doc.setFontSize(9);
     
     doc.text(`Tipo de Sistema: ${budget.solarSystem.systemType}`, 20, yPos + 17);
     doc.text(`Tipo de Panel: ${budget.solarSystem.panelType}   |   Potencia: ${budget.solarSystem.panelPower} Wp   |   Cantidad: ${budget.solarSystem.quantity}`, 20, yPos + 23);
     
     yPos += 35;
   } else if (budget.category === 'electric') {
     doc.setFillColor(255, 248, 240);
     doc.roundedRect(14, yPos, pageWidth - 28, 18, 3, 3, 'F');
     
     doc.setFontSize(10);
     doc.setFont('helvetica', 'bold');
     doc.setTextColor(180, 100, 50);
     doc.text('INSTALACION ELECTRICA DOMICILIARIA', 20, yPos + 12);
     
     doc.setTextColor(...textColor);
     yPos += 25;
   } else {
     yPos = 82;
   }
   
   // Items table
  
  const tableData = budget.items.map(item => [
    item.description,
    item.quantity.toString(),
    `$${item.unitPrice.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
    `$${item.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Descripcion', 'Cant.', 'Precio Unit.', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      textColor: textColor,
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [250, 251, 252],
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });
  
  // Get final Y position after table
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Totals section
  const totalsX = pageWidth - 80;
  doc.setFontSize(10);
  
  // Subtotal
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal Materiales:', totalsX, yPos);
  doc.text(`$${budget.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, pageWidth - 14, yPos, { align: 'right' });
  
  // Labor
  yPos += 7;
  doc.text('Mano de Obra:', totalsX, yPos);
  doc.text(`$${budget.laborCost.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, pageWidth - 14, yPos, { align: 'right' });
  
  // Tax
  if (budget.taxRate > 0) {
    yPos += 7;
    doc.text(`IVA (${budget.taxRate}%):`, totalsX, yPos);
    doc.text(`$${budget.taxAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, pageWidth - 14, yPos, { align: 'right' });
  }
  
  // Discount
  if (budget.discount > 0) {
    yPos += 7;
    doc.setTextColor(...accentColor);
    doc.text('Descuento:', totalsX, yPos);
    doc.text(`-$${budget.discount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, pageWidth - 14, yPos, { align: 'right' });
    doc.setTextColor(...textColor);
  }
  
  // Total
  yPos += 10;
  doc.setFillColor(...primaryColor);
  doc.roundedRect(totalsX - 6, yPos - 5, pageWidth - totalsX + 6 - 8, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', totalsX, yPos + 3);
  doc.text(`$${budget.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, pageWidth - 14, yPos + 3, { align: 'right' });
  
  // Notes section
  yPos += 25;
  doc.setTextColor(...textColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  
  if (budget.notes) {
    doc.text('OBSERVACIONES:', 14, yPos);
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(budget.notes, pageWidth - 28);
    doc.text(notesLines, 14, yPos + 6);
    yPos += 6 + (notesLines.length * 5);
  }
  
  // Terms section
  yPos += 10;
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(14, yPos, pageWidth - 28, 30, 3, 3, 'F');
  
  yPos += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('CONDICIONES:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  yPos += 6;
  doc.text(`Validez del presupuesto: ${budget.validityDays} dias`, 20, yPos);
  yPos += 5;
  doc.text(`Garantia: ${budget.warranty}`, 20, yPos);
  yPos += 5;
  doc.text(`Forma de pago: ${budget.paymentTerms}`, 20, yPos);
  
  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Documento generado digitalmente - Presupuestos Pro', pageWidth / 2, footerY, { align: 'center' });
  
  return doc;
};

export const downloadPDF = (budget: Budget, profile: Profile): void => {
  const doc = generateBudgetPDF(budget, profile);
  doc.save(`Presupuesto_${budget.id.substring(0, 8)}_${budget.clientName.replace(/\s/g, '_')}.pdf`);
};

export const getPDFBlob = (budget: Budget, profile: Profile): Blob => {
  const doc = generateBudgetPDF(budget, profile);
  return doc.output('blob');
};

export const getPDFBase64 = (budget: Budget, profile: Profile): string => {
  const doc = generateBudgetPDF(budget, profile);
  return doc.output('datauristring');
};
