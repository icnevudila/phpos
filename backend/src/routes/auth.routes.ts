import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  loginHandler,
  logoutHandler,
  meHandler,
  refreshHandler,
  registerHandler,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/supabaseAuthMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authRouter = Router();

const authStrictWindowMs = Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000);
const authStrictMax = Number(
  process.env.AUTH_RATE_LIMIT_MAX ?? (process.env.NODE_ENV === "production" ? 30 : 400),
);
const authStrictLimiter = rateLimit({
  windowMs: authStrictWindowMs,
  max: authStrictMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many attempts", code: "RATE_LIMIT" },
});

authRouter.post("/register", authStrictLimiter, asyncHandler(registerHandler));
authRouter.post("/login", authStrictLimiter, asyncHandler(loginHandler));
authRouter.post("/refresh", asyncHandler(refreshHandler));
authRouter.get("/me", authenticate, asyncHandler(meHandler));
authRouter.post("/logout", authenticate, asyncHandler(logoutHandler));
