import { jsPDF } from "jspdf";
import "jspdf-autotable";

// We extend the jsPDF type locally to register the autotable function.
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

/**
 * Exports data to an Excel (XLS) file client-side.
 */
export function exportToExcel(headers: string[], rows: any[][], fileName: string) {
  let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">`;
  html += `<head><meta charset="utf-8" /><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Report</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>`;
  html += `<table border="1">`;
  
  // Headers
  html += `<thead><tr style="background-color: #0d9488; color: #ffffff; font-weight: bold;">`;
  for (const header of headers) {
    html += `<th>${header}</th>`;
  }
  html += `</tr></thead>`;
  
  // Rows
  html += `<tbody>`;
  for (const row of rows) {
    html += `<tr>`;
    for (const cell of row) {
      html += `<td>${cell === null || cell === undefined ? "" : cell}</td>`;
    }
    html += `</tr>`;
  }
  html += `</tbody></table></body></html>`;

  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName.endsWith(".xls") ? fileName : `${fileName}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports data to a Word (DOC) file client-side.
 */
export function exportToWord(title: string, headers: string[], rows: any[][], fileName: string) {
  let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">`;
  html += `<head><meta charset="utf-8" /><style>body { font-family: sans-serif; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #0d9488; color: white; }</style></head><body>`;
  html += `<h2>${title}</h2>`;
  html += `<p style="font-size: 11px; color: #666;">Generated on ${new Date().toLocaleString()}</p>`;
  html += `<table>`;
  
  // Headers
  html += `<thead><tr>`;
  for (const header of headers) {
    html += `<th>${header}</th>`;
  }
  html += `</tr></thead>`;
  
  // Rows
  html += `<tbody>`;
  for (const row of rows) {
    html += `<tr>`;
    for (const cell of row) {
      html += `<td>${cell === null || cell === undefined ? "" : cell}</td>`;
    }
    html += `</tr>`;
  }
  html += `</tbody></table></body></html>`;

  const blob = new Blob([html], { type: "application/vnd.ms-word;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName.endsWith(".doc") ? fileName : `${fileName}.doc`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports data to a PDF file client-side.
 */
export function exportToPdf(title: string, headers: string[], rows: any[][], fileName: string) {
  const doc = new jsPDF();
  
  // Add Title
  doc.setFontSize(16);
  doc.text(title, 14, 15);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

  // Add Table
  doc.autoTable({
    startY: 26,
    head: [headers],
    body: rows,
    theme: "striped",
    headStyles: { fillHexColor: "#0d9488" }, // Teal-600 color
    styles: { fontSize: 9 },
  });

  doc.save(fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);
}
