import { Router } from "express";

import { publicQueueDisplayHandler } from "../controllers/public.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const publicRouter = Router();

/** Lobby ekranı — `PUBLIC_QUEUE_DISPLAY_TOKEN` + `clinicId` veya `slug`. */
publicRouter.get("/queue", asyncHandler(publicQueueDisplayHandler));
