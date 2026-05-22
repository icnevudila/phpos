import { UserRole } from "@prisma/client";
import { Router } from "express";

import {
  listNotificationsHandler,
  sendTestSmsHandler,
  triggerDailyReminderHandler,
  triggerEodEmailHandler,
  triggerSoonReminderHandler,
  sendBulkSmsHandler,
  retryNotificationHandler,
} from "../controllers/notification.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { roleGuard } from "../middleware/roleGuard.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const notificationRouter = Router();
notificationRouter.use(authenticate);
notificationRouter.use(
  roleGuard([UserRole.ADMIN, UserRole.DENTIST, UserRole.RECEPTIONIST]),
);

notificationRouter.get("/", asyncHandler(listNotificationsHandler));
notificationRouter.post(
  "/test",
  roleGuard([UserRole.ADMIN]),
  asyncHandler(sendTestSmsHandler),
);
notificationRouter.post(
  "/cron/daily",
  roleGuard([UserRole.ADMIN]),
  asyncHandler(triggerDailyReminderHandler),
);
notificationRouter.post(
  "/cron/soon",
  roleGuard([UserRole.ADMIN]),
  asyncHandler(triggerSoonReminderHandler),
);
notificationRouter.post(
  "/cron/eod-email",
  roleGuard([UserRole.ADMIN]),
  asyncHandler(triggerEodEmailHandler),
);

notificationRouter.post(
  "/bulk",
  roleGuard([UserRole.ADMIN]),
  asyncHandler(sendBulkSmsHandler),
);

notificationRouter.post(
  "/retry/:id",
  roleGuard([UserRole.ADMIN, UserRole.RECEPTIONIST]),
  asyncHandler(retryNotificationHandler),
);
