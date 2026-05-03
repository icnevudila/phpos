import { useState } from "react";
import { motion } from "framer-motion";

export function ProfilePage(): JSX.Element {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0ea5e9] flex flex-col shrink-0">
        <div className="p-6 flex flex-col items-center border-b border-white/10">
           <div className="h-24 w-24 rounded-full bg-slate-200 border-4 border-white/20 flex items-center justify-center text-slate-400">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-16 w-16">
                 <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
           </div>
           <button className="mt-3 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded flex items-center gap-1">
              📁 Browse
           </button>
        </div>

        <nav className="flex-1 py-4">
           {[
             { id: "dashboard", label: "My Dashboard", icon: "🏠" },
             { id: "profile", label: "My Profile", icon: "👤" },
             { id: "screening", label: "Patient for Screening", icon: "📋" },
           ].map(item => (
             <button 
               key={item.id}
               onClick={() => setActiveTab(item.id)}
               className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition ${
                 activeTab === item.id ? "bg-white text-blue-600 shadow-inner" : "text-white hover:bg-white/10"
               }`}
             >
                <span>{item.icon}</span>
                {item.label}
             </button>
           ))}
        </nav>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">
        {/* HEADER BAR */}
        <header className="h-14 bg-[#0ea5e9] flex items-center justify-between px-6 shadow-md z-10">
           <div className="flex items-center gap-4">
              <button className="text-white">☰</button>
              <div className="relative">
                 <input 
                   type="text" 
                   placeholder="Search Patient Name..." 
                   className="w-64 bg-white px-3 py-1.5 rounded text-xs focus:outline-none" 
                 />
              </div>
           </div>
           <div className="flex items-center gap-3 text-white text-xs font-bold">
              <span>👤 Dr. aliduvenci 8888888</span>
              <span>▼</span>
           </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-6 overflow-y-auto space-y-6">
           {/* Orange Alert */}
           <div className="bg-amber-500 text-white px-4 py-2.5 rounded text-xs font-medium flex items-center gap-2">
              📝 Please complete your Profile and Clinic information so that your patients will see your full details on your unique profile page!
           </div>

           {/* Update Profile Card */}
           <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                 <span className="text-slate-500">👤</span>
                 <h2 className="text-sm font-bold text-slate-700">Update Profile</h2>
              </div>

              <div className="p-8 space-y-12">
                 {/* Section: Patient Link */}
                 <div className="space-y-4">
                    <div className="flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-wider">
                       <span>🔗</span> Patient Link
                    </div>
                    <div className="bg-amber-50/50 p-4 rounded text-[10px] text-amber-800 leading-relaxed border border-amber-100">
                       <p className="font-bold mb-1 italic">Note: This is your page link that you may give to your patients. You can personalize this:</p>
                       <div className="flex items-center gap-2 mt-2">
                          <span className="text-rose-500">*</span> https://visit.dentalclinicapp.com/doctor/
                          <input type="text" value="8333333_ZZZZZZZ" readOnly className="bg-white border border-slate-200 p-1 rounded w-48 text-slate-600" />
                       </div>
                    </div>
                 </div>

                 {/* Section: Dentist Information */}
                 <div className="space-y-6">
                    <div className="flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-wider">
                       <span>👨‍⚕️</span> Dentist Information
                    </div>
                    <div className="grid gap-4 max-w-2xl text-[10px]">
                       {[
                         { label: "First name", val: "8333333" },
                         { label: "Last name", val: "ZZZZZZZ" },
                         { label: "Email", val: "aliduvenci@gmail.com" },
                         { label: "Degree", val: "", placeholder: "Example: Doctor of Medicine in Dentistry" },
                       ].map(field => (
                         <div key={field.label} className="grid grid-cols-[120px_1fr] items-center gap-4">
                            <label className="text-slate-600 text-right font-bold">
                               <span className="text-rose-500 mr-1">*</span>{field.label} :
                            </label>
                            <input 
                              type="text" 
                              defaultValue={field.val} 
                              placeholder={field.placeholder}
                              className="border border-slate-200 p-2 rounded w-full focus:outline-none focus:ring-1 focus:ring-blue-500" 
                            />
                         </div>
                       ))}
                       <div className="grid grid-cols-[120px_1fr] items-start gap-4">
                          <label className="text-slate-600 text-right font-bold pt-2">Affiliations :</label>
                          <textarea className="border border-slate-200 p-2 rounded w-full h-24 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                       </div>
                    </div>
                 </div>

                 {/* Section: Clinic Schedule */}
                 <div className="space-y-6">
                    <div className="flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-wider">
                       <span>📅</span> Clinic Schedule
                    </div>
                    <p className="text-[10px] text-blue-500 italic">Click on the date to change the time.</p>
                    <div className="max-w-md space-y-3">
                       {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                         <div key={day} className="flex items-center justify-between py-2 border-b border-slate-50">
                            <div className="flex items-center gap-4">
                               <span className="text-slate-400">🕒</span>
                               <span className="text-[10px] font-bold text-slate-700 w-20">{day}</span>
                               <span className="text-[10px] text-slate-500">08:00 AM → 05:00 PM</span>
                            </div>
                            <div className="h-4 w-8 bg-slate-200 rounded-full relative">
                               <div className="absolute right-1 top-1 h-2 w-2 bg-white rounded-full shadow-sm" />
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* Save Button */}
                 <div className="pt-8 flex justify-center">
                    <button className="bg-violet-500 text-white px-10 py-2 rounded text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-violet-500/20 hover:bg-violet-600 transition">
                       💾 Save Changes
                    </button>
                 </div>
              </div>
           </div>
           
           <div className="text-center py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Copyright © {new Date().getFullYear()} Quantum X, Inc.
           </div>
        </main>
      </div>
    </div>
  );
}
