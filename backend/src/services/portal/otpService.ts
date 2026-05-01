import bcrypt from "bcryptjs";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/errors.js";

const OTP_TTL_MS = 5 * 60 * 1000; // 5 dakika
const MAX_ATTEMPTS = 5;
const REQUEST_COOLDOWN_MS = 30 * 1000; // aynı hat için 30 sn
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 saat
const RATE_LIMIT_MAX = 5; // saatte max 5 OTP talebi

function randomDigits(): string {
  // 6 haneli [100000,999999]
  return String(Math.floor(100000 + Math.random() * 900000));
}

export interface CreateOtpResult {
  code: string;
  expiresAt: Date;
}

/**
 * OTP kodu üretir ve hash'ini DB'ye yazar. Rate limit ihlalinde hata atar.
 * Dönen code sadece SMS gönderimi içindir — loglanmamalıdır.
 */
export async function createOtp(
  clinicId: string,
  phoneE164: string,
  purpose: string = "PORTAL_LOGIN",
): Promise<CreateOtpResult> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS);

  const recent = await prisma.otpCode.findMany({
    where: {
      clinicId,
      phone: phoneE164,
      purpose,
      createdAt: { gte: windowStart },
    },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  if (recent.length >= RATE_LIMIT_MAX) {
    throw new AppError(
      "Too many OTP requests — try again later",
      429,
      "OTP_RATE_LIMIT",
    );
  }
  if (recent.length > 0) {
    const diff = now.getTime() - recent[0].createdAt.getTime();
    if (diff < REQUEST_COOLDOWN_MS) {
      throw new AppError(
        `Please wait ${Math.ceil((REQUEST_COOLDOWN_MS - diff) / 1000)}s before requesting again`,
        429,
        "OTP_COOLDOWN",
      );
    }
  }

  const code = randomDigits();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(now.getTime() + OTP_TTL_MS);

  await prisma.otpCode.create({
    data: { clinicId, phone: phoneE164, codeHash, purpose, expiresAt },
  });

  return { code, expiresAt };
}

/**
 * OTP doğrulama. Başarısız denemelerde attempts artırır; MAX_ATTEMPTS aşılırsa iptal eder.
 */
export async function verifyOtp(
  clinicId: string,
  phoneE164: string,
  code: string,
  purpose: string = "PORTAL_LOGIN",
): Promise<void> {
  const now = new Date();
  const record = await prisma.otpCode.findFirst({
    where: {
      clinicId,
      phone: phoneE164,
      purpose,
      consumedAt: null,
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: "desc" },
  });
  if (!record) {
    throw new AppError("OTP expired or not found", 400, "OTP_INVALID");
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    throw new AppError("Too many attempts — request a new OTP", 429, "OTP_ATTEMPTS");
  }

  const ok = await bcrypt.compare(code, record.codeHash);
  if (!ok) {
    await prisma.otpCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    throw new AppError("Incorrect OTP code", 400, "OTP_INVALID");
  }

  await prisma.otpCode.update({
    where: { id: record.id },
    data: { consumedAt: now },
  });
}
