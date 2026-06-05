import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Users, FileText, Package, Activity, MonitorPlay, ShieldCheck } from 'lucide-react';
import { DentQLLogo } from '../components/ui/DentQLLogo';
import { toast } from 'sonner';

// --- MAIN PAGE ---

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 24);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleRequestDemo = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.info("Request Demo is disabled in Demo Mode. Please check our Patient Booking or Staff Login features.");
  };

  const navLinks = [
    { label: 'Product', href: '#product' },
    { label: 'Workflows', href: '#workflows' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-paper)] font-[family-name:var(--font-body)] text-[var(--color-ink-2)] selection:bg-[var(--color-accent)] selection:text-white">
      {/* 1. NAVBAR (N1b SaaS three-section Nav) */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-240 ${
          scrolled
            ? 'bg-[color-mix(in_oklch,var(--color-paper)_80%,transparent)] backdrop-blur-md border-b border-[var(--color-rule)] shadow-sm'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 h-16 grid grid-cols-[1fr_auto_1fr] items-center">
          {/* Brand */}
          <div className="justify-self-start font-[family-name:var(--font-display)] font-bold text-xl tracking-tight text-[var(--color-ink)] flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <DentQLLogo size="sm" />
            DentQL
          </div>

          {/* Center Links (Desktop only) */}
          <nav className="justify-self-center hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-semibold text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Link to="/booking" className="text-sm font-semibold text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors">
              Patient Booking
            </Link>
          </nav>

          {/* Right CTAs */}
          <div className="justify-self-end flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-bold text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-colors hidden sm:block"
            >
              Sign in
            </button>
            <button
              onClick={handleRequestDemo}
              className="h-10 px-5 rounded-full bg-[var(--color-accent)] text-white text-sm font-bold hover:opacity-90 transition-opacity active:scale-95 shadow-sm"
            >
              Request Demo
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* 2. HERO SECTION (H1 Marquee) */}
        <section className="relative min-h-[85vh] flex flex-col justify-center pt-24 pb-16 px-6 max-w-[1400px] mx-auto overflow-hidden">
          {/* Vibrant Gradient Backgrounds */}
          <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-[var(--color-secondary)] opacity-30 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[10%] left-[-10%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-[var(--color-accent)] opacity-20 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="text-center max-w-4xl mx-auto reveal is-in z-10 pt-10">
            <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.5rem,6vw,5rem)] font-black leading-[1.05] tracking-tight text-[var(--color-ink)]">
              Run the clinic day from <br className="hidden md:block"/> one operating desk.
            </h1>
            <p className="mt-8 text-lg md:text-xl text-[var(--color-ink-2)] max-w-2xl mx-auto leading-relaxed font-medium">
              Manage chair schedules, waiting room flow, patient records, payments, claims, inventory, sterilization, and online booking without jumping between tools.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleRequestDemo}
                className="h-12 px-8 rounded-full bg-[var(--color-accent)] text-white text-base font-bold hover:opacity-90 transition-opacity active:scale-95 shadow-md shadow-[var(--color-accent)]/20"
              >
                Request a demo
              </button>
              <Link to="/booking" className="h-12 px-8 flex items-center justify-center rounded-full bg-white text-[var(--color-ink)] border border-[var(--color-rule)] text-base font-bold hover:bg-[var(--color-paper-subtle)] transition-colors active:scale-95 shadow-sm">
                See patient booking
              </Link>
            </div>
            
            <div className="mt-12 flex flex-wrap justify-center gap-3 text-xs font-bold text-[var(--color-ink-2)]">
              {['Chair Schedule', 'Patient Records', 'Payment Ledger', 'Claims', 'Inventory Risk', 'Online Booking'].map(chip => (
                <span key={chip} className="px-3 py-1.5 rounded-full bg-[var(--color-paper)] border border-[var(--color-rule)] shadow-sm flex items-center gap-1.5 text-[var(--color-ink)]">
                  <Check size={14} className="text-[var(--color-accent)]"/> {chip}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Hero Visual Preview */}
        <section className="relative px-6 max-w-[1200px] mx-auto -mt-10 mb-24 z-10 animate-float">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-secondary)] opacity-20 blur-[100px] rounded-full -z-10" />
          <div className="relative aspect-[16/9] w-full rounded-[24px] bg-[var(--color-paper)]/80 backdrop-blur-xl p-2 border border-white/40 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden ring-8 ring-white/30">
             <img src="/hero_mockup.png" className="w-full h-full object-cover rounded-[16px] shadow-inner" alt="Today Board Screenshot" />
          </div>
        </section>

        {/* 3. PROBLEM SECTION */}
        <section className="py-24 bg-[var(--color-paper-subtle)] border-y border-[var(--color-rule)] px-6">
          <div className="max-w-[1200px] mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] text-[var(--color-ink)] mb-12 tracking-tight">Dental clinics do not need another generic dashboard.</h2>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="p-8 rounded-[24px] bg-[var(--color-paper)] border border-[var(--color-rule)] shadow-sm">
                <Users className="w-8 h-8 text-[var(--color-accent)] mb-6" />
                <h3 className="font-bold text-[var(--color-ink)] mb-3 text-xl font-[family-name:var(--font-display)]">Front Desk Chaos</h3>
                <p className="text-[var(--color-ink-2)] leading-relaxed font-medium">Front desk loses time switching between appointments, payments, and patient records.</p>
              </div>
              <div className="p-8 rounded-[24px] bg-[var(--color-paper)] border border-[var(--color-rule)] shadow-sm">
                <FileText className="w-8 h-8 text-[var(--color-accent)] mb-6" />
                <h3 className="font-bold text-[var(--color-ink)] mb-3 text-xl font-[family-name:var(--font-display)]">Fragmented Context</h3>
                <p className="text-[var(--color-ink-2)] leading-relaxed font-medium">Dentists need faster access to treatment context and clinical notes without clicking through 5 tabs.</p>
              </div>
              <div className="p-8 rounded-[24px] bg-[var(--color-paper)] border border-[var(--color-rule)] shadow-sm">
                <ShieldCheck className="w-8 h-8 text-[var(--color-accent)] mb-6" />
                <h3 className="font-bold text-[var(--color-ink)] mb-3 text-xl font-[family-name:var(--font-display)]">Hidden Risks</h3>
                <p className="text-[var(--color-ink-2)] leading-relaxed font-medium">Admin teams need claims, stock, sterilization, and revenue risks visible before they become problems.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. TODAY BOARD SECTION */}
        <section id="product" className="py-24 px-6 bg-[var(--color-paper)]">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2">
                <div className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-widest mb-3 font-mono">Today Board</div>
                <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] text-[var(--color-ink)] mb-6 tracking-tight">Start every morning with the Today Board.</h2>
                <p className="text-lg text-[var(--color-ink-2)] mb-10 font-medium leading-relaxed">
                  Get a complete operational picture the moment you log in. Chair load, waiting room flow, action center, stock risks, and claims queue—all in one place.
                </p>
                <ul className="space-y-5">
                  <li className="flex gap-4 items-start">
                    <div className="mt-1 bg-[var(--color-accent)]/10 text-[var(--color-accent)] p-1 rounded-full"><Check size={16} strokeWidth={3} /></div>
                    <span className="text-[var(--color-ink)] font-semibold text-lg">See exactly what needs action today.</span>
                  </li>
                  <li className="flex gap-4 items-start">
                    <div className="mt-1 bg-[var(--color-accent)]/10 text-[var(--color-accent)] p-1 rounded-full"><Check size={16} strokeWidth={3} /></div>
                    <span className="text-[var(--color-ink)] font-semibold text-lg">Pull patients from the waiting room directly into chairs.</span>
                  </li>
                  <li className="flex gap-4 items-start">
                    <div className="mt-1 bg-[var(--color-accent)]/10 text-[var(--color-accent)] p-1 rounded-full"><Check size={16} strokeWidth={3} /></div>
                    <span className="text-[var(--color-ink)] font-semibold text-lg">Catch billing, claims, stock, and sterilization risks early.</span>
                  </li>
                </ul>
              </div>
              <div className="lg:w-1/2 w-full relative">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-[var(--color-accent)] opacity-10 blur-[80px] rounded-full -z-10" />
                 <div className="relative aspect-[4/3] w-full rounded-[24px] bg-[var(--color-paper)]/80 backdrop-blur-xl p-2 border border-white/50 shadow-2xl ring-4 ring-white/50 animate-float-delayed">
                    <img src="/hero_mockup.png" className="w-full h-full object-cover rounded-[16px] shadow-inner" alt="Today Board Screenshot" />
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. CHAIR SCHEDULE SECTION */}
        <section className="py-24 px-6 bg-[var(--color-paper-subtle)] border-y border-[var(--color-rule)]">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
              <div className="lg:w-1/2 w-full relative">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-[var(--color-secondary)] opacity-20 blur-[80px] rounded-full -z-10" />
                 <div className="relative aspect-[4/3] w-full rounded-[24px] bg-[var(--color-paper)]/80 backdrop-blur-xl p-2 border border-white/50 shadow-2xl ring-4 ring-white/50 animate-float">
                    <img src="/hero_mockup.png" className="w-full h-full object-cover rounded-[16px] shadow-inner" alt="Chair Schedule Screenshot" />
                 </div>
              </div>
              <div className="lg:w-1/2">
                <div className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-widest mb-3 font-mono">Chair Schedule</div>
                <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] text-[var(--color-ink)] mb-6 tracking-tight">Schedule by chair, room, and dentist — not just calendar boxes.</h2>
                <p className="text-lg text-[var(--color-ink-2)] font-medium leading-relaxed">
                  A real dental clinic runs on chairs. Our schedule view is built for clinic flow, showing dentist filters, urgent cases, and payment/claim flags right on the appointment block.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. PATIENT RECORD SECTION */}
        <section className="py-24 px-6 bg-[var(--color-paper)]">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2">
                <div className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-widest mb-3 font-mono">Patient Record Workbench</div>
                <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] text-[var(--color-ink)] mb-6 tracking-tight">Every patient record feels like a clinical file.</h2>
                <p className="text-lg text-[var(--color-ink-2)] font-medium leading-relaxed">
                  Stop using generic CRMs. DentQL gives you a clinical patient file with integrated medical history, SOAP notes, dental charts, treatment plans, and invoices in one dense, readable workbench.
                </p>
              </div>
              <div className="lg:w-1/2 w-full relative">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-[var(--color-accent)] opacity-10 blur-[80px] rounded-full -z-10" />
                 <div className="relative aspect-[4/3] w-full rounded-[24px] bg-[var(--color-paper)]/80 backdrop-blur-xl p-2 border border-white/50 shadow-2xl ring-4 ring-white/50 animate-float-delayed">
                    <img src="/hero_mockup.png" className="w-full h-full object-cover rounded-[16px] shadow-inner" alt="Patient Record Screenshot" />
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. PAYMENT COLLECTION SECTION */}
        <section className="py-24 px-6 bg-[var(--color-paper-subtle)] border-y border-[var(--color-rule)]">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
              <div className="lg:w-1/2 w-full relative">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-[var(--color-secondary)] opacity-20 blur-[80px] rounded-full -z-10" />
                 <div className="relative aspect-[4/3] w-full rounded-[24px] bg-[var(--color-paper)]/80 backdrop-blur-xl p-2 border border-white/50 shadow-2xl ring-4 ring-white/50 animate-float">
                    <img src="/hero_mockup.png" className="w-full h-full object-cover rounded-[16px] shadow-inner" alt="Payment Ledger Screenshot" />
                 </div>
              </div>
              <div className="lg:w-1/2">
                <div className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-widest mb-3 font-mono">Payment Collection Workbench</div>
                <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] text-[var(--color-ink)] mb-6 tracking-tight">Collect balances before patients leave.</h2>
                <p className="text-lg text-[var(--color-ink-2)] font-medium leading-relaxed">
                  A dedicated workbench for money. Instantly see treatment ledgers, paid vs remaining balances, and HMO/claim statuses so nothing slips through the cracks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 8. REPORTS WORKBENCH SECTION */}
        <section className="py-24 px-6 bg-[var(--color-paper)]">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2">
                <div className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-widest mb-3 font-mono">Reports Workbench</div>
                <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] text-[var(--color-ink)] mb-6 tracking-tight">Reports built for clinic decisions.</h2>
                <p className="text-lg text-[var(--color-ink-2)] font-medium leading-relaxed">
                  Finance reports, claims tracking, inventory utilization, and compliance audits ready to export. Built for practical, everyday operational oversight.
                </p>
              </div>
              <div className="lg:w-1/2 w-full relative">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-[var(--color-accent)] opacity-10 blur-[80px] rounded-full -z-10" />
                 <div className="relative aspect-[4/3] w-full rounded-[24px] bg-[var(--color-paper)]/80 backdrop-blur-xl p-2 border border-white/50 shadow-2xl ring-4 ring-white/50 animate-float-delayed">
                    <img src="/hero_mockup.png" className="w-full h-full object-cover rounded-[16px] shadow-inner" alt="Reports Screenshot" />
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9. WAITING ROOM & KIOSK SECTION */}
        <section className="py-32 px-6 bg-[var(--color-paper-subtle)] border-y border-[var(--color-rule)]">
          <div className="max-w-[1200px] mx-auto text-center">
             <div className="w-20 h-20 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                <MonitorPlay className="w-10 h-10" />
             </div>
             <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] text-[var(--color-ink)] mb-6 tracking-tight">Connect the front desk to the waiting room.</h2>
             <p className="text-xl text-[var(--color-ink-2)] max-w-2xl mx-auto mb-16 font-medium leading-relaxed">
               Deploy our Patient Terminal Kiosk for self check-ins and the TV Waiting Room Board to display "now serving" announcements.
             </p>
             <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="bg-[var(--color-paper)] p-8 rounded-[24px] shadow-md border border-[var(--color-rule)] text-left hover:shadow-lg transition-shadow">
                   <h3 className="font-bold font-[family-name:var(--font-display)] text-[var(--color-ink)] mb-3 text-xl">Patient Terminal</h3>
                   <p className="text-base text-[var(--color-ink-2)] leading-relaxed font-medium">Allow patients to check in, book visits, and manage appointments on a touch-friendly tablet display.</p>
                </div>
                <div className="bg-[var(--color-paper)] p-8 rounded-[24px] shadow-md border border-[var(--color-rule)] text-left hover:shadow-lg transition-shadow">
                   <h3 className="font-bold font-[family-name:var(--font-display)] text-[var(--color-ink)] mb-3 text-xl">Waiting Room Board</h3>
                   <p className="text-base text-[var(--color-ink-2)] leading-relaxed font-medium">Large TV display showing the current queue, announcements, and clinic branding readable from a distance.</p>
                </div>
             </div>
          </div>
        </section>

        {/* 11. WORKFLOW CARDS SECTION */}
        <section id="workflows" className="py-24 px-6 bg-[var(--color-paper)]">
          <div className="max-w-[1400px] mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] text-[var(--color-ink)] text-center mb-16 tracking-tight">Built for every role in the clinic.</h2>
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
                <div key={w.title} className="p-8 bg-[var(--color-paper-subtle)] border border-[var(--color-rule)] rounded-[24px] shadow-sm">
                   <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-[var(--color-accent)] flex items-center justify-center mb-6 shadow-sm">
                      {w.icon}
                   </div>
                   <h3 className="font-bold font-[family-name:var(--font-display)] text-[var(--color-ink)] mb-5 text-xl">{w.title}</h3>
                   <ul className="space-y-4">
                     {w.items.map(item => (
                       <li key={item} className="flex gap-3 text-base text-[var(--color-ink-2)]">
                          <Check size={18} className="text-[var(--color-accent)] shrink-0 mt-0.5"/> <span className="font-medium">{item}</span>
                       </li>
                     ))}
                   </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 12. DEMO / CTA SECTION */}
        <section id="demo" className="py-32 px-6 bg-[var(--color-secondary)]/10 border-y border-[var(--color-secondary)]/20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-black font-[family-name:var(--font-display)] text-[var(--color-ink)] mb-8 tracking-tight">Ready to run your clinic day from one workbench?</h2>
            <p className="text-xl text-[var(--color-ink-2)] mb-12 font-medium leading-relaxed">Pricing depends on clinic size, number of users, and modules. Request a demo to see how DentQL fits your operation.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <button onClick={handleRequestDemo} className="h-14 px-10 rounded-full bg-[var(--color-accent)] text-white text-lg font-bold shadow-lg hover:opacity-90 transition-opacity active:scale-95">Request Demo</button>
               <Link to="/booking" className="h-14 px-10 flex items-center justify-center rounded-full bg-white text-[var(--color-ink)] border border-[var(--color-rule)] text-lg font-bold hover:bg-[var(--color-paper-subtle)] transition-colors shadow-sm active:scale-95">Open Patient Booking</Link>
            </div>
          </div>
        </section>

        {/* 13. FAQ SECTION */}
        <section id="faq" className="py-24 px-6 bg-[var(--color-paper)]">
          <div className="max-w-[800px] mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] text-[var(--color-ink)] text-center mb-16 tracking-tight">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {q: "Can patients book appointments online?", a: "Yes, our Patient Appointment Builder provides a fast, mobile-friendly experience for patients to choose services, dentists, and available times."},
                {q: "Can we manage multiple dentists and chairs?", a: "Absolutely. The Chair Schedule is designed specifically to handle multiple chairs, rooms, and providers concurrently."},
                {q: "Does DentQL support invoices and payments?", a: "Yes. The Payment Collection Workbench tracks detailed treatment ledgers, partial payments, and multiple payment methods (Cash, GCash, Maya, Card)."},
                {q: "Can we track HMO or claim workflows?", a: "Yes, the Claims Runbook allows you to track HMO and PhilHealth claims from submission to payment, reducing outstanding receivables."},
                {q: "Is there a waiting room display or kiosk?", a: "Yes, we offer both a Patient Terminal Kiosk for self-service and a TV Waiting Room Board to display queue statuses."},
                {q: "Can staff roles be controlled?", a: "Yes, DentQL includes detailed role-based access control for dentists, receptionists, billing, and admins."},
              ].map((faq, i) => (
                <div key={i} className="p-8 bg-[var(--color-paper-subtle)] border border-[var(--color-rule)] rounded-[24px] shadow-sm">
                   <h3 className="font-bold font-[family-name:var(--font-display)] text-[var(--color-ink)] mb-3 text-lg">
                     {faq.q}
                   </h3>
                   <p className="text-base text-[var(--color-ink-2)] leading-relaxed font-medium">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* 14. FOOTER (Ft3 Index Footer with Dark Graphite background) */}
      <footer className="bg-[var(--color-graphite)] text-[var(--color-graphite-ink)] pt-20 pb-10 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">
            <div className="col-span-2 lg:col-span-1">
              <div className="font-[family-name:var(--font-display)] font-bold text-xl tracking-tight text-white flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-md bg-white text-[var(--color-graphite)] flex items-center justify-center">
                   <DentQLLogo size="sm" />
                </div>
                DentQL
              </div>
              <p className="text-sm text-[var(--color-graphite-rule)] max-w-xs font-medium leading-relaxed">
                The clinical workbench for modern dental operations.
              </p>
            </div>
            
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-graphite-rule)] mb-6 font-bold">
                Product
              </p>
              <ul className="space-y-4 font-medium">
                <li><a href="#workflows" className="text-sm text-[color-mix(in_oklch,var(--color-graphite-ink)_80%,transparent)] hover:text-white transition-colors">Workflows</a></li>
                <li><a href="#product" className="text-sm text-[color-mix(in_oklch,var(--color-graphite-ink)_80%,transparent)] hover:text-white transition-colors">Today Board</a></li>
                <li><a href="#product" className="text-sm text-[color-mix(in_oklch,var(--color-graphite-ink)_80%,transparent)] hover:text-white transition-colors">Reports Workbench</a></li>
              </ul>
            </div>

            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-graphite-rule)] mb-6 font-bold">
                Features
              </p>
              <ul className="space-y-4 font-medium">
                <li><Link to="/booking" className="text-sm text-[color-mix(in_oklch,var(--color-graphite-ink)_80%,transparent)] hover:text-white transition-colors">Patient Booking</Link></li>
                <li><Link to="/kiosk" className="text-sm text-[color-mix(in_oklch,var(--color-graphite-ink)_80%,transparent)] hover:text-white transition-colors">Kiosk</Link></li>
                <li><Link to="/login" className="text-sm text-[color-mix(in_oklch,var(--color-graphite-ink)_80%,transparent)] hover:text-white transition-colors">Staff Login</Link></li>
              </ul>
            </div>

            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-graphite-rule)] mb-6 font-bold">
                Legal
              </p>
              <ul className="space-y-4 font-medium">
                <li><Link to="/privacy" className="text-sm text-[color-mix(in_oklch,var(--color-graphite-ink)_80%,transparent)] hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-sm text-[color-mix(in_oklch,var(--color-graphite-ink)_80%,transparent)] hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/contact" className="text-sm text-[color-mix(in_oklch,var(--color-graphite-ink)_80%,transparent)] hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-[var(--color-graphite-rule)] pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[color-mix(in_oklch,var(--color-graphite-ink)_60%,transparent)] font-medium">
            <p>© {new Date().getFullYear()} DentQL Inc. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
