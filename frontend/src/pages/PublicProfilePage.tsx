import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Step = "profile" | "intro" | "questions" | "success";

export function PublicProfilePage(): JSX.Element {
  const [step, setStep] = useState<Step>("profile");
  const [allowed, setAllowed] = useState(false);

  const questions = [
    "Do you or your companion have fever or have you felt hot or feverish recently (14-21 days)?",
    "Are you or your companion having shortness of breath or other difficulties breathing?",
    "Do you or your companion have a cough?",
    "Do you or your companion have any other flu-like symptoms, such as gastrointestinal upset, headache or fatigue?",
    "Are you or your companion in contact with any confirmed COVID-19 positive patients?",
    "Are you or your companion over 60 years of age?",
    "Do you or your companion have a heart disease, lung disease, kidney disease, diabetes or any auto-immune disorders?",
    "Have you or your companion travelled in the past 14 days to any country affected by COVID-19?"
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-4xl w-full bg-white shadow-sm border border-slate-100 rounded-lg overflow-hidden flex flex-col items-center py-12 px-6 relative">
        
        {/* HEADER SECTION (Persistent across flow) */}
        <header className="mb-12 text-center">
           <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-12 w-12 text-blue-500">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 2a5 5 0 0 0-5 5c0 2 1 3 1 5s-1 4-1 6a3 3 0 0 0 6 0c0-1 .5-1 1-1s1 0 1 1a3 3 0 0 0 6 0c0-2-1-4-1-6s1-3 1-5a5 5 0 0 0-5-5Z" />
                 </svg>
              </div>
              <span className="text-4xl font-light text-slate-400">
                 <span className="text-blue-500 font-medium">My Dental</span> Clinic
              </span>
           </div>
        </header>

        <AnimatePresence mode="wait">
           {/* STEP 0: DOCTOR PROFILE */}
           {step === "profile" && (
             <motion.div 
               key="profile" 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="w-full flex flex-col items-center"
             >
                <div className="inline-block mb-10">
                   <h1 className="text-2xl font-bold text-slate-700 uppercase tracking-tight mb-1">Dentist Profile</h1>
                   <div className="h-0.5 w-full bg-blue-400" />
                </div>
                <div className="w-full max-w-3xl grid md:grid-cols-[240px_1fr] gap-12 items-start">
                   <div className="bg-[#0ea5e9] aspect-square flex items-center justify-center p-8 shadow-lg">
                      <h2 className="text-white text-xl font-bold text-center leading-snug">Dr. assssss ggggggg</h2>
                   </div>
                   <div className="space-y-8 pt-4">
                      <div className="grid gap-6">
                         {[
                           { label: "Dental Clinic:", val: "" },
                           { label: "Clinic Address:", val: "" },
                           { label: "Contact Number:", val: "" },
                           { label: "Email Address:", val: "aliddduvenci@gmail.com" },
                         ].map(item => (
                           <div key={item.label} className="grid grid-cols-[140px_1fr] items-center gap-4 border-b border-slate-50 pb-2">
                              <span className="text-slate-900 font-bold text-sm">{item.label}</span>
                              <span className="text-slate-600 text-sm">{item.val}</span>
                           </div>
                         ))}
                      </div>
                      <div className="pt-6 flex justify-center">
                         <button 
                           onClick={() => setStep("intro")}
                           className="bg-violet-500 text-white px-10 py-3 rounded text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-violet-500/20 hover:bg-violet-600 transition"
                         >
                            Request for Visit
                         </button>
                      </div>
                   </div>
                </div>
             </motion.div>
           )}

           {/* STEP 1: SCREENING INTRO */}
           {step === "intro" && (
             <motion.div 
               key="intro" 
               initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
               className="w-full max-w-3xl"
             >
                <h2 className="text-2xl font-bold text-slate-700 text-center mb-10">Patient Screening</h2>
                <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
                   <p>To our valued patient,</p>
                   <p>Our primary concern is your health, safety and protection and that of our other patients. Due to the pandemic, may we request you to truthfully answer the following questions to allow us to know whether we can deal with you right away or postpone your elective treatment after a suitable period so that we will not put others at risk.</p>
                   <p>We are strictly implementing this screening procedures in line with the Government efforts to contain the spread of the COVID-19 virus. Please be informed that non-cooperation of persons who should report notifiable diseases, such as the COVID-19 may be punishable by local laws. Rest assured that we will keep this questionnaire strictly confidential.</p>
                   <p>Thank you for your kind understanding and we wish you well.</p>
                </div>
                <div className="mt-10 flex flex-col items-center space-y-6">
                   <label className="flex items-start gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={allowed} 
                        onChange={(e) => setAllowed(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-blue-500 text-blue-500 focus:ring-blue-500" 
                      />
                      <span className="text-xs font-bold text-slate-700 leading-tight">
                         I am allowing this clinic to process my information. I hereby acknowledge that I have read and understand the above details.
                      </span>
                   </label>
                   <button 
                     disabled={!allowed}
                     onClick={() => setStep("questions")}
                     className={`px-10 py-2.5 rounded text-[10px] font-bold uppercase tracking-widest transition shadow-lg ${
                       allowed ? "bg-blue-500 text-white shadow-blue-500/20 hover:bg-blue-600" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                     }`}
                   >
                      Proceed
                   </button>
                </div>
             </motion.div>
           )}

           {/* STEP 2: SCREENING QUESTIONS */}
           {step === "questions" && (
             <motion.div 
               key="questions" 
               initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
               className="w-full max-w-2xl"
             >
                <h2 className="text-2xl font-bold text-slate-700 text-center mb-10">Patient Screening Questions</h2>
                <div className="space-y-8">
                   {questions.map((q, i) => (
                     <div key={i} className="space-y-4 border-b border-slate-50 pb-6">
                        <p className="text-[13px] font-bold text-slate-800">{i + 1}. {q}</p>
                        <div className="flex gap-6">
                           {["Yes", "No"].map(opt => (
                             <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                <div className="h-4 w-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
                                   <div className="h-2 w-2 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase">{opt}</span>
                             </label>
                           ))}
                        </div>
                     </div>
                   ))}
                </div>
                <div className="mt-12 flex justify-center gap-4">
                   <button onClick={() => setStep("intro")} className="bg-blue-500 text-white px-8 py-2 rounded text-[10px] font-bold uppercase tracking-widest">Back</button>
                   <button onClick={() => setStep("success")} className="bg-blue-500 text-white px-8 py-2 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                      Next <span>▶</span>
                   </button>
                </div>
             </motion.div>
           )}
        </AnimatePresence>

        {/* STEP 3: SUCCESS MODAL */}
        {step === "success" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
               className="bg-white rounded-lg shadow-2xl max-w-md w-full p-10 flex flex-col items-center text-center space-y-6"
             >
                <div className="h-24 w-24 rounded-full border-4 border-emerald-50 flex items-center justify-center text-emerald-500 mb-2">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-12 w-12">
                      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                   </svg>
                </div>
                <h3 className="text-3xl font-bold text-slate-700">Success!</h3>
                <div className="space-y-4 text-xs font-medium text-slate-500 leading-relaxed uppercase tracking-tight">
                   <p>Your request for visit has been sent to <span className="text-blue-500 font-bold">DR. ASSSSSS GGGGGGG</span>. Please wait for the message or call from the clinic for updates!</p>
                   <p>You may check your email to get the clinic's contact number to follow up.</p>
                </div>
                <button 
                  onClick={() => setStep("profile")}
                  className="bg-[#8ecae6] text-white px-10 py-2 rounded text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-200"
                >
                   OK
                </button>
             </motion.div>
          </div>
        )}

        {/* FOOTER */}
        <footer className="mt-24 text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center">
           Copyright © {new Date().getFullYear()} Quantum X, Inc.
        </footer>
      </div>
    </div>
  );
}
