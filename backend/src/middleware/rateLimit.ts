import rateLimit from 'express-rate-limit';

// Genel API istekleri için limit (15 dakikada 1000 istek)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { code: 'TOO_MANY_REQUESTS', message: 'Çok fazla istek gönderdiniz. Lütfen 15 dakika sonra tekrar deneyin.' },
});

// Login/Auth gibi hassas rotalar için sıkı limit (15 dakikada 15 istek)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { code: 'AUTH_RATE_LIMITED', message: 'Çok fazla giriş denemesi yaptınız. Hesabınızın güvenliği için lütfen 15 dakika bekleyin.' },
});