import { Router } from "express";
import rateLimitModule from "express-rate-limit";
const rateLimit = (rateLimitModule as any).default || rateLimitModule;

import {
  availabilityHandler,
  bookHandler,
  cancelAppointmentHandler,
  chartHandler,
  dentistsHandler,
  historyHandler,
  homeHandler,
  meHandler,
  medicalHistoryGetHandler,
  medicalHistoryUpdateHandler,
  myAppointmentsHandler,
  portalDownloadInvoicePdfHandler,
  portalDownloadPatientFileHandler,
  portalFileSignedUrlHandler,
  portalPatientFilesHandler,
  portalPaymongoHandler,
  registerPortalHandler,
  requestOtpHandler,
  resolveClinicHandler,
  verifyOtpHandler,
} from "../controllers/portal.controller.js";
import { portalAuthenticate, portalOptionalAuthenticate } from "../middleware/portalAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const portalRouter = Router();

/** SMS maliyeti / brute-force için OTP uçlarında ek sıkı limit (GAP / Bölüm 9). */
const portalOtpRequestWindowMs = Number(process.env.PORTAL_OTP_REQUEST_WINDOW_MS ?? 15 * 60 * 1000);
const portalOtpRequestMax = Number(
  process.env.PORTAL_OTP_REQUEST_MAX ?? (process.env.NODE_ENV === "production" ? 8 : 200),
);
const portalOtpVerifyWindowMs = Number(process.env.PORTAL_OTP_VERIFY_WINDOW_MS ?? 15 * 60 * 1000);
const portalOtpVerifyMax = Number(
  process.env.PORTAL_OTP_VERIFY_MAX ?? (process.env.NODE_ENV === "production" ? 30 : 400),
);

const portalRequestOtpLimiter = rateLimit({
  windowMs: portalOtpRequestWindowMs,
  max: portalOtpRequestMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many OTP requests", code: "RATE_LIMIT" },
});

const portalVerifyOtpLimiter = rateLimit({
  windowMs: portalOtpVerifyWindowMs,
  max: portalOtpVerifyMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many verification attempts", code: "RATE_LIMIT" },
});

// Public — OTP ve slug çözümü
portalRouter.get("/clinics/:slug", asyncHandler(resolveClinicHandler));
portalRouter.post("/auth/request-otp", portalRequestOtpLimiter, asyncHandler(requestOtpHandler));
portalRouter.post("/auth/register", portalRequestOtpLimiter, asyncHandler(registerPortalHandler));
portalRouter.post("/auth/verify-otp", portalVerifyOtpLimiter, asyncHandler(verifyOtpHandler));

/** JWT veya `?token=` (signed-url) ile dosya indirme */
portalRouter.get(
  "/files/:fileId/download",
  portalOptionalAuthenticate,
  asyncHandler(portalDownloadPatientFileHandler),
);

// Protected — hasta token'ı gerekir
portalRouter.use(portalAuthenticate);
portalRouter.get("/me", asyncHandler(meHandler));
portalRouter.get("/home", asyncHandler(homeHandler));
portalRouter.get("/dentists", asyncHandler(dentistsHandler));
portalRouter.get("/availability", asyncHandler(availabilityHandler));
portalRouter.post("/appointments", asyncHandler(bookHandler));
portalRouter.get("/appointments", asyncHandler(myAppointmentsHandler));
portalRouter.post("/appointments/:id/cancel", asyncHandler(cancelAppointmentHandler));
portalRouter.get("/chart", asyncHandler(chartHandler));
portalRouter.get("/history", asyncHandler(historyHandler));
portalRouter.get("/medical-history", asyncHandler(medicalHistoryGetHandler));
portalRouter.put("/medical-history", asyncHandler(medicalHistoryUpdateHandler));
portalRouter.post("/invoices/:id/paymongo", asyncHandler(portalPaymongoHandler));
portalRouter.get("/invoices/:id/pdf", asyncHandler(portalDownloadInvoicePdfHandler));
portalRouter.get("/files", asyncHandler(portalPatientFilesHandler));
portalRouter.get("/files/:fileId/signed-url", asyncHandler(portalFileSignedUrlHandler));
