import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Stethoscope, 
  ShieldCheck,
  Check
} from "lucide-react";

// --- Mock Data ---

const TREATMENTS = [
  { id: "t1", name: "Dental Examination", duration: "30 min", price: "From $50", icon: <Stethoscope size={24} /> },
  { id: "t2", name: "Teeth Cleaning", duration: "45 min", price: "From $80", icon: <ShieldCheck size={24} /> },
  { id: "t3", name: "Root Canal", duration: "90 min", price: "Consult Clinic", icon: <Stethoscope size={24} /> },
  { id: "t4", name: "Implant Consultation", duration: "30 min", price: "Free", icon: <ShieldCheck size={24} /> },
  { id: "t5", name: "Orthodontics", duration: "60 min", price: "Consult Clinic", icon: <Stethoscope size={24} /> },
  { id: "t6", name: "Emergency Care", duration: "Varies", price: "From $100", icon: <ShieldCheck size={24} /> },
];

const DOCTORS = [
  { id: "d1", name: "Dr. Emily Chen", specialty: "Aesthetic Dentistry", rating: 4.9, availability: "Available Today", avatar: "https://i.pravatar.cc/150?u=d1" },
  { id: "d2", name: "Dr. Michael Ross", specialty: "Endodontics", rating: 4.8, availability: "Available Tomorrow", avatar: "https://i.pravatar.cc/150?u=d2" },
  { id: "d3", name: "Dr. Sarah Jenkins", specialty: "Orthodontics", rating: 5.0, availability: "Busy", avatar: "https://i.pravatar.cc/150?u=d3" },
];

const DATES = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return d;
});

const TIMES = ["09:30", "10:00", "11:30", "13:00", "14:30", "16:00", "17:30"];

// --- Interfaces ---

interface BookingState {
  treatmentId: string | null;
  doctorId: string | null;
  date: Date | null;
  time: string | null;
  patient: {
    fullName: string;
    phone: string;
    email: string;
    dob: string;
    notes: string;
    firstTime: boolean;
    consent: boolean;
  };
}

