import { Cable, ShieldCheck, AlertCircle, HelpCircle } from "lucide-react";

type IntegrationStatus = "Connected" | "Demo Mode" | "Not Configured";

interface IntegrationItem {
  id: string;
  name: string;
  description: string;
  status: IntegrationStatus;
}

const integrations: IntegrationItem[] = [
  { id: "db", name: "Database (Supabase)", description: "Primary clinic data storage", status: "Demo Mode" },
  { id: "auth", name: "Authentication", description: "Identity provider", status: "Demo Mode" },
  { id: "sms", name: "SMS Dispatch", description: "Patient reminders and waitlist alerts", status: "Demo Mode" },
  { id: "payment", name: "Payment Gateway", description: "Credit card and digital wallets", status: "Demo Mode" },
  { id: "hmo", name: "Claims Gateway", description: "PhilHealth and HMO electronic submission", status: "Demo Mode" },
  { id: "printer", name: "Label/Thermal Printer", description: "Zebra or ESC-POS local hardware", status: "Demo Mode" },
  { id: "xray", name: "X-Ray Sensor", description: "TWAIN/USB direct image capture", status: "Demo Mode" },
  { id: "email", name: "Email Provider", description: "Patient statements and reports", status: "Demo Mode" },
];

export function IntegrationsPanel() {
  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-brand-primary text-white shadow-sm">
            <Cable size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-brand-text">Integrations & Hardware</h2>
            <p className="text-xs text-brand-muted mt-1">Manage external services and local hardware connections.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {integrations.map((item) => (
            <div key={item.id} className="p-4 border border-brand-border rounded-lg bg-brand-surface hover:border-brand-primary/30 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-bold text-brand-text">{item.name}</h3>
                {item.status === "Demo Mode" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-brand-warning/10 text-brand-warning border border-brand-warning/20">
                    <AlertCircle size={10} /> Demo
                  </span>
                )}
                {item.status === "Connected" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-brand-success/10 text-brand-success border border-brand-success/20">
                    <ShieldCheck size={10} /> Connected
                  </span>
                )}
                {item.status === "Not Configured" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-brand-surface-muted text-brand-muted border border-brand-border">
                    <HelpCircle size={10} /> None
                  </span>
                )}
              </div>
              <p className="text-xs text-brand-muted">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-brand-primary-soft border border-brand-primary/20 rounded-lg">
          <h4 className="text-xs font-bold uppercase tracking-widest text-brand-primary mb-2">Production Readiness Notice</h4>
          <p className="text-sm text-brand-text">
            DentQL is currently running in a verified sandbox. Live external services (SMS, Payments, hardware) are simulated. 
            To activate real integrations, update environment variables and swap mock adapters.
          </p>
        </div>
      </div>
    </div>
  );
}
