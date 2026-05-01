import cors from "cors";
import express, { type Express, type NextFunction, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { ZodError } from "zod";

import { apiRouter } from "./routes/index.js";
import { registerNotificationListeners } from "./services/notification/listeners.js";
import { startNotificationScheduler } from "./services/notification/scheduler.js";
import { AppError } from "./utils/errors.js";

let listenersRegistered = false;
let schedulerStarted = false;

export function createApp(): Express {
  const app = express();

  if (!listenersRegistered) {
    registerNotificationListeners();
    listenersRegistered = true;
  }
  if (!schedulerStarted && process.env.NODE_ENV !== "test") {
    startNotificationScheduler();
    schedulerStarted = true;
  }

  app.use(helmet());
  const corsOrigins = (process.env.CORS_ORIGIN ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (process.env.NODE_ENV === "production" && corsOrigins.length === 0) {
    console.warn(
      "[cors] CORS_ORIGIN is empty in production — browsers will not receive Access-Control-Allow-Origin for staff/portal SPA. Set comma-separated origins (e.g. https://app.example.com).",
    );
  }
  const allowAllDev =
    process.env.NODE_ENV !== "production" && corsOrigins.length === 0;
  app.use(
    cors({
      origin:
        corsOrigins.length > 0
          ? corsOrigins
          : allowAllDev
            ? true
            : false,
      credentials: true,
    }),
  );

  app.use(
    express.json({
      limit: "1mb",
      verify: (req: Request, _res, buf: Buffer) => {
        req.rawBody = buf;
      },
    }),
  );
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

  const apiPrefix = process.env.API_PREFIX ?? "/api";
  const globalWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000);
  const globalMax = Number(process.env.RATE_LIMIT_MAX ?? (process.env.NODE_ENV === "production" ? 500 : 5000));
  app.use(
    apiPrefix,
    rateLimit({
      windowMs: globalWindowMs,
      max: globalMax,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.use(apiPrefix, apiRouter);

  /** GAP-001: Hasta dosyaları artık public static ile servis edilmiyor; JWT ile GET /api/patients/:id/files/:fileId/download */

  app.get("/health", (_req, res) => {
    res.json({ success: true, data: { status: "ok", service: "dentease-api" } });
  });

  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: "Not Found",
      code: "NOT_FOUND",
    });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({
        success: false,
        error: err.message,
        code: err.code,
      });
      return;
    }
    if (err instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        code: "VALIDATION_ERROR",
      });
      return;
    }
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      code: "INTERNAL_ERROR",
    });
  });

  return app;
}
