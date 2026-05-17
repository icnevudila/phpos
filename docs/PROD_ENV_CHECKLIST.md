# Production environment checklist

## Backend (`backend/.env`)

- [ ] `DATABASE_URL` — PostgreSQL (Supabase pooler veya doğrudan)
- [ ] `JWT_SECRET` — güçlü rastgele (min 32 karakter)
- [ ] `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `ALLOW_PUBLIC_REGISTER=false` (staff kayıt kapalı, sadece admin invite)
- [ ] `CORS_ORIGIN` — frontend prod URL (virgülle çoklu)
- [ ] `SEMAPHORE_API_KEY` — SMS (opsiyonel; yoksa dry-run)
- [ ] `RESEND_API_KEY` + `EMAIL_FROM` — e-posta
- [ ] `PAYMONGO_SECRET_KEY` + webhook secret — online ödeme
- [ ] `CRON_SECRET` — bildirim cron endpoint koruması
- [ ] `NODE_ENV=production`

## Frontend (`frontend/.env`)

- [ ] `VITE_API_URL` — `https://api.<domain>/api`
- [ ] `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`

## Supabase

- [ ] Auth → URL Configuration: Site URL + Redirect URLs (`/reset-password`, portal)
- [ ] E-posta şablonları (reset password, confirm)

## Database

- [ ] `npx prisma migrate deploy` (production DB)
- [ ] Index migration `20260516_performance_indexes` uygulandı

## Smoke

```bash
cd backend && npm run build
cd frontend && npm run build
node scripts/smoke-api.mjs https://api.your-domain.com/api
```
