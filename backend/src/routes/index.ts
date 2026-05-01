import { Router } from "express";

import { healthController } from "../controllers/index.js";
import { auditTrailMiddleware } from "../middleware/auditTrailMiddleware.js";
import { appointmentRouter, userRouter } from "./appointment.routes.js";
import { authRouter } from "./auth.routes.js";
import { clinicRouter } from "./clinic.routes.js";
import { hmoRouter } from "./hmo.routes.js";
import { inventoryRouter } from "./inventory.routes.js";
import {
  appointmentInvoiceRouter,
  invoiceRouter,
  webhookRouter,
} from "./invoice.routes.js";
import { notificationRouter } from "./notification.routes.js";
import { patientRouter } from "./patient.routes.js";
import { perioRouter } from "./perio.routes.js";
import { portalRouter } from "./portal.routes.js";
import { reportsRouter } from "./reports.routes.js";
import {
  appointmentTreatmentRouter,
  treatmentRouter,
} from "./treatment.routes.js";
import { staffUserRouter } from "./staffUser.routes.js";
import { waitlistRouter } from "./waitlist.routes.js";
import { prescriptionRouter } from "./prescription.routes.js";

export const apiRouter = Router();

apiRouter.use(auditTrailMiddleware);

apiRouter.get("/health", healthController);
apiRouter.use("/auth", authRouter);
apiRouter.use("/clinic", clinicRouter);
apiRouter.use("/staff/users", staffUserRouter);
apiRouter.use("/patients", patientRouter);
apiRouter.use("/appointments", appointmentRouter);
apiRouter.use("/waitlist", waitlistRouter);
apiRouter.use("/appointments", appointmentInvoiceRouter);
apiRouter.use("/appointments/:appointmentId/treatments", appointmentTreatmentRouter);
apiRouter.use("/treatments", treatmentRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/invoices", invoiceRouter);
apiRouter.use("/inventory", inventoryRouter);
apiRouter.use("/hmo", hmoRouter);
apiRouter.use("/notifications", notificationRouter);
apiRouter.use("/reports", reportsRouter);
apiRouter.use("/perio-exams", perioRouter);
apiRouter.use("/prescriptions", prescriptionRouter);
apiRouter.use("/portal", portalRouter);
apiRouter.use("/webhooks", webhookRouter);
