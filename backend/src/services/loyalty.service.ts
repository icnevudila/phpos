import { prisma } from "../lib/prisma.js";

/**
 * Calculates and awards loyalty points based on payment amount.
 * Rule: 1 point per 100 PHP spent.
 */
export async function awardPointsForPayment(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { invoice: { include: { patient: true } } }
  });

  if (!payment || !payment.invoice.patientId) return;

  const amount = Number(payment.amount);
  const pointsToAward = Math.floor(amount / 100);

  if (pointsToAward <= 0) return;

  await prisma.patient.update({
    where: { id: payment.invoice.patientId },
    data: {
      loyaltyPoints: {
        increment: pointsToAward
      }
    }
  });

  console.info(`[Loyalty] Awarded ${pointsToAward} points to patient ${payment.invoice.patientId}`);
}

export async function redeemPoints(patientId: string, points: number) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { loyaltyPoints: true }
  });

  if (!patient || patient.loyaltyPoints < points) {
    throw new Error("Insufficient loyalty points");
  }

  return await prisma.patient.update({
    where: { id: patientId },
    data: {
      loyaltyPoints: {
        decrement: points
      }
    }
  });
}
