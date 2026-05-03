import { motion } from "framer-motion";

export function DashboardMockup(): JSX.Element {
  return (
    <div className="relative group mx-auto max-w-[1300px]">
      
      {/* MACBOOK-STYLE FRAME */}
      <div className="rounded-[2.5rem] border-[1px] border-slate-200 bg-white shadow-dent-premium p-2 overflow-hidden relative">
        
        {/* Browser Top Bar */}
        <div className="h-10 bg-slate-50 border-b border-slate-100 flex items-center px-6 justify-between">
           <div className="flex gap-2">
              <div className="h-3 w-3 rounded-full bg-rose-400" />
              <div className="h-3 w-3 rounded-full bg-amber-400" />
              <div className="h-3 w-3 rounded-full bg-emerald-400" />
           </div>
           <div className="bg-white border border-slate-200 rounded-md px-10 py-1 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
              app.dentease.ph/dashboard
           </div>
           <div className="w-10" />
        </div>

        {/* Inner App Shell */}
        <div className="bg-[#f8fafc] h-[650px] flex overflow-hidden font-sans">
          
          {/* Sidebar */}
          <div className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-6 shrink-0">
             <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-6 text-emerald-400">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                      <path d="M12 2a5 5 0 0 0-5 5c0 2 1 3 1 5s-1 4-1 6a3 3 0 0 0 6 0c0-1 .5-1 1-1s1 0 1 1a3 3 0 0 0 6 0c0-2-1-4-1-6s1-3 1-5a5 5 0 0 0-5-5Z" />
                   </svg>
                </div>
                <span className="text-sm font-black text-white uppercase tracking-tighter">DENTEASE PH</span>
             </div>
             
             <div className="space-y-1">
                {[
                   { n: "Dashboard", a: true },
                   { n: "Queue", a: false },
                   { n: "Appointments", a: false },
                   { n: "Patients", a: false },
                   { n: "Invoices", a: false },
                   { n: "HMO Claims", a: false },
                   { n: "Inventory", a: false }
                ].map((item) => (
                   <div key={item.n} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer ${item.a ? 'bg-medical-gradient text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white'}`}>
                      <div className={`h-4 w-4 rounded-md bg-current ${item.a ? 'opacity-30' : 'opacity-10'}`} />
                      {item.n}
                   </div>
                ))}
             </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
             {/* Header */}
             <div className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                   <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Command Center</h2>
                   <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-[10px] font-black text-emerald-600 ring-1 ring-emerald-100 uppercase tracking-wider">Live: Asia/Manila</span>
                </div>
                <div className="flex items-center gap-4">
                   <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200" />
                </div>
             </div>

             {/* Dashboard Content */}
             <div className="p-10 grid grid-cols-12 gap-8 overflow-y-auto">
                
                {/* KPI Cards */}
                <div className="col-span-12 grid grid-cols-4 gap-6">
                   {[
                      { label: "Today's Revenue", val: "₱42,500", color: "text-emerald-600", bg: "bg-emerald-50/50" },
                      { label: "Patients In", val: "14", color: "text-sky-600", bg: "bg-sky-50/50" },
                      { label: "HMO Pending", val: "8", color: "text-amber-600", bg: "bg-amber-50/50" },
                      { label: "Active Queue", val: "3", color: "text-rose-600", bg: "bg-rose-50/50" }
                   ].map((kpi) => (
                      <motion.div 
                        whileHover={{ y: -5 }}
                        key={kpi.label} 
                        className={`p-6 rounded-[2rem] border border-slate-100 shadow-dent-card ${kpi.bg} transition-all`}
                      >
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{kpi.label}</p>
                         <h3 className={`text-2xl font-black mt-2 tracking-tighter ${kpi.color}`}>{kpi.val}</h3>
                      </motion.div>
                   ))}
                </div>

                {/* Main Queue & Calendar */}
                <div className="col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-dent-card overflow-hidden flex flex-col">
                   <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-900">Live Patient Queue</span>
                      <button className="text-[10px] font-black uppercase text-emerald-600 hover:underline">View All</button>
                   </div>
                   <div className="p-8 space-y-4">
                      {[
                         { name: "Maria Santos", proc: "Restorative", time: "09:30 AM", status: "In Treatment", sCol: "bg-emerald-100 text-emerald-600" },
                         { name: "Juan Dela Cruz", proc: "Oral Surgery", time: "10:15 AM", status: "Checked In", sCol: "bg-sky-100 text-sky-600" },
                         { name: "Ana Reyes", proc: "HMO - Maxicare", time: "11:00 AM", status: "Waiting", sCol: "bg-amber-100 text-amber-600" }
                      ].map((p, i) => (
                         <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white transition-all cursor-pointer group">
                            <div className="flex items-center gap-4">
                               <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 shadow-sm" />
                               <div>
                                  <p className="text-xs font-bold text-slate-900">{p.name}</p>
                                  <p className="text-[10px] text-slate-400 uppercase tracking-tighter font-medium mt-0.5">{p.proc}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-6">
                               <span className="text-[11px] font-bold text-slate-400 tracking-tighter">{p.time}</span>
                               <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${p.sCol}`}>{p.status}</span>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>

                {/* Payment Summary */}
                <div className="col-span-4 space-y-8">
                   <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-dent-card p-8 space-y-6">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-900">Recent Payment</span>
                      <div className="p-6 rounded-3xl bg-emerald-50/30 border border-emerald-100 space-y-4">
                         <div className="flex justify-between text-xs">
                            <span className="text-slate-400 font-medium">Method:</span>
                            <span className="font-black text-emerald-600 uppercase tracking-wider">GCash / Maya</span>
                         </div>
                         <div className="flex justify-between text-sm">
                            <span className="text-slate-400 font-medium">Amount:</span>
                            <span className="font-black text-slate-900 tracking-tighter">₱2,450.00</span>
                         </div>
                         <div className="pt-4 border-t border-emerald-100 flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">OR-2024-0041</span>
                            <span className="text-[10px] font-black text-emerald-600 uppercase">Success</span>
                         </div>
                      </div>
                   </div>

                   <div className="bg-medical-gradient rounded-[2.5rem] p-8 text-white space-y-6 shadow-dent-blue">
                      <div className="flex items-center justify-between">
                         <span className="text-xs font-black uppercase tracking-[0.2em]">HMO Claim Age</span>
                         <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                      </div>
                      <div className="space-y-3">
                         <div className="flex justify-between text-[11px] font-black uppercase">
                            <span>Maxicare Approved</span>
                            <span>85%</span>
                         </div>
                         <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-white w-[85%]" />
                         </div>
                      </div>
                   </div>
                </div>

             </div>
          </div>

        </div>
      </div>

      {/* BACKGROUND DECORATION (The Mix) */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-400/10 blur-[100px] rounded-full animate-floating" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-sky-400/10 blur-[100px] rounded-full animate-floating" style={{ animationDelay: '2s' }} />
    </div>
  );
}
