/**
 * pdfmake: tablo / rapor tarzı PDF’ler (fatura, aylık rapor). Profesyonel düzen için uygun.
 * Perio ve hasta formları şimdilik pdfkit + Noto (pdfKitUnicodeFont) — özel çizim / sayfa düzeni riski düşük.
 */
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { TDocumentDefinitions } from "../pdfmakeTypes.js";

const require = createRequire(import.meta.url);
// pdfmake CJS; @types default export eksik — require ile yükle.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfMake = require("pdfmake") as {
  setFonts: (fonts: Record<string, Record<string, string>>) => void;
  setUrlAccessPolicy?: (cb: (url: string) => boolean) => void;
  createPdf: (doc: TDocumentDefinitions) => { getBuffer: () => Promise<Buffer> };
};

const notoPath = join(dirname(fileURLToPath(import.meta.url)), "../../assets/fonts/NotoSans-Regular.ttf");

pdfMake.setFonts({
  NotoSans: {
    normal: notoPath,
    bold: notoPath,
    italics: notoPath,
    bolditalics: notoPath,
  },
});

pdfMake.setUrlAccessPolicy?.(() => false);

/** pdfmake + gömülü Noto Sans — ₱ ve Latin genişletilmiş karakterler. */
export async function renderPdfDocument(def: TDocumentDefinitions): Promise<Buffer> {
  const doc: TDocumentDefinitions = {
    ...def,
    pageSize: def.pageSize ?? "A4",
    pageMargins: def.pageMargins ?? [48, 48, 48, 48],
    defaultStyle: {
      font: "NotoSans",
      fontSize: 10,
      color: "#0f172a",
      ...def.defaultStyle,
    },
  };
  const pdf = pdfMake.createPdf(doc);
  return pdf.getBuffer();
}
