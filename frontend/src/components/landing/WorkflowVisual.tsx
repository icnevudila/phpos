import { motion } from "framer-motion";

export function WorkflowVisual(): JSX.Element {
  const steps = [
    { id: "Q", label: "Queue", desc: "Patient Intake", color: "bg-slate-100 text-slate-500" },
    { id: "T", label: "Treatment", desc: "Clinical Charts", color: "bg-blue-600 text-white" },
    { id: "I", label: "Invoice", desc: "Payment Hub", color: "bg-slate-100 text-slate-500" },
    { id: "F", label: "Follow-up", desc: "Patient Retention", color: "bg-slate-100 text-slate-500" }
  ];

  return (
    <div className="bg-white rounded-[3rem] p-10 shadow-dent-card border border-slate-100 relative overflow-hidden group">
      <div className="grid grid-cols-4 gap-4 relative z-10">
        {steps.map((step, i) => (
          <div key={step.id} className="space-y-4">
             <div className={`h-24 rounded-3xl flex items-center justify-center text-2xl font-black transition-all ${step.color} ${i === 1 ? 'scale-110 shadow-xl' : 'opacity-40 scale-90'}`}>
                {step.id}
             </div>
             <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 leading-none">{step.label}</p>
                <p className="text-[9px] text-slate-400 uppercase tracking-tighter mt-1">{step.desc}</p>
             </div>
          </div>
        ))}
      </div>
      
      {/* Decorative Connector */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[70%] h-px bg-slate-200 -z-0" />
      
      {/* Small UI Snippet for the active step */}
      <div className="mt-12 bg-slate-50 rounded-2xl border border-slate-100 p-6">
         <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Active View: Treatment</span>
            <div className="flex gap-1">
               <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
               <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
               <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
            </div>
         </div>
         <div className="space-y-2">
            <div className="h-3 bg-white rounded-full w-3/4 border border-slate-200" />
            <div className="h-3 bg-white rounded-full w-1/2 border border-slate-200" />
            <div className="h-3 bg-white rounded-full w-[90%] border border-slate-200" />
         </div>
      </div>
    </div>
  );
}
