import {
  AppointmentStatus,
  InvoiceStatus,
  Prisma,
  PrismaClient,
  SubscriptionPlan,
  UserRole,
  WaitlistStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log("Seeding DentEase PH demo data…");

  const clinic = await prisma.clinic.upsert({
    where: { id: "demo-clinic" },
    update: { slug: "iloilo-demo" },
    create: {
      id: "demo-clinic",
      slug: "iloilo-demo",
      name: "DentEase PH – Iloilo Branch",
      address: "123 Rizal Street",
      city: "Iloilo City",
      phone: "+639171234567",
      tin: "123-456-789-000",
      birPtuNo: "PTU-2024-001",
      birAccreditationNo: "BIR-ACC-2024-001",
      subscriptionPlan: SubscriptionPlan.PRO,
    },
  });

  const passwordHash = await bcrypt.hash("admin123", 12);
  const dentistHash = await bcrypt.hash("dentist123", 12);
  const receptionHash = await bcrypt.hash("reception123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@dentease.ph" },
    update: { passwordHash, isActive: true, clinicId: clinic.id },
    create: {
      email: "admin@dentease.ph",
      passwordHash,
      role: UserRole.ADMIN,
      firstName: "Maria",
      lastName: "Santos",
      phone: "+639171112233",
      clinicId: clinic.id,
    },
  });

  const dentist = await prisma.user.upsert({
    where: { email: "dentist@dentease.ph" },
    update: { passwordHash: dentistHash, isActive: true, clinicId: clinic.id },
    create: {
      email: "dentist@dentease.ph",
      passwordHash: dentistHash,
      role: UserRole.DENTIST,
      firstName: "Jose",
      lastName: "Rizal",
      phone: "+639175554433",
      clinicId: clinic.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "reception@dentease.ph" },
    update: { passwordHash: receptionHash, isActive: true, clinicId: clinic.id },
    create: {
      email: "reception@dentease.ph",
      passwordHash: receptionHash,
      role: UserRole.RECEPTIONIST,
      firstName: "Ana",
      lastName: "Cruz",
      phone: "+639179998877",
      clinicId: clinic.id,
    },
  });

  // Patients
  const p1 = await prisma.patient.upsert({
    where: { id: "demo-patient-1" },
    update: {},
    create: {
      id: "demo-patient-1",
      clinicId: clinic.id,
      firstName: "Juan",
      middleName: "Reyes",
      lastName: "dela Cruz",
      nickname: "Johnny",
      phone: "+639181112222",
      email: "juan@example.ph",
      birthDate: new Date("1995-05-10"),
      gender: "MALE",
      civilStatus: "SINGLE",
      religion: "Roman Catholic",
      nationality: "Filipino",
      occupation: "Software Engineer",
      address: "45 Mabini Ave.",
      city: "Iloilo City",
      province: "Iloilo",
      referralSource: "Friend",
      previousDentist: "Dr. Santos",
      lastDentalVisit: new Date("2023-10-15"),
      reasonForVisit: "Routine check-up and cleaning",
      bloodPressureSystolic: 118,
      bloodPressureDiastolic: 76,
      pulseRate: 72,
      allergies: ["Penicillin"],
      philhealthNo: "12-345678901-2",
      emergencyContactName: "Maria dela Cruz",
      emergencyContactPhone: "+639181119999",
    },
  });

  const p2 = await prisma.patient.upsert({
    where: { id: "demo-patient-2" },
    update: {},
    create: {
      id: "demo-patient-2",
      clinicId: clinic.id,
      firstName: "Liza",
      lastName: "Bautista",
      phone: "+639182223344",
      birthDate: new Date("1988-12-02"),
      gender: "FEMALE",
      civilStatus: "MARRIED",
      nationality: "Filipino",
      occupation: "Teacher",
      city: "Cebu City",
      province: "Cebu",
      reasonForVisit: "Toothache upper right molar",
      bloodPressureSystolic: 122,
      bloodPressureDiastolic: 80,
      pulseRate: 78,
      allergies: [],
    },
  });

  // Senior citizen demo patient (RA 9994)
  const p3 = await prisma.patient.upsert({
    where: { id: "demo-patient-3" },
    update: {},
    create: {
      id: "demo-patient-3",
      clinicId: clinic.id,
      firstName: "Roberto",
      lastName: "Garcia",
      phone: "+639183334455",
      birthDate: new Date("1955-03-15"),
      gender: "MALE",
      civilStatus: "MARRIED",
      nationality: "Filipino",
      occupation: "Retired Teacher",
      address: "78 Bonifacio St.",
      city: "Iloilo City",
      province: "Iloilo",
      reasonForVisit: "Denture fitting",
      isSeniorCitizen: true,
      oscaIdNo: "OSCA-ILO-123456",
      bloodPressureSystolic: 130,
      bloodPressureDiastolic: 85,
      pulseRate: 76,
      allergies: [],
    },
  });

  // PWD demo patient (RA 10754)
  const p4 = await prisma.patient.upsert({
    where: { id: "demo-patient-4" },
    update: {},
    create: {
      id: "demo-patient-4",
      clinicId: clinic.id,
      firstName: "Maria",
      lastName: "Torres",
      phone: "+639184445566",
      birthDate: new Date("1990-07-20"),
      gender: "FEMALE",
      civilStatus: "SINGLE",
      nationality: "Filipino",
      occupation: "Graphic Designer",
      address: "22 Luna St.",
      city: "Iloilo City",
      province: "Iloilo",
      reasonForVisit: "Dental cleaning",
      pwdIdNo: "PWD-ILO-789012",
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 78,
      pulseRate: 72,
      allergies: [],
    },
  });

  // Örnek medical history
  await prisma.medicalHistory.upsert({
    where: { patientId: p1.id },
    update: {},
    create: {
      patientId: p1.id,
      recordedById: dentist.id,
      underPhysicianCare: false,
      hospitalized: false,
      takingMedications: false,
      seriousIllness: false,
      conditions: ["HBP"],
      allergyPenicillin: true,
      smoker: "NEVER",
      alcohol: "OCCASIONAL",
      recreationalDrug: "NEVER",
      notes: "Patient reports mild hypertension managed with lifestyle.",
    },
  });

  // Appointments – today & upcoming (Asia/Manila)
  const todayKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const at = (hhmm: string, offsetDays = 0) => {
    const base = new Date(`${todayKey}T${hhmm}:00+08:00`);
    base.setUTCDate(base.getUTCDate() + offsetDays);
    return base;
  };

  const slots: Array<{ id: string; patientId: string; time: string; offset: number; status: AppointmentStatus; type: string }> = [
    { id: "demo-apt-1", patientId: p1.id, time: "09:00", offset: 0, status: AppointmentStatus.CHECKED_IN, type: "CHECKUP" },
    { id: "demo-apt-2", patientId: p2.id, time: "10:30", offset: 0, status: AppointmentStatus.IN_PROGRESS, type: "CLEANING" },
    { id: "demo-apt-3", patientId: p1.id, time: "14:00", offset: 0, status: AppointmentStatus.CONFIRMED, type: "FILLING" },
    { id: "demo-apt-4", patientId: p2.id, time: "11:00", offset: 1, status: AppointmentStatus.PENDING, type: "ROOT_CANAL" },
    { id: "demo-apt-5", patientId: p3.id, time: "15:00", offset: 0, status: AppointmentStatus.CONFIRMED, type: "DENTURE" },
    { id: "demo-apt-6", patientId: p4.id, time: "16:00", offset: 0, status: AppointmentStatus.CONFIRMED, type: "CLEANING" },
  ];

  for (const s of slots) {
    await prisma.appointment.upsert({
      where: { id: s.id },
      update: {},
      create: {
        id: s.id,
        clinicId: clinic.id,
        patientId: s.patientId,
        dentistId: dentist.id,
        scheduledAt: at(s.time, s.offset),
        duration: 30,
        status: s.status,
        arrivedAt:
          s.status === AppointmentStatus.CHECKED_IN ||
          s.status === AppointmentStatus.IN_PROGRESS ||
          s.status === AppointmentStatus.COMPLETED
            ? at(s.time, s.offset)
            : null,
        inProgressAt:
          s.status === AppointmentStatus.IN_PROGRESS || s.status === AppointmentStatus.COMPLETED
            ? at(s.time, s.offset)
            : null,
        completedAt: s.status === AppointmentStatus.COMPLETED ? at(s.time, s.offset) : null,
        type: s.type,
        notes: null,
      },
    });
  }

  // Demo treatments on first appointment + invoice (regular patient)
  const aptForInvoice = "demo-apt-1";
  await prisma.treatment.deleteMany({ where: { appointmentId: aptForInvoice } });
  await prisma.treatment.createMany({
    data: [
      {
        id: "demo-tx-1",
        appointmentId: aptForInvoice,
        patientId: p1.id,
        dentistId: dentist.id,
        toothIds: ["16"],
        procedure: "Filling",
        quantity: 1,
        unitPrice: new Prisma.Decimal("1500.00"),
        notes: "Composite filling on occlusal surface",
      },
      {
        id: "demo-tx-2",
        appointmentId: aptForInvoice,
        patientId: p1.id,
        dentistId: dentist.id,
        toothIds: [],
        procedure: "Consultation",
        quantity: 1,
        unitPrice: new Prisma.Decimal("500.00"),
      },
    ],
  });

  // Demo treatments for senior patient (VAT exempt + 20% discount)
  const aptSenior = "demo-apt-5";
  await prisma.treatment.deleteMany({ where: { appointmentId: aptSenior } });
  await prisma.treatment.createMany({
    data: [
      {
        id: "demo-tx-3",
        appointmentId: aptSenior,
        patientId: p3.id,
        dentistId: dentist.id,
        toothIds: [],
        procedure: "Complete Denture",
        quantity: 1,
        unitPrice: new Prisma.Decimal("8000.00"),
        notes: "Upper complete denture",
      },
      {
        id: "demo-tx-4",
        appointmentId: aptSenior,
        patientId: p3.id,
        dentistId: dentist.id,
        toothIds: [],
        procedure: "Consultation",
        quantity: 1,
        unitPrice: new Prisma.Decimal("500.00"),
      },
    ],
  });

  // Sample invoice (PARTIAL paid) — regular patient with VAT
  const existing = await prisma.invoice.findUnique({
    where: { appointmentId: aptForInvoice },
  });
  const invoiceId = existing?.id ?? "demo-inv-1";
  if (!existing) {
    const year = new Date().getFullYear();
    await prisma.orSequence.upsert({
      where: { clinicId_year: { clinicId: clinic.id, year } },
      update: { lastNumber: 1 },
      create: { clinicId: clinic.id, year, lastNumber: 1 },
    });
    await prisma.invoice.create({
      data: {
        id: "demo-inv-1",
        clinicId: clinic.id,
        patientId: p1.id,
        appointmentId: aptForInvoice,
        orNumber: `OR-${year}-0001`,
        subtotal: new Prisma.Decimal("2000.00"),
        discount: new Prisma.Decimal("0.00"),
        vatRate: new Prisma.Decimal("0.12"),
        vatAmount: new Prisma.Decimal("240.00"),
        seniorDiscount: new Prisma.Decimal("0.00"),
        pwdDiscount: new Prisma.Decimal("0.00"),
        vatExempt: false,
        total: new Prisma.Decimal("2240.00"),
        status: InvoiceStatus.PARTIAL,
        payments: {
          create: {
            amount: new Prisma.Decimal("500.00"),
            method: "CASH",
            notes: "Downpayment",
          },
        },
      },
    });
  }

  // Sample invoice for senior patient (VAT exempt + 20% discount)
  const existingSenior = await prisma.invoice.findUnique({
    where: { appointmentId: aptSenior },
  });
  if (!existingSenior) {
    const year = new Date().getFullYear();
    await prisma.orSequence.upsert({
      where: { clinicId_year: { clinicId: clinic.id, year } },
      update: { lastNumber: 2 },
      create: { clinicId: clinic.id, year, lastNumber: 2 },
    });
    await prisma.invoice.create({
      data: {
        id: "demo-inv-2",
        clinicId: clinic.id,
        patientId: p3.id,
        appointmentId: aptSenior,
        orNumber: `OR-${year}-0002`,
        subtotal: new Prisma.Decimal("8500.00"),
        discount: new Prisma.Decimal("1700.00"),
        vatRate: new Prisma.Decimal("0.00"),
        vatAmount: new Prisma.Decimal("0.00"),
        seniorDiscount: new Prisma.Decimal("1700.00"),
        pwdDiscount: new Prisma.Decimal("0.00"),
        vatExempt: true,
        total: new Prisma.Decimal("6800.00"),
        status: InvoiceStatus.UNPAID,
      },
    });
  }

  // Inventory demo items
  const inventoryDemo: Array<{
    id: string;
    itemName: string;
    category: string;
    unit: string;
    quantity: number;
    minimumStock: number;
    unitCost: string;
    supplier: string | null;
    expiryDate: Date | null;
  }> = [
    {
      id: "demo-inv-lidocaine",
      itemName: "Lidocaine 2% w/ epinephrine",
      category: "Anesthetics",
      unit: "cartridge",
      quantity: 24,
      minimumStock: 40,
      unitCost: "55.00",
      supplier: "Septodont PH",
      expiryDate: new Date(Date.now() + 20 * 86_400_000), // 20 days
    },
    {
      id: "demo-inv-composite",
      itemName: "Composite resin shade A2",
      category: "Filling Materials",
      unit: "syringe",
      quantity: 8,
      minimumStock: 5,
      unitCost: "1200.00",
      supplier: "3M ESPE",
      expiryDate: new Date(Date.now() + 180 * 86_400_000),
    },
    {
      id: "demo-inv-gloves",
      itemName: "Nitrile exam gloves (M)",
      category: "Disposables",
      unit: "box",
      quantity: 3,
      minimumStock: 10,
      unitCost: "320.00",
      supplier: "Medicom",
      expiryDate: null,
    },
    {
      id: "demo-inv-forceps",
      itemName: "Forceps #150 upper",
      category: "Instruments",
      unit: "pc",
      quantity: 2,
      minimumStock: 2,
      unitCost: "2400.00",
      supplier: "Hu-Friedy",
      expiryDate: null,
    },
    {
      id: "demo-inv-amoxi",
      itemName: "Amoxicillin 500mg",
      category: "Medications",
      unit: "capsule",
      quantity: 0,
      minimumStock: 30,
      unitCost: "12.00",
      supplier: "Unilab",
      expiryDate: new Date(Date.now() + 60 * 86_400_000),
    },
    {
      id: "demo-inv-gauze",
      itemName: "Sterile gauze 2x2",
      category: "Disposables",
      unit: "pack",
      quantity: 50,
      minimumStock: 20,
      unitCost: "45.00",
      supplier: "Medicom",
      expiryDate: null,
    },
  ];
  for (const item of inventoryDemo) {
    await prisma.inventory.upsert({
      where: { id: item.id },
      update: {
        quantity: item.quantity,
        minimumStock: item.minimumStock,
        unitCost: new Prisma.Decimal(item.unitCost),
        supplier: item.supplier,
        expiryDate: item.expiryDate,
      },
      create: {
        id: item.id,
        clinicId: clinic.id,
        itemName: item.itemName,
        category: item.category,
        unit: item.unit,
        quantity: item.quantity,
        minimumStock: item.minimumStock,
        unitCost: new Prisma.Decimal(item.unitCost),
        supplier: item.supplier,
        expiryDate: item.expiryDate,
      },
    });
  }

  // HMO providers (PH) + membership + sample claim
  const providers = [
    { id: "hmo-maxicare", name: "Maxicare", code: "MAXI" },
    { id: "hmo-intellicare", name: "Intellicare", code: "INTL" },
    { id: "hmo-philhealth", name: "PhilHealth", code: "PHIC" },
    { id: "hmo-medicard", name: "Medicard", code: "MEDI" },
  ];
  for (const p of providers) {
    await prisma.hmoProvider.upsert({
      where: { id: p.id },
      update: { name: p.name, code: p.code, isActive: true, clinicId: clinic.id },
      create: {
        id: p.id,
        clinicId: clinic.id,
        name: p.name,
        code: p.code,
        isActive: true,
      },
    });
  }

  await prisma.patientHmo.upsert({
    where: { patientId_providerId: { patientId: p1.id, providerId: "hmo-maxicare" } },
    update: {
      memberNumber: "MAXI-001-77889",
      cardholderName: "Juan dela Cruz",
      sponsor: "Iloilo General",
      isPrimary: true,
    },
    create: {
      patientId: p1.id,
      providerId: "hmo-maxicare",
      memberNumber: "MAXI-001-77889",
      cardholderName: "Juan dela Cruz",
      sponsor: "Iloilo General",
      isPrimary: true,
    },
  });

  const claimYear = new Date().getFullYear();
  await prisma.hmoClaimSequence.upsert({
    where: { clinicId_year: { clinicId: clinic.id, year: claimYear } },
    update: { lastNumber: 1 },
    create: { clinicId: clinic.id, year: claimYear, lastNumber: 1 },
  });
  await prisma.hmoClaim.upsert({
    where: { claimNumber: `CLM-${claimYear}-0001` },
    update: {
      status: "SUBMITTED",
      requestedAmount: new Prisma.Decimal("2000.00"),
      approvedAmount: null,
      patientCopay: new Prisma.Decimal("0.00"),
      clinicId: clinic.id,
      patientId: p1.id,
      invoiceId,
      providerId: "hmo-maxicare",
    },
    create: {
      clinicId: clinic.id,
      patientId: p1.id,
      invoiceId,
      providerId: "hmo-maxicare",
      claimNumber: `CLM-${claimYear}-0001`,
      status: "SUBMITTED",
      requestedAmount: new Prisma.Decimal("2000.00"),
      approvedAmount: null,
      patientCopay: new Prisma.Decimal("0.00"),
      submittedAt: new Date(),
      notes: "Demo HMO claim for dashboard pending card",
    },
  });

  await prisma.waitlistEntry.upsert({
    where: { id: "demo-waitlist-1" },
    update: {
      clinicId: clinic.id,
      patientId: p2.id,
      notes: "Prefers Saturday AM (demo waitlist)",
      status: WaitlistStatus.WAITING,
    },
    create: {
      id: "demo-waitlist-1",
      clinicId: clinic.id,
      patientId: p2.id,
      notes: "Prefers Saturday AM (demo waitlist)",
      status: WaitlistStatus.WAITING,
    },
  });

  console.log("\nDone! Login with:");
  console.log(`  admin      → admin@dentease.ph / admin123   (role=ADMIN  ${admin.id})`);
  console.log(`  dentist    → dentist@dentease.ph / dentist123   (role=DENTIST  ${dentist.id})`);
  console.log(`  reception  → reception@dentease.ph / reception123   (role=RECEPTIONIST)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
