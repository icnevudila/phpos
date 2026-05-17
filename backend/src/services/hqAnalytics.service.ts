import { prisma } from "../lib/prisma.js";

export async function getOrganizationAnalytics(organizationId: string) {
  const clinics = await prisma.clinic.findMany({
    where: { organizationId },
    select: { id: true, name: true, city: true }
  });

  const clinicIds = clinics.map(c => c.id);

  // We need to map payments back to clinics
  const invoices = await prisma.invoice.findMany({
    where: { clinicId: { in: clinicIds } },
    select: { id: true, clinicId: true, total: true }
  });

  const clinicStats = clinics.map(clinic => {
    const clinicInvoices = invoices.filter(i => i.clinicId === clinic.id);
    const totalRevenue = clinicInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);
    return {
      clinicId: clinic.id,
      name: clinic.name,
      city: clinic.city,
      revenue: totalRevenue,
      invoicesCount: clinicInvoices.length
    };
  });

  return {
    organizationId,
    totalClinics: clinics.length,
    totalRevenue: clinicStats.reduce((sum, s) => sum + s.revenue, 0),
    clinicStats
  };
}
