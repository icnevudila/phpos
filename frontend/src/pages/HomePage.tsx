import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, CalendarDays, Users, FileText, Package, Activity, MonitorPlay, ShieldCheck } from "lucide-react";
import { DentQLLogo } from "../components/ui/DentQLLogo";
import { toast } from "sonner";


// --- REUSABLE PREVIEW COMPONENTS (Mocking real UI) ---
function TodayBoardPreview() {
  return (
    <div className="w-full h-full bg-brand-bg rounded-xl border border-brand-border overflow-hidden shadow-card flex flex-col pointer-events-none select-none text-left">
      <div className="h-12 border-b border-brand-border flex items-center px-4 bg-brand-surface justify-between">
        <div className="font-bold text-brand-text">Today Board</div>
        <div className="flex gap-2">
          <div className="h-6 w-24 bg-brand-surface-soft rounded-md border border-brand-border" />
          <div className="h-6 w-6 rounded-md bg-brand-primary-soft text-brand-primary flex items-center justify-center border border-brand-primary/20"><Activity size={12}/></div>
        </div>
      </div>
      <div className="p-4 grid grid-cols-3 gap-4 bg-brand-bg flex-1">
        <div className="col-span-2 space-y-4">
           <div className="flex gap-4">
             <div className="flex-1 bg-brand-surface p-3 rounded-lg border border-brand-border shadow-sm">
                <div className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Scheduled Chairs</div>
                <div className="text-2xl font-black text-brand-text mt-1 tracking-tight">24</div>
             </div>
             <div className="flex-1 bg-brand-surface p-3 rounded-lg border border-brand-border shadow-sm">
                <div className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Waiting Now</div>
                <div className="text-2xl font-black text-brand-text mt-1 tracking-tight">3</div>
             </div>
           </div>
           <div className="bg-brand-surface border border-brand-border rounded-lg shadow-sm h-32 p-3">
              <div className="text-xs font-bold text-brand-text mb-2">Chair Schedule</div>
              <div className="space-y-2">
                <div className="h-6 bg-brand-primary-soft rounded border border-brand-primary/20 flex items-center px-2">
                  <div className="h-2 w-16 bg-brand-primary/40 rounded-full" />
                </div>
                <div className="h-6 bg-brand-surface-soft rounded border border-brand-border flex items-center px-2">
                  <div className="h-2 w-12 bg-brand-border-strong rounded-full" />
                </div>
              </div>
           </div>
        </div>
        <div className="bg-brand-surface border border-brand-border rounded-lg shadow-sm p-3">
           <div className="text-xs font-bold text-brand-text mb-3">Action Center</div>
           <div className="space-y-2">
              <div className="h-10 bg-amber-50 rounded border border-amber-200 p-2 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                 <div className="space-y-1 w-full"><div className="h-1.5 bg-amber-200 rounded w-3/4" /><div className="h-1.5 bg-amber-100 rounded w-1/2" /></div>
              </div>
              <div className="h-10 bg-rose-50 rounded border border-rose-200 p-2 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                 <div className="space-y-1 w-full"><div className="h-1.5 bg-rose-200 rounded w-3/4" /><div className="h-1.5 bg-rose-100 rounded w-1/2" /></div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function ChairSchedulePreview() {
  return (
    <div className="w-full h-full bg-brand-bg rounded-xl border border-brand-border overflow-hidden shadow-card flex flex-col pointer-events-none select-none text-left">
      <div className="h-10 border-b border-brand-border flex items-center px-4 bg-brand-surface gap-4">
        <div className="font-bold text-brand-text text-sm">Chair Schedule</div>
      </div>
      <div className="flex-1 p-2 flex gap-2">
         <div className="w-12 border-r border-brand-border flex flex-col gap-5 pt-7 text-[9px] text-brand-muted font-medium items-end pr-2">
            <div>08:00</div><div>09:00</div><div>10:00</div>
         </div>
         <div className="flex-1 grid grid-cols-3 gap-2">
            <div className="bg-brand-surface rounded-md border border-brand-border p-1 relative shadow-sm">
               <div className="text-[10px] font-bold text-center border-b border-brand-border pb-1 mb-1 text-brand-text">Chair 1</div>
               <div className="absolute top-8 left-1 right-1 h-16 bg-brand-primary-soft border border-brand-primary/30 rounded p-1.5 flex flex-col justify-between shadow-sm">
                 <div>
                    <div className="text-[8px] font-bold text-brand-primary">M. Santos</div>
                    <div className="text-[7px] text-brand-primary/80">Extraction</div>
                 </div>
                 <div className="text-[6px] bg-brand-primary text-white self-start px-1 rounded-sm">PAID</div>
               </div>
            </div>
            <div className="bg-brand-surface rounded-md border border-brand-border p-1 relative shadow-sm">
               <div className="text-[10px] font-bold text-center border-b border-brand-border pb-1 mb-1 text-brand-text">Chair 2</div>
               <div className="absolute top-14 left-1 right-1 h-12 bg-emerald-50 border border-emerald-200 rounded p-1.5 shadow-sm">
                 <div className="text-[8px] font-bold text-emerald-700">J. Dela Cruz</div>
                 <div className="text-[7px] text-emerald-600">Cleaning</div>
               </div>
            </div>
            <div className="bg-brand-surface rounded-md border border-brand-border p-1 relative shadow-sm">
               <div className="text-[10px] font-bold text-center border-b border-brand-border pb-1 mb-1 text-brand-text">X-Ray</div>
            </div>
         </div>
      </div>
    </div>
  );
}

function PatientRecordPreview() {
  return (
    <div className="w-full h-full bg-brand-surface rounded-xl border border-brand-border overflow-hidden shadow-card flex pointer-events-none select-none text-left">
      <div className="w-[30%] border-r border-brand-border bg-brand-surface-soft p-3 flex flex-col">
         <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-bold shadow-sm">MS</div>
            <div>
               <div className="text-xs font-bold text-brand-text leading-tight">Maria Santos</div>
               <div className="text-[9px] text-brand-muted">PID-10492</div>
            </div>
         </div>
         <div className="space-y-1">
            <div className="h-6 rounded bg-brand-primary-soft border border-brand-primary/20 text-[9px] font-bold text-brand-primary flex items-center px-2 shadow-sm">Overview</div>
            <div className="h-6 rounded bg-transparent text-[9px] font-medium text-brand-muted flex items-center px-2">Medical History</div>
            <div className="h-6 rounded bg-transparent text-[9px] font-medium text-brand-muted flex items-center px-2">Dental Chart</div>
         </div>
      </div>
      <div className="flex-1 p-4 bg-brand-bg space-y-3">
         <div className="bg-brand-surface border border-brand-border p-3 rounded-lg shadow-sm">
            <div className="text-[10px] font-bold text-brand-text mb-2 border-b border-brand-border pb-1">Clinical Snapshot</div>
            <div className="grid grid-cols-2 gap-2 text-[9px]">
               <div><span className="text-brand-muted">Last Visit:</span> <span className="font-bold text-brand-text">Oct 12, 2023</span></div>
               <div><span className="text-brand-muted">Alerts:</span> <span className="text-brand-danger font-bold bg-brand-danger-soft px-1 rounded">Penicillin Allergy</span></div>
            </div>
         </div>
         <div className="bg-brand-surface border border-brand-border p-3 rounded-lg flex-1 shadow-sm">
            <div className="text-[10px] font-bold text-brand-text mb-2 border-b border-brand-border pb-1">Treatment Plan</div>
            <div className="h-2 w-3/4 bg-brand-surface-muted rounded mt-2" />
            <div className="h-2 w-1/2 bg-brand-surface-muted rounded mt-1.5" />
            <div className="h-2 w-2/3 bg-brand-surface-muted rounded mt-1.5" />
         </div>
      </div>
    </div>
  );
}

function PaymentPreview() {
  return (
    <div className="w-full h-full bg-brand-bg rounded-xl border border-brand-border overflow-hidden shadow-card flex flex-col pointer-events-none select-none text-left">
      <div className="h-10 border-b border-brand-border flex items-center px-4 bg-brand-surface gap-4 justify-between">
        <div className="font-bold text-brand-text text-sm">Invoice #INV-2938</div>
        <div className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold border border-amber-200">PARTIAL</div>
      </div>
      <div className="flex-1 flex">
         <div className="w-[60%] p-4 space-y-3 border-r border-brand-border bg-brand-bg">
            <div className="bg-brand-surface p-3 border border-brand-border rounded-lg shadow-sm">
               <div className="flex justify-between text-[9px] border-b border-brand-border pb-1 mb-2 font-bold text-brand-muted uppercase tracking-wider">
                 <span>Treatment</span><span>Amount</span>
               </div>
               <div className="flex justify-between text-[11px] font-bold text-brand-text mb-1">
                 <span>Root Canal (Tooth 24)</span><span>₱8,500</span>
               </div>
               <div className="flex justify-between text-[11px] font-bold text-brand-text">
                 <span>X-Ray</span><span>₱1,200</span>
               </div>
            </div>
         </div>
         <div className="w-[40%] bg-brand-surface p-4 flex flex-col shadow-sm">
            <div className="text-[9px] text-brand-muted font-bold uppercase tracking-wider">Balance</div>
            <div className="text-2xl font-black text-brand-text mb-4 tracking-tight">₱4,500</div>
            <div className="space-y-2 mt-auto">
               <div className="h-8 bg-brand-primary rounded text-white text-[10px] font-bold flex items-center justify-center shadow-sm">Record Payment</div>
               <div className="h-8 bg-brand-surface border border-brand-border rounded text-brand-text text-[10px] font-bold flex items-center justify-center shadow-sm">Submit Claim</div>
            </div>
         </div>
      </div>
    </div>
  );
}

function ReportsPreview() {
  return (
    <div className="w-full h-full bg-brand-bg rounded-xl border border-brand-border overflow-hidden shadow-card flex pointer-events-none select-none text-left">
      <div className="w-[30%] border-r border-brand-border bg-brand-surface-soft p-3">
         <div className="text-xs font-bold text-brand-text mb-3">Report Library</div>
         <div className="space-y-1">
            <div className="text-[8px] font-bold text-brand-muted uppercase mt-2 mb-1 tracking-wider">Finance</div>
            <div className="h-6 rounded bg-brand-surface border border-brand-border shadow-sm text-[9px] font-bold text-brand-text flex items-center px-2">Aged Receivables</div>
            <div className="h-6 rounded bg-transparent text-[9px] font-medium text-brand-muted flex items-center px-2">HMO Revenue</div>
         </div>
      </div>
      <div className="flex-1 p-4 bg-brand-surface flex flex-col">
         <div className="flex justify-between items-center border-b border-brand-border pb-2 mb-4">
            <div className="text-sm font-bold text-brand-text">Aged Receivables</div>
            <div className="h-6 w-16 bg-brand-surface-soft rounded border border-brand-border flex items-center px-2">
               <div className="h-1.5 w-10 bg-brand-muted rounded-full" />
            </div>
         </div>
         <div className="flex-1 border border-brand-border rounded-lg bg-brand-bg flex items-end p-4 gap-3 shadow-sm">
            <div className="flex-1 bg-brand-primary/20 h-1/2 rounded-t-sm border border-brand-primary/30 border-b-0" />
            <div className="flex-1 bg-brand-primary/40 h-3/4 rounded-t-sm border border-brand-primary/50 border-b-0" />
            <div className="flex-1 bg-brand-primary h-full rounded-t-sm border border-brand-primary-hover border-b-0 shadow-sm" />
            <div className="flex-1 bg-brand-primary/60 h-2/3 rounded-t-sm border border-brand-primary/70 border-b-0" />
         </div>
      </div>
    </div>
  );
}


// --- MAIN PAGE ---

export function HomePage() {
  const handleRequestDemo = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.info("Request Demo is disabled in Demo Mode. Please check our Patient Booking or Staff Login features.");
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans selection:bg-brand-primary-soft selection:text-brand-primary overflow-x-hidden">
      
      {/* 1. NAVBAR */}
      <nav className="sticky top-0 z-50 bg-brand-surface border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                <DentQLLogo variant="marketing" size="md" />
              </Link>
              <div className="hidden md:flex space-x-6 text-sm font-medium text-brand-muted">
                <a href="#product" className="hover:text-brand-text transition">Product</a>
                <a href="#workflows" className="hover:text-brand-text transition">Workflows</a>
                <Link to="/booking" className="hover:text-brand-text transition">Patient Booking</Link>
                <a href="#pricing" className="hover:text-brand-text transition">Pricing</a>
                <a href="#faq" className="hover:text-brand-text transition">FAQ</a>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login" className="text-sm font-bold text-brand-text hover:text-brand-primary">Sign in</Link>
              <button onClick={handleRequestDemo} className="btn-primary">Request Demo</button>
            </div>
          </div>
        </div>
      </nav>
 
      <main>
        {/* 2. HERO SECTION */}
        <section className="relative pt-20 pb-32 overflow-hidden border-b border-brand-border bg-brand-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-brand-text max-w-4xl mx-auto leading-[1.1]">
              Run the clinic day from <br className="hidden md:block"/> one operating desk.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-brand-muted max-w-2xl mx-auto font-medium">
              Manage chair schedules, waiting room flow, patient records, payments, claims, inventory, sterilization, and online booking without jumping between tools.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={handleRequestDemo} className="btn-primary h-[48px] px-8 text-base">Request a demo</button>
              <Link to="/booking" className="btn-secondary h-[48px] px-8 text-base">See patient booking</Link>
            </div>
            
            <div className="mt-10 flex flex-wrap justify-center gap-3 text-xs font-bold text-brand-muted">
              {['Chair Schedule', 'Patient Records', 'Payment Ledger', 'Claims', 'Inventory Risk', 'Online Booking'].map(chip => (
                <span key={chip} className="px-3 py-1.5 rounded-full bg-brand-bg border border-brand-border shadow-sm flex items-center gap-1.5 text-brand-text">
                  <Check size={14} className="text-brand-primary"/> {chip}
                </span>
              ))}
            </div>
          </div>

          {/* Hero Visual Preview */}
          <div className="mt-16 max-w-5xl mx-auto px-4 relative z-10">
            <div className="aspect-[16/9] w-full rounded-2xl bg-brand-bg p-2 border border-brand-border shadow-popover overflow-hidden ring-4 ring-brand-surface-soft">
               <TodayBoardPreview />
            </div>
          </div>
        </section>

        {/* 3. PROBLEM SECTION */}
        <section className="py-24 bg-brand-bg border-b border-brand-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-brand-text mb-12 tracking-tight">Dental clinics do not need another generic dashboard.</h2>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border shadow-sm">
                <Users className="w-8 h-8 text-brand-primary mb-4" />
                <h3 className="font-bold text-brand-text mb-2 text-lg">Front Desk Chaos</h3>
                <p className="text-sm text-brand-muted leading-relaxed">Front desk loses time switching between appointments, payments, and patient records.</p>
              </div>
              <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border shadow-sm">
                <FileText className="w-8 h-8 text-brand-primary mb-4" />
                <h3 className="font-bold text-brand-text mb-2 text-lg">Fragmented Context</h3>
                <p className="text-sm text-brand-muted leading-relaxed">Dentists need faster access to treatment context and clinical notes without clicking through 5 tabs.</p>
              </div>
              <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border shadow-sm">
                <ShieldCheck className="w-8 h-8 text-brand-primary mb-4" />
                <h3 className="font-bold text-brand-text mb-2 text-lg">Hidden Risks</h3>
                <p className="text-sm text-brand-muted leading-relaxed">Admin teams need claims, stock, sterilization, and revenue risks visible before they become problems.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. TODAY BOARD SECTION */}
        <section id="product" className="py-24 overflow-hidden border-b border-brand-border bg-brand-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2">
                <div className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-2">Today Board</div>
                <h2 className="text-3xl font-bold text-brand-text mb-4 tracking-tight">Start every morning with the Today Board.</h2>
                <p className="text-lg text-brand-muted mb-8 font-medium">
                  Get a complete operational picture the moment you log in. Chair load, waiting room flow, action center, stock risks, and claims queue—all in one place.
                </p>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <Check className="text-brand-primary mt-1 shrink-0" size={20} />
                    <span className="text-brand-text font-medium">See exactly what needs action today.</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="text-brand-primary mt-1 shrink-0" size={20} />
                    <span className="text-brand-text font-medium">Pull patients from the waiting room directly into chairs.</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="text-brand-primary mt-1 shrink-0" size={20} />
                    <span className="text-brand-text font-medium">Catch billing, claims, stock, and sterilization risks early.</span>
                  </li>
                </ul>
              </div>
              <div className="lg:w-1/2 w-full">
                 <div className="aspect-[4/3] w-full rounded-2xl bg-brand-bg p-2 border border-brand-border shadow-xl ring-2 ring-brand-surface-soft">
                    <TodayBoardPreview />
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. CHAIR SCHEDULE SECTION */}
        <section className="py-24 bg-brand-bg border-b border-brand-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col-reverse lg:flex-row items-center gap-12">
              <div className="lg:w-1/2 w-full">
                 <div className="aspect-[4/3] w-full rounded-2xl bg-brand-surface p-2 border border-brand-border shadow-xl ring-2 ring-brand-surface-soft">
                    <ChairSchedulePreview />
                 </div>
              </div>
              <div className="lg:w-1/2">
                <div className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-2">Chair Schedule</div>
                <h2 className="text-3xl font-bold text-brand-text mb-4 tracking-tight">Schedule by chair, room, and dentist — not just calendar boxes.</h2>
                <p className="text-lg text-brand-muted mb-8 font-medium">
                  A real dental clinic runs on chairs. Our schedule view is built for clinic flow, showing dentist filters, urgent cases, and payment/claim flags right on the appointment block.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. PATIENT RECORD SECTION */}
        <section className="py-24 border-b border-brand-border bg-brand-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2">
                <div className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-2">Patient Record Workbench</div>
                <h2 className="text-3xl font-bold text-brand-text mb-4 tracking-tight">Every patient record feels like a clinical file.</h2>
                <p className="text-lg text-brand-muted mb-8 font-medium">
                  Stop using generic CRMs. DentQL gives you a clinical patient file with integrated medical history, SOAP notes, dental charts, treatment plans, and invoices in one dense, readable workbench.
                </p>
              </div>
              <div className="lg:w-1/2 w-full">
                 <div className="aspect-[4/3] w-full rounded-2xl bg-brand-bg p-2 border border-brand-border shadow-xl ring-2 ring-brand-surface-soft">
                    <PatientRecordPreview />
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. PAYMENT COLLECTION SECTION */}
        <section className="py-24 bg-brand-bg border-b border-brand-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col-reverse lg:flex-row items-center gap-12">
              <div className="lg:w-1/2 w-full">
                 <div className="aspect-[4/3] w-full rounded-2xl bg-brand-surface p-2 border border-brand-border shadow-xl ring-2 ring-brand-surface-soft">
                    <PaymentPreview />
                 </div>
              </div>
              <div className="lg:w-1/2">
                <div className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-2">Payment Collection Workbench</div>
                <h2 className="text-3xl font-bold text-brand-text mb-4 tracking-tight">Collect balances before patients leave.</h2>
                <p className="text-lg text-brand-muted mb-8 font-medium">
                  A dedicated workbench for money. Instantly see treatment ledgers, paid vs remaining balances, and HMO/claim statuses so nothing slips through the cracks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 8. REPORTS WORKBENCH SECTION */}
        <section className="py-24 border-b border-brand-border bg-brand-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2">
                <div className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-2">Reports Workbench</div>
                <h2 className="text-3xl font-bold text-brand-text mb-4 tracking-tight">Reports built for clinic decisions.</h2>
                <p className="text-lg text-brand-muted mb-8 font-medium">
                  Finance reports, claims tracking, inventory utilization, and compliance audits ready to export. Built for practical, everyday operational oversight.
                </p>
              </div>
              <div className="lg:w-1/2 w-full">
                 <div className="aspect-[4/3] w-full rounded-2xl bg-brand-bg p-2 border border-brand-border shadow-xl ring-2 ring-brand-surface-soft">
                    <ReportsPreview />
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9. WAITING ROOM & KIOSK SECTION */}
        <section className="py-24 bg-brand-bg border-b border-brand-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
             <MonitorPlay className="w-12 h-12 text-brand-primary mx-auto mb-6" />
             <h2 className="text-3xl font-bold text-brand-text mb-4 tracking-tight">Connect the front desk to the waiting room.</h2>
             <p className="text-lg text-brand-muted max-w-2xl mx-auto mb-12 font-medium">
               Deploy our Patient Terminal Kiosk for self check-ins and the TV Waiting Room Board to display "now serving" announcements.
             </p>
             <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="bg-brand-surface p-6 rounded-2xl shadow-sm border border-brand-border text-left">
                   <h3 className="font-bold text-brand-text mb-2 text-lg">Patient Terminal</h3>
                   <p className="text-sm text-brand-muted leading-relaxed">Allow patients to check in, book visits, and manage appointments on a touch-friendly tablet display.</p>
                </div>
                <div className="bg-brand-surface p-6 rounded-2xl shadow-sm border border-brand-border text-left">
                   <h3 className="font-bold text-brand-text mb-2 text-lg">Waiting Room Board</h3>
                   <p className="text-sm text-brand-muted leading-relaxed">Large TV display showing the current queue, announcements, and clinic branding readable from a distance.</p>
                </div>
             </div>
          </div>
        </section>

        {/* 11. WORKFLOW CARDS SECTION */}
        <section id="workflows" className="py-24 border-b border-brand-border bg-brand-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-brand-text text-center mb-12 tracking-tight">Built for every role in the clinic.</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Front Desk",
                  icon: <Users size={20}/>,
                  items: ["Check patients in", "Manage waiting room", "Collect balances", "Book follow-ups"]
                },
                {
                  title: "Dentist",
                  icon: <Activity size={20}/>,
                  items: ["View patient record", "Open dental chart", "Add SOAP notes", "Review treatment plan"]
                },
                {
                  title: "Billing/Admin",
                  icon: <FileText size={20}/>,
                  items: ["Track invoices", "Submit claims", "Monitor receivables", "Export reports"]
                },
                {
                  title: "Operations",
                  icon: <Package size={20}/>,
                  items: ["Monitor stock risk", "Log sterilization", "Send SMS reminders", "Manage queue display"]
                }
              ].map(w => (
                <div key={w.title} className="p-6 bg-brand-bg border border-brand-border rounded-2xl shadow-sm">
                   <div className="w-10 h-10 rounded-xl bg-brand-primary-soft border border-brand-primary/20 text-brand-primary flex items-center justify-center mb-4 shadow-sm">
                      {w.icon}
                   </div>
                   <h3 className="font-bold text-brand-text mb-4 text-lg">{w.title}</h3>
                   <ul className="space-y-3">
                     {w.items.map(item => (
                       <li key={item} className="flex gap-2 text-sm text-brand-muted">
                          <Check size={16} className="text-brand-primary shrink-0"/> <span className="font-medium">{item}</span>
                       </li>
                     ))}
                   </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 12. DEMO / CTA SECTION */}
        <section id="demo" className="py-24 bg-brand-bg border-b border-brand-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-black text-brand-text mb-6 tracking-tight">Ready to run your clinic day from one workbench?</h2>
            <p className="text-lg text-brand-muted mb-10 font-medium">Pricing depends on clinic size, number of users, and modules. Request a demo to see how DentQL fits your operation.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <button onClick={handleRequestDemo} className="btn-primary h-[48px] px-8 text-base shadow-lg">Request Demo</button>
               <Link to="/booking" className="btn-secondary h-[48px] px-8 text-base">Open Patient Booking</Link>
            </div>
          </div>
        </section>

        {/* 13. FAQ SECTION */}
        <section id="faq" className="py-24 border-b border-brand-border bg-brand-surface">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-brand-text text-center mb-12 tracking-tight">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {q: "Can patients book appointments online?", a: "Yes, our Patient Appointment Builder provides a fast, mobile-friendly experience for patients to choose services, dentists, and available times."},
                {q: "Can we manage multiple dentists and chairs?", a: "Absolutely. The Chair Schedule is designed specifically to handle multiple chairs, rooms, and providers concurrently."},
                {q: "Does DentQL support invoices and payments?", a: "Yes. The Payment Collection Workbench tracks detailed treatment ledgers, partial payments, and multiple payment methods (Cash, GCash, Maya, Card)."},
                {q: "Can we track HMO or claim workflows?", a: "Yes, the Claims Runbook allows you to track HMO and PhilHealth claims from submission to payment, reducing outstanding receivables."},
                {q: "Is there a waiting room display or kiosk?", a: "Yes, we offer both a Patient Terminal Kiosk for self-service and a TV Waiting Room Board to display queue statuses."},
                {q: "Can staff roles be controlled?", a: "Yes, DentQL includes detailed role-based access control for dentists, receptionists, billing, and admins."},
              ].map((faq, i) => (
                <div key={i} className="p-6 bg-brand-bg border border-brand-border rounded-xl shadow-sm">
                   <h3 className="font-bold text-brand-text mb-2 text-base">
                     {faq.q}
                   </h3>
                   <p className="text-sm text-brand-muted leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* 14. FOOTER */}
      <footer className="bg-brand-surface py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
           <div className="col-span-2 md:col-span-1">
             <DentQLLogo variant="marketing" size="sm" />
             <p className="mt-4 text-sm text-brand-muted max-w-xs font-medium leading-relaxed">The clinical workbench for modern dental operations.</p>
           </div>
           <div>
             <h4 className="font-bold text-brand-text mb-4 text-xs uppercase tracking-widest">Product</h4>
             <ul className="space-y-3 text-sm text-brand-muted font-medium">
               <li><a href="#workflows" className="hover:text-brand-text transition">Workflows</a></li>
               <li><a href="#product" className="hover:text-brand-text transition">Today Board</a></li>
               <li><a href="#product" className="hover:text-brand-text transition">Reports Workbench</a></li>
             </ul>
           </div>
           <div>
             <h4 className="font-bold text-brand-text mb-4 text-xs uppercase tracking-widest">Features</h4>
             <ul className="space-y-3 text-sm text-brand-muted font-medium">
               <li><Link to="/booking" className="hover:text-brand-text transition">Patient Booking</Link></li>
               <li><Link to="/kiosk" className="hover:text-brand-text transition">Kiosk</Link></li>
               <li><Link to="/login" className="hover:text-brand-text transition">Staff Login</Link></li>
             </ul>
           </div>
           <div>
             <h4 className="font-bold text-brand-text mb-4 text-xs uppercase tracking-widest">Legal</h4>
             <ul className="space-y-3 text-sm text-brand-muted font-medium">
               <li><Link to="/privacy" className="hover:text-brand-text transition">Privacy Policy</Link></li>
               <li><Link to="/terms" className="hover:text-brand-text transition">Terms of Service</Link></li>
               <li><Link to="/contact" className="hover:text-brand-text transition">Contact</Link></li>
             </ul>
           </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-brand-border text-sm text-brand-muted text-center font-medium">
           © {new Date().getFullYear()} DentQL. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
