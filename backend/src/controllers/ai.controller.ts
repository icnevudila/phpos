import { Request, Response } from "express";
import { dbTasks } from "../lib/dbTasks.js";
import { prisma } from "../lib/prisma.js";

/**
 * AI Chat Proxy Controller
 * Forwards requests to the Vercel-hosted AI chatbot with added clinic context.
 */
export async function aiChatProxyHandler(req: Request, res: Response): Promise<void> {
  const { patientId } = req.body;
  const clinicId = (req as any).user?.clinicId;

  if (!clinicId) {
    res.status(401).json({ success: false, error: "Unauthorized" });
    return;
  }

  try {
    // 1. Fetch clinic context (simplified)
    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
      select: { name: true, philhealthAccreditationNo: true }
    });

    // 2. Fetch clinical data if patient context is provided
    if (patientId) {
      await dbTasks([
        () => prisma.tooth.findMany({ where: { patientId } }),
        () =>
          prisma.appointment.findMany({
            where: { patientId },
            orderBy: { scheduledAt: "desc" },
            take: 5,
          }),
        () => prisma.hmoClaim.findMany({ where: { patientId } }),
      ] as const);
    }

    // Mock response for now
    res.json({
      success: true,
      message: `Hello! I am connected to the ${clinic?.name} knowledge base. How can I assist you today?`
    });

  } catch (error) {
    console.error("AI Proxy Error:", error);
    res.status(500).json({ success: false, error: "AI Assistant currently unavailable" });
  }
}
