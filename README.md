# DentEase PH (MVP)

Klinik yönetimi: randevu, hasta, odontogram, fatura / PayMongo, HMO talepleri, hasta portalı (OTP), stok, raporlar.

**İlerleme listesi:** [CHECKLIST.md](CHECKLIST.md)

## Hızlı çalıştırma

Kök dizinde (isteğe bağlı): `npm run install:all` → her iki uygulamada `npm install`; `npm run build:all` → backend + frontend üretim derlemesi; `npm run lint:all` → TypeScript kontrolleri.

**Backend** — klasör: `backend/`

```bash
npm install
cp .env.example .env
```

`.env` içinde en azından `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` doldur. Sonra:

```bash
npm run db:generate   # Prisma Client şemayla aynı olmalı; lint/build öncesi şema değiştiyse tekrar çalıştırın
npm run db:push
npm run db:seed
npm run dev
```

`npm run build` (CI dahil) çalıştığında `prebuild` adımı otomatik olarak `prisma generate` çalıştırır; yine de şema değişikliğinden sonra `npm run db:generate` ile doğrulamak faydalıdır.

İsteğe bağlı doğrulama: `npm run db:smoke` — PostgreSQL’e bağlanıp klinik / kullanıcı / hasta / randevu sayılarını listeler (şema + bağlantı hızlı kontrol).

API varsayılanı: `http://localhost:4000` (`PORT` ile değişir). HTTP prefix: `API_PREFIX` (varsayılan `/api`).

## Supabase'a taşıma

Supabase geçişi için adım adım runbook: [`docs/SUPABASE_MIGRATION.md`](docs/SUPABASE_MIGRATION.md)

Hızlı başlangıç:

1. `backend/.env.supabase.example` dosyasını `backend/.env` olarak kopyalayın.
2. Supabase proje değerlerini (`DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) doldurun.
3. `backend` içinde:
   - `npm run db:generate`
   - `npm run db:push`
   - `npm run db:seed`
   - `npm run db:smoke`

**Frontend** — klasör: `frontend/`

```bash
npm install
npm run dev
```

Vite adresi terminal çıktısında (genelde `http://localhost:5173`).

İsteğe bağlı `frontend/.env`: `VITE_API_URL` — backend API kökü (varsayılan `http://localhost:4000/api`, sonunda `/api` olmalı). `backend` `PORT` veya `API_PREFIX` değiştiyse burayı hizala.

## Kiosk (resepsiyon tableti / bekleme salonu)

- Giriş URL’si: `http://localhost:5173/kiosk/{klinik-slug}` — klinik doğrulanır; **Hasta** → portal OTP (`?kiosk=1` ile daha geniş tip); **Personel** → staff girişi → randevular.
- Örnek görsel (mockup): [docs/kiosk-home-mockup.png](docs/kiosk-home-mockup.png)

## Hasta portalı (OTP)

- URL şablonu: `http://localhost:5173/{klinik-slug}/portal/login` (slug, seed’deki klinik `slug` alanı ile aynı olmalı).
- Akış: telefon → `POST …/portal/request-otp` → SMS veya geliştirici ortamında API yanıtındaki `devCode` ile kod adımı → `POST …/portal/verify-otp` → JWT saklanır, `/{slug}/portal/home` yönlendirmesi.
- Üretimde gerçek SMS için backend `.env` içinde Semaphore / ilgili anahtarlar; geliştirmede `devCode` ile doğrulama yapılabilir.

## Uzun iş / gece listesi

- [`docs/OVERNIGHT_AGENT_TODO.md`](docs/OVERNIGHT_AGENT_TODO.md) — blok blok agent görevleri.
- [`CHECKLIST.md`](CHECKLIST.md) — ürün modül durumu ve öncelikler.
