export interface ConfiguratorPdfInput {
  summary: string;
  profileName: string;
  lengthMm: number;
  totalWatts: number;
  totalLumens: number;
}

const toPdfSafeText = (value: string) => value
  .replace(/Ə/g, 'E').replace(/ə/g, 'e').replace(/İ/g, 'I').replace(/ı/g, 'i')
  .replace(/Ş/g, 'S').replace(/ş/g, 's').replace(/Ğ/g, 'G').replace(/ğ/g, 'g')
  .replace(/Ç/g, 'C').replace(/ç/g, 'c').replace(/Ö/g, 'O').replace(/ö/g, 'o')
  .replace(/Ü/g, 'U').replace(/ü/g, 'u').replace(/[–—]/g, '-');

export async function createConfiguratorPdf(input: ConfiguratorPdfInput): Promise<File> {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 18;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  pdf.setFillColor(8, 9, 10);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  pdf.setFillColor(255, 210, 26);
  pdf.rect(0, 0, pageWidth, 4, 'F');
  pdf.setTextColor(255, 210, 26);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('ECOLIFE', margin, 20);
  pdf.setTextColor(245, 245, 245);
  pdf.setFontSize(22);
  pdf.text('CONFIGURATION SHEET', margin, 33);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(160, 166, 177);
  pdf.setFontSize(9);
  pdf.text(`Created: ${new Date().toLocaleDateString('en-GB')}`, margin, 40);

  pdf.setDrawColor(55, 58, 66);
  pdf.line(margin, 47, pageWidth - margin, 47);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 210, 26);
  pdf.setFontSize(10);
  pdf.text('CONFIGURATION OVERVIEW', margin, 57);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(245, 245, 245);
  pdf.setFontSize(11);
  const overview = [
    ['Profile', toPdfSafeText(input.profileName)],
    ['Length', `${input.lengthMm} mm`],
    ['Calculated power', `${input.totalWatts} W`],
    ['Luminous flux', `~${input.totalLumens} lm`],
  ];
  let y = 66;
  overview.forEach(([label, value]) => {
    pdf.setTextColor(160, 166, 177);
    pdf.text(label.toUpperCase(), margin, y);
    pdf.setTextColor(245, 245, 245);
    pdf.text(value, margin + 48, y);
    y += 8;
  });

  y += 8;
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 210, 26);
  pdf.setFontSize(10);
  pdf.text('TECHNICAL SPECIFICATION', margin, y);
  y += 8;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(230, 232, 236);
  pdf.setFontSize(9.5);
  const lines = pdf.splitTextToSize(toPdfSafeText(input.summary), pageWidth - margin * 2);
  lines.forEach((line: string) => {
    if (y > pageHeight - 30) {
      pdf.addPage();
      pdf.setFillColor(8, 9, 10);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      y = 24;
    }
    pdf.text(line, margin, y);
    y += 5.5;
  });

  pdf.setDrawColor(55, 58, 66);
  pdf.line(margin, pageHeight - 22, pageWidth - margin, pageHeight - 22);
  pdf.setTextColor(160, 166, 177);
  pdf.setFontSize(8);
  pdf.text('For quotation and production lead time: info@ecolife.az | +994 50 450 70 07', margin, pageHeight - 14);

  const fileName = `ecolife-configuration-${Date.now()}.pdf`;
  return new File([pdf.output('blob')], fileName, { type: 'application/pdf' });
}

export function downloadConfiguratorPdf(file: File): void {
  const url = URL.createObjectURL(file);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = file.name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
