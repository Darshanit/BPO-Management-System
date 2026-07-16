const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates a payslip PDF for a processed payroll record and saves it to disk.
 * Returns the relative /uploads path to store on the Payroll document.
 */
const generatePayslipPDF = async (payroll, employee, user) => {
  const dir = path.join(__dirname, '..', 'uploads', 'documents');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const fileName = `payslip-${employee.employeeId}-${payroll.month}-${payroll.year}.pdf`;
  const filePath = path.join(dir, fileName);
  const relativeUrl = `/uploads/documents/${fileName}`;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(18).text('BPO Management System', { align: 'center' });
    doc.fontSize(12).text('Payslip', { align: 'center' });
    doc.moveDown();

    doc.fontSize(10);
    doc.text(`Employee: ${user.name} (${employee.employeeId})`);
    doc.text(`Period: ${payroll.month}/${payroll.year}`);
    doc.moveDown();

    doc.text(`Base Salary: ${payroll.baseSalary}`);
    payroll.allowances.forEach((a) => doc.text(`Allowance - ${a.label}: ${a.amount}`));
    doc.text(`Bonus: ${payroll.bonus}`);
    payroll.deductions.forEach((d) => doc.text(`Deduction - ${d.label}: ${d.amount}`));
    doc.text(`Tax: ${payroll.tax}`);
    doc.text(`PF: ${payroll.pf}`);
    doc.moveDown();

    doc.fontSize(12).text(`Gross Salary: ${payroll.grossSalary}`, { bold: true });
    doc.text(`Net Salary: ${payroll.netSalary}`, { bold: true });

    doc.end();

    stream.on('finish', () => resolve(relativeUrl));
    stream.on('error', reject);
  });
};

module.exports = { generatePayslipPDF };
