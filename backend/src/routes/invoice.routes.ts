import { UserRole } from "@prisma/client";
import { Router } from "express";

import {
  addPaymentHandler,
  createInvoiceHandler,
  deleteInvoiceHandler,
  getInvoiceHandler,
  invoicePdfHandler,
  philhealthWorksheetPdfHandler,
  bir2307PdfHandler,
  listInvoicesHandler,
  paymongoCheckoutHandler,
  paymongoWebhookHandler,
  simulatePaymongoPaidHandler,
  updateInvoiceHandler,
} from "../controllers/invoice.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { roleGuard } from "../middleware/roleGuard.js";
import { paymongoIpGuard } from "../middleware/webhookIpGuard.js";
import { verifyPaymongoSignature } from "../middleware/paymongoSignature.js";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/errors.js";

const readRoles = [UserRole.ADMIN, UserRole.DENTIST, UserRole.RECEPTIONIST];
const writeRoles = [UserRole.ADMIN, UserRole.DENTIST, UserRole.RECEPTIONIST];

export const invoiceRouter = Router();

invoiceRouter.use(authenticate);
invoiceRouter.use(roleGuard(readRoles));

invoiceRouter.get("/", asyncHandler(listInvoicesHandler));
invoiceRouter.post("/", roleGuard(writeRoles), asyncHandler(createInvoiceHandler));
invoiceRouter.get("/:id/pdf", asyncHandler(invoicePdfHandler));
invoiceRouter.get("/:id/philhealth-worksheet", asyncHandler(philhealthWorksheetPdfHandler));
invoiceRouter.get("/:id/bir-2307", asyncHandler(bir2307PdfHandler));
invoiceRouter.get("/:id", asyncHandler(getInvoiceHandler));
invoiceRouter.put("/:id", roleGuard(writeRoles), asyncHandler(updateInvoiceHandler));
invoiceRouter.delete(
  "/:id",
  roleGuard([UserRole.ADMIN, UserRole.DENTIST]),
  asyncHandler(deleteInvoiceHandler),
);
invoiceRouter.post(
  "/:id/payments",
  roleGuard(writeRoles),
  asyncHandler(addPaymentHandler),
);
invoiceRouter.post(
  "/:id/paymongo",
  roleGuard(writeRoles),
  asyncHandler(paymongoCheckoutHandler),
);
invoiceRouter.post(
  "/:id/paymongo/simulate",
  roleGuard(writeRoles),
  asyncHandler(simulatePaymongoPaidHandler),
);


// Webhook — public; GAP-002: production'da PAYMONGO_WEBHOOK_SECRET + Paymongo-Signature zorunlu
export const webhookRouter = Router();
webhookRouter.post(
  "/paymongo",
  paymongoIpGuard,
  verifyPaymongoSignature,
  asyncHandler(paymongoWebhookHandler)
);

// Hızlı uygunluk: appointment'a bağlı invoice var mı? (frontend için)
export const appointmentInvoiceRouter = Router();
appointmentInvoiceRouter.use(authenticate);
appointmentInvoiceRouter.use(roleGuard(readRoles));
appointmentInvoiceRouter.get(
  "/:appointmentId/invoice",
  asyncHandler(async (req, res) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
    const invoice = await prisma.invoice.findFirst({
      where: { clinicId, appointmentId: req.params.appointmentId },
      select: { id: true, status: true, orNumber: true },
    });
    res.json({ success: true, data: invoice });
  }),
);
