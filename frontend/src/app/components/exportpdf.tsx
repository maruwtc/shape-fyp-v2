import jsPDF from "jspdf";

export const exportReport = (consolelog: any) => {
  const doc = new jsPDF();
  doc.setFont("JetBrains Mono");
  const lines: string[] = consolelog.split("\n"); // Explicitly specify the type as string[]
  const fontSize = 8;
  const lineHeight = 5;
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(fontSize);
  let pageNumber = 1;
  let yOffset = 10;
  let linesPerPage = Math.floor((pageHeight - yOffset) / lineHeight);
  lines.forEach((line: string, index: number) => { // Specify types for index and line
    const currentPage = Math.floor(index / linesPerPage) + 1;
    if (currentPage > pageNumber) {
      doc.addPage();
      pageNumber++;
      yOffset = 10;
      linesPerPage = Math.floor((pageHeight - yOffset) / lineHeight);
    }
    const y = yOffset + ((index % linesPerPage) * lineHeight);
    doc.text(5, y, `Line ${index + 1} > `);
    doc.text(30, y, `$ ${line}`);
  });
  doc.save("console_log.pdf");
};
