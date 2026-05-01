import fs from 'fs';
import path from 'path';

const file = path.join('backend', 'prisma', 'schema.prisma');
let content = fs.readFileSync(file, 'utf8');

// Add to User model
content = content.replace(
  '  lastName         String\n  phone            String?\n  isActive         Boolean  @default(true)',
  '  lastName         String\n  phone            String?\n  isActive         Boolean  @default(true)\n  prcNumber        String?\n  ptrNumber        String?\n  s2License        String?\n  tinNumber        String?'
);

content = content.replace(
  '  treatments               Treatment[]      @relation("TreatmentDentist")',
  '  treatments               Treatment[]      @relation("TreatmentDentist")\n  prescriptions            Prescription[]   @relation("PrescriptionDentist")'
);

// Add to Patient model
content = content.replace(
  '  waitlistEntries WaitlistEntry[]',
  '  waitlistEntries WaitlistEntry[]\n  prescriptions  Prescription[]'
);

// Add to Clinic model
content = content.replace(
  '  waitlistEntries      WaitlistEntry[]',
  '  waitlistEntries      WaitlistEntry[]\n  prescriptions        Prescription[]'
);

if (!content.includes('model Prescription ')) {
// Add Enums and Models
content += '\n\n// ─── Prescription Module ──────────────────────────────────────────────\n\n' +
'enum PrescriptionStatus {\n' +
'  DRAFT\n' +
'  FINALIZED\n' +
'  CANCELLED\n' +
'}\n\n' +
'model Prescription {\n' +
'  id               String             @id @default(cuid())\n' +
'  clinicId         String\n' +
'  patientId        String\n' +
'  dentistId        String\n' +
'  appointmentId    String?\n' +
'  prescriptionDate DateTime           @default(now())\n' +
'  notes            String?\n' +
'  status           PrescriptionStatus @default(DRAFT)\n' +
'  createdAt        DateTime           @default(now())\n' +
'  updatedAt        DateTime           @updatedAt\n\n' +
'  clinic      Clinic            @relation(fields: [clinicId], references: [id], onDelete: Cascade)\n' +
'  patient     Patient           @relation(fields: [patientId], references: [id], onDelete: Cascade)\n' +
'  dentist     User              @relation("PrescriptionDentist", fields: [dentistId], references: [id], onDelete: Restrict)\n' +
'  appointment Appointment?      @relation(fields: [appointmentId], references: [id], onDelete: SetNull)\n' +
'  items       PrescriptionItem[]\n\n' +
'  @@index([clinicId])\n' +
'  @@index([patientId])\n' +
'  @@index([dentistId])\n' +
'  @@index([prescriptionDate])\n' +
'}\n\n' +
'model PrescriptionItem {\n' +
'  id                  String       @id @default(cuid())\n' +
'  prescriptionId      String\n' +
'  medicineName        String\n' +
'  dosage              String\n' +
'  frequency           String\n' +
'  quantity            Int\n' +
'  specialInstructions String?\n\n' +
'  prescription Prescription @relation(fields: [prescriptionId], references: [id], onDelete: Cascade)\n\n' +
'  @@index([prescriptionId])\n' +
'}\n';
}

fs.writeFileSync(file, content);
console.log('schema.prisma updated successfully.');