export function AppointmentBooking() {
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [state, setState] = useState<BookingState>({
    treatmentId: null,
    doctorId: null,
    date: null,
    time: null,
    patient: {
      fullName: "",
      phone: "",
      email: "",
      dob: "",
      notes: "",
      firstTime: true,
      consent: false,
    }
  });

  const nextStep = () => setStep((s) => Math.min(s + 1, 5));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleConfirm = () => {
    // Mock API call
    setTimeout(() => {
      setIsSuccess(true);
    }, 800);
  };

  const reset = () => {
    setIsSuccess(false);
    setStep(1);
    setState({
      treatmentId: null,
      doctorId: null,
      date: null,
      time: null,
      patient: {
        fullName: "",
        phone: "",
        email: "",
        dob: "",
        notes: "",
        firstTime: true,
        consent: false,
      }
    });
  };

  // --- Step Rendering ---

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TREATMENTS.map(t => {
          const isSelected = state.treatmentId === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { setState({ ...state, treatmentId: t.id }); setTimeout(nextStep, 300); }}
              className={`flex items-start gap-4 p-4 rounded-[var(--radius-lg)] border-2 text-left transition-all ${
                isSelected 
                  ? "border-brand-primary bg-brand-primary-soft shadow-sm" 
                  : "border-brand-border bg-brand-surface hover:border-brand-primary/40 hover:bg-brand-surface-muted"
              }`}
            >
              <div className={`p-2 rounded-[var(--radius-md)] ${isSelected ? "bg-brand-primary text-white" : "bg-brand-surface-muted text-brand-primary"}`}>
                {t.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-brand-text">{t.name}</h4>
                <div className="flex items-center gap-3 mt-1 text-sm text-brand-muted">
                  <span className="flex items-center gap-1"><Clock size={14} /> {t.duration}</span>
                  <span>{t.price}</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {DOCTORS.map(d => {
          const isSelected = state.doctorId === d.id;
          const isBusy = d.availability === "Busy";
          return (
            <button
              key={d.id}
              onClick={() => { setState({ ...state, doctorId: d.id }); setTimeout(nextStep, 300); }}
              className={`flex items-center gap-4 p-4 rounded-[var(--radius-lg)] border-2 text-left transition-all ${
                isSelected 
                  ? "border-brand-primary bg-brand-primary-soft shadow-sm" 
                  : "border-brand-border bg-brand-surface hover:border-brand-primary/40 hover:bg-brand-surface-muted"
              }`}
            >
              <img src={d.avatar} alt={d.name} className="w-16 h-16 rounded-full object-cover border-2 border-brand-surface shadow-sm" />
              <div className="flex-1">
                <h4 className="font-semibold text-brand-text text-lg">{d.name}</h4>
                <p className="text-sm text-brand-muted">{d.specialty}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-semibold bg-brand-surface-muted text-brand-text px-2 py-1 rounded-[var(--radius-sm)]">★ {d.rating}</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-[var(--radius-sm)] ${
                    isBusy ? "bg-brand-danger-soft text-brand-danger" : "bg-brand-primary-soft text-brand-primary"
                  }`}>
                    {d.availability}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8">
      {/* Date Selection */}
      <div>
        <h4 className="font-semibold text-brand-text mb-4 flex items-center gap-2"><CalendarIcon size={18} className="text-brand-primary"/> Select Date</h4>
        <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
          {DATES.map((d, i) => {
            const isSelected = state.date?.toDateString() === d.toDateString();
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = d.getDate();
            const monthName = d.toLocaleDateString('en-US', { month: 'short' });
            
            return (
              <button
                key={i}
                onClick={() => setState({ ...state, date: d, time: null })}
                className={`flex-shrink-0 w-20 py-3 rounded-[var(--radius-lg)] border-2 flex flex-col items-center transition-all ${
                  isSelected 
                    ? "border-brand-primary bg-brand-primary text-white shadow-md" 
                    : "border-brand-border bg-brand-surface hover:border-brand-primary/40 text-brand-muted"
                }`}
              >
                <span className={`text-xs font-semibold uppercase tracking-wider ${isSelected ? "text-white/80" : "text-brand-muted"}`}>{monthName}</span>
                <span className={`text-2xl font-bold my-1 ${isSelected ? "text-white" : "text-brand-text"}`}>{dayNum}</span>
                <span className={`text-xs ${isSelected ? "text-white/80" : "text-brand-muted"}`}>{dayName}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Time Selection */}
      <AnimatePresence>
        {state.date && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="pt-2"
          >
            <h4 className="font-semibold text-brand-text mb-4 flex items-center gap-2"><Clock size={18} className="text-brand-primary"/> Select Time</h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {TIMES.map((time, i) => {
                const isSelected = state.time === time;
                // Randomly disable some times for mock
                const isDisabled = (i % 3 === 0 && state.date?.getDate()! % 2 === 0);
                
                return (
                  <button
                    key={time}
                    disabled={isDisabled}
                    onClick={() => { setState({ ...state, time }); setTimeout(nextStep, 300); }}
                    className={`py-2.5 rounded-[var(--radius-md)] text-sm font-semibold transition-all border-2 ${
                      isDisabled
                        ? "bg-brand-surface-muted border-transparent text-brand-muted/50 cursor-not-allowed line-through"
                        : isSelected
                          ? "bg-brand-primary border-brand-primary text-white shadow-md"
                          : "bg-brand-surface border-brand-border text-brand-text hover:border-brand-primary/40"
                    }`}
                  >
                    {time}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-brand-text">Full Name *</label>
          <div className="relative">
            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input 
              type="text" 
              className="w-full pl-10 pr-4 py-3 rounded-[var(--radius-md)] border border-brand-border focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all bg-brand-surface-muted focus:bg-brand-surface text-brand-text"
              placeholder="John Doe"
              value={state.patient.fullName}
              onChange={(e) => setState({...state, patient: {...state.patient, fullName: e.target.value}})}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-brand-text">Phone Number *</label>
          <div className="relative">
            <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input 
              type="tel" 
              className="w-full pl-10 pr-4 py-3 rounded-[var(--radius-md)] border border-brand-border focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all bg-brand-surface-muted focus:bg-brand-surface text-brand-text"
              placeholder="+1 (555) 000-0000"
              value={state.patient.phone}
              onChange={(e) => setState({...state, patient: {...state.patient, phone: e.target.value}})}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-brand-text">Email Address</label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input 
              type="email" 
              className="w-full pl-10 pr-4 py-3 rounded-[var(--radius-md)] border border-brand-border focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all bg-brand-surface-muted focus:bg-brand-surface text-brand-text"
              placeholder="john@example.com"
              value={state.patient.email}
              onChange={(e) => setState({...state, patient: {...state.patient, email: e.target.value}})}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-brand-text">Date of Birth</label>
          <input 
            type="date" 
            className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-brand-border focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all bg-brand-surface-muted focus:bg-brand-surface text-brand-text"
            value={state.patient.dob}
            onChange={(e) => setState({...state, patient: {...state.patient, dob: e.target.value}})}
          />
        </div>
      </div>
      
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-brand-text">Notes / Symptoms</label>
        <textarea 
          rows={3}
          className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-brand-border focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all bg-brand-surface-muted focus:bg-brand-surface resize-none text-brand-text"
          placeholder="Briefly describe your dental issue or any special requests..."
          value={state.patient.notes}
          onChange={(e) => setState({...state, patient: {...state.patient, notes: e.target.value}})}
        />
      </div>

      <div className="space-y-4 pt-2">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-all ${
            state.patient.firstTime ? "bg-brand-primary border-brand-primary" : "border-brand-border bg-brand-surface group-hover:border-brand-primary"
          }`}>
            {state.patient.firstTime && <Check size={14} className="text-white" />}
          </div>
          <span className="text-sm text-brand-text font-medium">This is my first time visiting the clinic</span>
          <input 
            type="checkbox" 
            className="sr-only"
            checked={state.patient.firstTime}
            onChange={(e) => setState({...state, patient: {...state.patient, firstTime: e.target.checked}})}
          />
        </label>
        
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-all ${
            state.patient.consent ? "bg-brand-primary border-brand-primary" : "border-brand-border bg-brand-surface group-hover:border-brand-primary"
          }`}>
            {state.patient.consent && <Check size={14} className="text-white" />}
          </div>
          <span className="text-sm text-brand-muted">I agree to the processing of my personal data in accordance with the Privacy Policy. *</span>
          <input 
            type="checkbox" 
            className="sr-only"
            checked={state.patient.consent}
            onChange={(e) => setState({...state, patient: {...state.patient, consent: e.target.checked}})}
          />
        </label>
      </div>

      <button 
        onClick={nextStep}
        disabled={!state.patient.fullName || !state.patient.phone || !state.patient.consent}
        className="btn-primary w-full mt-6 py-3 font-bold text-base flex items-center justify-center"
      >
        Continue to Review
      </button>
    </div>
  );

  const renderStep5 = () => {
    const treatment = TREATMENTS.find(t => t.id === state.treatmentId);
    const doctor = DOCTORS.find(d => d.id === state.doctorId);
    const dateStr = state.date?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
      <div className="space-y-6">
        <div className="bg-brand-surface-muted p-6 rounded-[var(--radius-lg)] border border-brand-border">
          <h4 className="text-lg font-bold text-brand-text mb-6">Appointment Summary</h4>
          
          <div className="space-y-4">
            <div className="flex items-start justify-between pb-4 border-b border-brand-border">
              <div>
                <p className="text-sm text-brand-muted font-medium mb-1">Treatment</p>
                <p className="font-semibold text-brand-text">{treatment?.name}</p>
              </div>
              <button onClick={() => setStep(1)} className="text-sm text-brand-primary font-semibold hover:underline">Edit</button>
            </div>
            
            <div className="flex items-start justify-between pb-4 border-b border-brand-border">
              <div>
                <p className="text-sm text-brand-muted font-medium mb-1">Doctor</p>
                <div className="flex items-center gap-2">
                  <img src={doctor?.avatar} alt={doctor?.name} className="w-6 h-6 rounded-full" />
                  <p className="font-semibold text-brand-text">{doctor?.name}</p>
                </div>
              </div>
              <button onClick={() => setStep(2)} className="text-sm text-brand-primary font-semibold hover:underline">Edit</button>
            </div>

            <div className="flex items-start justify-between pb-4 border-b border-brand-border">
              <div>
                <p className="text-sm text-brand-muted font-medium mb-1">Date & Time</p>
                <p className="font-semibold text-brand-text">{dateStr} at {state.time}</p>
              </div>
              <button onClick={() => setStep(3)} className="text-sm text-brand-primary font-semibold hover:underline">Edit</button>
            </div>

            <div className="flex items-start justify-between pt-2">
              <div>
                <p className="text-sm text-brand-muted font-medium mb-1">Patient Details</p>
                <p className="font-semibold text-brand-text">{state.patient.fullName}</p>
                <p className="text-sm text-brand-text">{state.patient.phone}</p>
              </div>
              <button onClick={() => setStep(4)} className="text-sm text-brand-primary font-semibold hover:underline">Edit</button>
            </div>
          </div>
        </div>

        <button 
          onClick={handleConfirm}
          className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={20} />
          Confirm Booking
        </button>
      </div>
    );
  };

  const renderSuccess = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="py-12 text-center"
    >
      <div className="w-20 h-20 bg-brand-primary-soft rounded-[var(--radius-md)] flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 size={40} className="text-brand-primary" />
      </div>
      <h3 className="text-2xl font-bold text-brand-text mb-3">Booking Confirmed!</h3>
      <p className="text-brand-muted mb-8 max-w-md mx-auto">
        Your appointment for <strong>{TREATMENTS.find(t=>t.id===state.treatmentId)?.name}</strong> on <strong>{state.date?.toLocaleDateString()} at {state.time}</strong> has been successfully booked. We've sent the details to your email and phone.
      </p>
      <button 
        onClick={reset}
        className="btn-secondary px-8 py-3 font-semibold"
      >
        Book Another Visit
      </button>
    </motion.div>
  );

  // --- Layout ---

  const stepTitles = [
    "Select Treatment",
    "Choose Doctor",
    "Date & Time",
    "Your Details",
    "Confirm Booking"
  ];

  return (
    <div className="max-w-2xl mx-auto w-full mt-8">
      <div className="bg-brand-surface rounded-[var(--radius-xl)] shadow-popover border border-brand-border overflow-hidden">
        
        {/* Header / Stepper */}
        {!isSuccess && (
          <div className="bg-brand-surface-muted p-6 sm:p-8 border-b border-brand-border">
            <h2 className="text-2xl font-bold text-brand-text mb-6">Book an Appointment</h2>
            
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-brand-border rounded-full" />
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-primary rounded-full transition-all duration-500" 
                style={{ width: `${((step - 1) / 4) * 100}%` }}
              />
              
              {[1, 2, 3, 4, 5].map((num) => {
                const isActive = step === num;
                const isPassed = step > num;
                return (
                  <div key={num} className="relative z-10 flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      isActive 
                        ? "bg-brand-primary text-white shadow-md ring-4 ring-brand-primary/20" 
                        : isPassed 
                          ? "bg-brand-primary text-white" 
                          : "bg-brand-surface border border-brand-border text-brand-muted"
                    }`}>
                      {isPassed ? <Check size={16} /> : num}
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="mt-4 text-center">
              <span className="text-brand-primary font-semibold text-sm uppercase tracking-wider">Step {step} of 5</span>
              <h3 className="text-brand-text font-bold text-lg">{stepTitles[step - 1]}</h3>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="p-6 sm:p-8">
          {isSuccess ? renderSuccess() : (
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
                {step === 5 && renderStep5()}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
        
        {/* Footer Navigation */}
        {!isSuccess && step > 1 && step < 5 && (
          <div className="px-6 sm:px-8 py-4 bg-brand-surface-muted border-t border-brand-border flex items-center justify-between">
            <button 
              onClick={prevStep}
              className="btn-secondary flex items-center gap-2"
            >
              <ChevronLeft size={16} /> Back
            </button>
            <button 
              onClick={nextStep}
              disabled={
                (step === 2 && !state.doctorId) || 
                (step === 3 && (!state.date || !state.time))
              }
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              Continue <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
