import { Router } from "express";
import { aiChatProxyHandler } from "../controllers/ai.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";

const aiRouter = Router();

/**
 * AI Chat Proxy
 * POST /api/ai/chat
 */
aiRouter.post("/chat", authenticate, aiChatProxyHandler);

export { aiRouter };
