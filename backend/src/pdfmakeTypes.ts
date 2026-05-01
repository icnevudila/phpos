/**
 * pdfmake belge tipleri.
 * @types/pdfmake kök `index.d.ts` içinde `TDocumentDefinitions` dışa aktarılmıyor;
 * `pdfmake/interfaces` alt yolu NodeNext ile güvenilir çözümlenmiyor.
 * Tablo/hücre oluşturucuları strict `Content` ile sürekli uyumsuz kalıyor — burada
 * izin verici takma adlar kullanılıyor; çalışma zamanı pdfmake tarafından doğrulanır.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Content = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TDocumentDefinitions = any;
