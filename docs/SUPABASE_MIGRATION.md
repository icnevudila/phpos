# Supabase Migration Runbook (DentEase PH)

Bu runbook, mevcut PostgreSQL + Prisma yapisini Supabase Postgres'e tasimak icin minimum-risk adimlarini verir.

## 0) Hedef Mimari

- **DB:** Supabase Postgres (Prisma `DATABASE_URL`)
- **Auth:** Mevcut backend JWT (ilk etapta Supabase Auth'a gecis yok)
- **Storage:** Asama 1 `local`/`s3` kalabilir, asama 2'de `STORAGE_DRIVER=supabase`
- **Frontend:** Vercel (veya mevcut)
- **Backend:** Render/Railway/Fly/VM

## 1) Freeze Noktasi

Gecis oncesi calisan durumu etiketleyin:

```bash
git add -A
git commit -m "chore: freeze state before Supabase migration"
git tag pre-supabase-migration
```

## 2) Supabase Proje Hazirligi

1. Supabase'de yeni proje olustur.
2. `Project Settings -> Database` altindan:
   - Direct connection string
   - Transaction/Session pooler string
   alin.
3. `Project Settings -> API` altindan:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   alin (Storage kullanacaksaniz gerekli).

## 3) Backend Env Degerleri

`backend/.env` icin `backend/.env.supabase.example` dosyasini baz alin.

Onemli:

- `DATABASE_URL` production'da Supabase pooler URL olmasi daha stabildir.
- Migration aninda gerekirse direct URL kullanin.
- `CORS_ORIGIN` alanina deploy frontend URL'sini ekleyin.

## 4) Prisma Semasi ve Migration

Su anda `prisma/schema.prisma` zaten `provider = "postgresql"` kullaniyor; ek sema degisikligi zorunlu degil.

Ilk kurulum:

```bash
cd backend
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run db:smoke
```

Not:

- Uretimde genellikle `prisma migrate deploy` tercih edilir; bu repoda aktif script `db:push`.
- Eger migration dosyali akisa gececekseniz, sonraki adimda `prisma migrate dev`/`deploy` stratejisini netlestirin.

## 5) Storage (Opsiyonel Asama 2)

Supabase Storage'a gecilecekse:

- `STORAGE_DRIVER=supabase`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`

Ardindan:

1. Bucket olustur (or. `patient-files`).
2. Servis rol anahtarinin sadece backend'de tutuldugunu dogrula.
3. Hasta dosya yukleme/indirme smoke testi yap.

## 6) Minimum Smoke Test (Zorunlu)

1. Staff login
2. Patient create/edit
3. Appointment create/update
4. Treatment -> Invoice finalize
5. HMO claim create/status update
6. Portal OTP request/verify

## 7) Rollback

Problemler olursa:

1. `pre-supabase-migration` tag'ine don.
2. Eski `DATABASE_URL` ile backend'i yeniden kaldir.
3. Supabase env degisikliklerini geri cek.

## 8) Go-Live Checklist

- [ ] Backend lint/build yesil
- [ ] Frontend lint/build yesil
- [ ] CI workflow gecerli
- [ ] Production env tamam
- [ ] Smoke test tamamlandi
- [ ] Rollback notlari ekipte paylasildi
