/**
 * pdfkit + gömülü font: perio grafiği ve uzun hasta formları (özel koordinat / renk).
 * Fatura ve aylık rapor pdfmake kullanır (pdfMakePrinter).
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import PDFDocument from "pdfkit";

/** Noto Sans TTF — ₱ (U+20B1) ve Latin genişletilmiş; PDFKit varsayılan fontu desteklemez. */
export const NOTO_SANS_REGULAR = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../assets/fonts/NotoSans-Regular.ttf",
);

export type PdfDoc = InstanceType<typeof PDFDocument>;

export function applyPdfUnicodeFont(doc: PdfDoc): void {
  doc.font(NOTO_SANS_REGULAR);
}
