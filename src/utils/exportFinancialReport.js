import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportFinancialReport = ({
  businessName = 'BizFlow AI Operations',
  summary = {
    totalReceivables: '₹45,300',
    overdueAmount: '₹28,000',
    totalExpenses: '₹20,299',
    netCashPosition: '₹25,001',
  },
  invoices = [],
} = {}) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(18);
  doc.setTextColor(17, 24, 39);
  doc.text(businessName, 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Financial Summary Report • Generated on ${new Date().toLocaleDateString()}`, 14, 29);

  // Summary Table
  autoTable(doc, {
    startY: 36,
    head: [['Metric', 'Amount']],
    body: [
      ['Total Receivables', summary.totalReceivables],
      ['Overdue Payments', summary.overdueAmount],
      ['Total Expenses', summary.totalExpenses],
      ['Net Cash Position', summary.netCashPosition],
    ],
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] },
  });

  // Invoices Table (if provided)
  if (invoices.length > 0) {
    const finalY = doc.lastAutoTable.finalY || 80;
    doc.setFontSize(13);
    doc.setTextColor(17, 24, 39);
    doc.text('Invoice Breakdown', 14, finalY + 12);

    autoTable(doc, {
      startY: finalY + 16,
      head: [['Invoice ID', 'Client', 'Amount', 'Status', 'Due Date']],
      body: invoices.map((inv) => [
        inv.id || '-',
        inv.client || '-',
        inv.amount || '-',
        inv.status || '-',
        inv.dueDate || '-',
      ]),
      theme: 'striped',
      headStyles: { fillColor: [31, 41, 55] },
    });
  }

  doc.save(`${businessName.toLowerCase().replace(/\s+/g, '-')}-financial-report.pdf`);
};