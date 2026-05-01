import re

with open('backend/src/services/invoice.service.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# The broken section marker
start_marker = '''  const statutoryCents = Math.max(seniorDiscountCents, pwdDiscountCents);


  const existing = await prisma.invoice.findFirst({
    where: { clinicId, appointmentId: appt.id },
    select: {
      id: true,
      discount: true,
      payments: { select: { amount: true } },
    },
  });

  if (!existing) {
    const discountC


  const existing = await prisma.invoice.findFirst({
    where: { clinicId, appointmentId: appt.id },
    select: {
      id: true,
      discount: true,
      payments: { select: { amount: true } },
    },
  });

  if (!existing) {
    const discountCents = Math.min(subtotalCents, statutory);
    const totalStart = Math.max(0, subtotalCents - discountCents);
    const created = await prisma.$transaction(async (tx) => {
      const orNumber = await nextOrNumber(tx, clinicId);
      return tx.invoice.create({
        data: {
          clinicId,
          patientId: appt.patientId,
          appointmentId: appt.id,
          orNumber,
          subtotal: fromCents(subtotalCents),
          discount: fromCents(discountCents),
          total: fromCents(totalStart),
          status: InvoiceStatus.UNPAID,
        },
        select: publicSelect,
      });
    });
    return toDto(created, await loadTreatments(created.appointmentId));
  }

  const discountCents = Math.min(
    subtotalCents,
    Math.max(toCents(existing.discount), statutory),
  );
  const totalCents = Math.max(0, subtotalCents - discountCents);'''

replacement = '''  const statutoryCents = Math.max(seniorDiscountCents, pwdDiscountCents);
  const vatExempt = ph.isSeniorCitizen || !!(ph.pwdIdNo?.trim().length);
  const vatRate = vatExempt ? 0 : 0.12;

  const existing = await prisma.invoice.findFirst({
    where: { clinicId, appointmentId: appt.id },
    select: {
      id: true,
      discount: true,
      payments: { select: { amount: true } },
    },
  });

  if (!existing) {
    const discountCents = Math.min(subtotalCents, statutoryCents);
    const vatAmountCents = vatExempt ? 0 : Math.round((subtotalCents - discountCents) * vatRate);
    const totalCents = Math.max(0, subtotalCents - discountCents + vatAmountCents);
    const created = await prisma.$transaction(async (tx) => {
      const orNumber = await nextOrNumber(tx, clinicId);
      return tx.invoice.create({
        data: {
          clinicId,
          patientId: appt.patientId,
          appointmentId: appt.id,
          orNumber,
          subtotal: fromCents(subtotalCents),
          discount: fromCents(discountCents),
          vatRate: new Prisma.Decimal(vatRate.toFixed(4)),
          vatAmount: fromCents(vatAmountCents),
          seniorDiscount: fromCents(seniorDiscountCents),
          pwdDiscount: fromCents(pwdDiscountCents),
          vatExempt,
          total: fromCents(totalCents),
          status: InvoiceStatus.UNPAID,
        },
        select: publicSelect,
      });
    });
    return toDto(created, await loadTreatments(created.appointmentId));
  }

  const discountCents = Math.min(
    subtotalCents,
    Math.max(toCents(existing.discount), statutoryCents),
  );
  const vatAmountCents = vatExempt ? 0 : Math.round((subtotalCents - discountCents) * vatRate);
  const totalCents = Math.max(0, subtotalCents - discountCents + vatAmountCents);'''

if start_marker in content:
    content = content.replace(start_marker, replacement)
    with open('backend/src/services/invoice.service.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Fixed successfully')
else:
    print('Marker not found')
    # Try line-based approach
    lines = content.split('\n')
    out = []
    i = 0
    while i < len(lines):
        line = lines[i]
        # Look for the broken duplicate pattern
        if 'const discountC' in line and i+1 < len(lines) and lines[i+1].strip() == '':
            # Skip broken line
            i += 1
            continue
        out.append(line)
        i += 1
    # This won't fully fix it, just report
    print(f'Lines: {len(lines)}')
