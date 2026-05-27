/**
 * Yardımcı fonksiyonlar (tarih, para birimi, hata sarmalayıcıları)
 */

export function assertEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v.trim();
}

