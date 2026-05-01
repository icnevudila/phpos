import type { RequestHandler } from "express";

export const healthController: RequestHandler = (_req, res) => {
  res.json({
    success: true,
    data: { status: "ok", scope: "api" },
  });
};
