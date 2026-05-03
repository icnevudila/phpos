import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export function VibrantFeatures(): JSX.Element {
  const { t } = useTranslation();

  const features = [
    { title: "Dashboard", icon: "📊" },
    { title: "Appointments", icon: "📅" },
    { title: "Dental Chart", icon: "🦷" },
    { title: "Patient Records", icon: "👥" },
    { title: "Insurance", icon: "🏥" },
    { title: "Invoicing", icon: "💰" },
    { title: "Inventory", icon: "📦" },
    { title: "Reports", icon: "📈" },
  ];

  return (
    <section className="py-24 bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Phone Mockup Left */}
          <div className="relative order-2 lg:order-1 flex justify-center">
             <div className="relative w-[300px] h-[600px] bg-slate-900 rounded-[3rem] p-4 shadow-2xl ring-1 ring-slate-800">
                <div className="h-full w-full bg-white rounded-[2.2rem] overflow-hidden">
                   <img src="https://img.freepik.com/premium-photo/modern-responsive-web-design-multiple-devices-isolated-white-background_1020495-23425.jpg" className="w-full h-full object-cover" alt="App Mockup" />
                </div>
                <div className="absolute left-1/2 top-4 w-20 h-4 -translate-x-1/2 bg-slate-900 rounded-full" />
             </div>
          </div>

          {/* Features List Right */}
          <div className="order-1 lg:order-2 space-y-12">
             <div className="space-y-6">
                <h2 className="text-4xl font-black text-slate-900 leading-tight">POWERFUL FEATURES FOR MODERN CLINICS</h2>
                <p className="text-lg text-slate-500 font-medium">Everything you need to manage your patients and operations in one place.</p>
             </div>

             <div className="grid sm:grid-cols-2 gap-8">
                {features.map((f, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-4"
                  >
                     <div className="h-12 w-12 shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-xl text-white shadow-lg shadow-blue-500/20">
                        {f.icon}
                     </div>
                     <span className="font-bold text-slate-900 uppercase tracking-tight">{f.title}</span>
                  </motion.div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
