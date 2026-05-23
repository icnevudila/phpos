import { useMemo, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ShieldCheck, 
  Plus, 
  PenTool, 
  FileCheck, 
  Clock, 
  Eye, 
  Download,
  AlertCircle,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Stage, Layer, Line } from "react-konva";
import { listConsentForms, createConsentForm, signConsentForm } from "../../services/consent";

export function ConsentsTab({ patientId, canWrite }: { patientId: string; canWrite: boolean }) {
  const queryClient = useQueryClient();
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data: forms = [], isLoading } = useQuery({
    queryKey: ["consentForms", patientId],
    queryFn: () => listConsentForms(patientId),
  });

  if (isLoading) return (
    <div className="card p-8 flex flex-col items-center justify-center text-center bg-brand-surface border border-brand-border">
      <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest animate-pulse">Loading forms...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div className="space-y-1">
            <h3 className="text-sm font-bold text-brand-text uppercase tracking-widest">Consent & Legal Forms</h3>
            <p className="text-xs text-brand-muted">Manage patient waivers, treatment consents, and signatures.</p>
         </div>
         {canWrite && (
           <button 
             onClick={() => setIsCreating(true)}
             className="btn-primary flex items-center gap-2 h-8 px-3 text-xs"
           >
             <Plus size={14} /> New Document
           </button>
         )}
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <AddConsentForm patientId={patientId} onCancel={() => setIsCreating(false)} onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["consentForms", patientId] });
              setIsCreating(false);
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {forms.length === 0 ? (
          <div className="card p-8 flex flex-col items-center justify-center text-center bg-brand-surface-soft border border-brand-border">
            <p className="text-sm font-bold text-brand-muted uppercase tracking-widest">No Legal Forms Found</p>
          </div>
        ) : forms.map((form) => (
          <div key={form.id} className="card group flex items-center justify-between p-4 bg-white border border-brand-border hover:bg-brand-surface-soft transition-colors">
             <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border ${form.signedAt ? 'bg-teal-50 text-teal-600 border-teal-200' : 'bg-brand-surface text-brand-muted border-brand-border'}`}>
                   {form.signedAt ? <FileCheck size={20} /> : <Clock size={20} />}
                </div>
                <div>
                   <h4 className="text-sm font-bold text-brand-text">{form.title}</h4>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted mt-0.5">
                      {form.signedAt
                        ? `Signed on ${new Date(form.signedAt).toLocaleDateString()}`
                        : `Drafted on ${new Date(form.createdAt).toLocaleDateString()}`}
                   </p>
                </div>
             </div>
             <div className="flex items-center gap-2">
                {!form.signedAt && (
                  <button 
                    onClick={() => setSelectedFormId(form.id)}
                    className="btn-primary text-xs h-8 px-3 gap-1.5"
                  >
                    <PenTool size={14} /> Sign Document
                  </button>
                )}
                {form.signedAt && (
                   <div className="flex items-center gap-1.5 px-2.5 h-8 rounded-[var(--radius-sm)] bg-teal-50 border border-teal-200 text-[10px] font-black uppercase tracking-widest text-teal-700">
                      <ShieldCheck size={14} /> Signed
                   </div>
                )}
                <button className="btn-secondary h-8 px-2">
                   <Eye size={14} />
                </button>
             </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selectedFormId && (
          <SignatureModal 
            formId={selectedFormId} 
            onClose={() => setSelectedFormId(null)} 
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["consentForms", patientId] });
              setSelectedFormId(null);
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function AddConsentForm({ patientId, onCancel, onSuccess }: any) {
  const [busy, setBusy] = useState(false);
  const initial = useMemo(
    () => ({
      title: "Standard Treatment Consent",
      content: "I hereby authorize the clinical provider to perform the proposed dental treatment...",
    }),
    [],
  );
  const [data, setData] = useState(initial);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setBusy(true);
    try {
      await createConsentForm({ patientId, ...data });
      toast.success("Consent form drafted successfully.");
      onSuccess();
    } catch {
      toast.error("Failed to draft consent form.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 bg-brand-surface-soft border border-brand-border space-y-4 mb-2">
       <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="text-brand-primary" size={16} />
          <h4 className="text-xs font-black uppercase tracking-widest text-brand-text">Draft New Document</h4>
       </div>
       <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-1">
            Document Title
          </label>
          <input 
            value={data.title}
            onChange={e => setData({...data, title: e.target.value})}
            className="h-10 w-full rounded-[var(--radius-sm)] bg-white border border-brand-border px-3 text-sm font-bold text-brand-text outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
          />
       </div>
       <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-1">
            Legal Content / Waiver
          </label>
          <textarea 
            value={data.content}
            onChange={e => setData({...data, content: e.target.value})}
            className="w-full h-32 rounded-[var(--radius-sm)] bg-white border border-brand-border p-3 text-xs font-medium text-brand-text leading-relaxed outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all resize-none"
          />
       </div>
       <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onCancel} className="btn-secondary h-9 px-4 text-xs">Cancel</button>
          <button disabled={busy} type="submit" className="btn-primary h-9 px-6 text-xs disabled:opacity-50">
             {busy ? "Drafting..." : "Draft Document"}
          </button>
       </div>
    </form>
  );
}

function SignatureModal({ formId, onClose, onSuccess }: any) {
  const [lines, setLines] = useState<any[]>([]);
  const isDrawing = useRef(false);
  const stageRef = useRef<any>(null);
  const [busy, setBusy] = useState(false);

  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const clear = () => setLines([]);

  const handleSign = async () => {
    if (lines.length === 0) return toast.error("Please draw a signature first.");
    
    setBusy(true);
    try {
      const dataUrl = stageRef.current.toDataURL();
      await signConsentForm(formId, dataUrl);
      toast.success("Document successfully signed.");
      onSuccess();
    } catch {
      toast.error("Failed to apply signature.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
       <motion.div 
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         className="w-full max-w-xl card bg-white overflow-hidden shadow-2xl"
       >
          <div className="p-4 border-b border-brand-border bg-brand-surface-soft flex justify-between items-center">
             <div className="flex items-center gap-2">
                <PenTool className="text-brand-text" size={16} />
                <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest">E-Signature Capture</h3>
             </div>
             <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-[var(--radius-sm)] text-brand-muted hover:text-brand-text hover:bg-brand-surface transition-colors">
                <X size={16} />
             </button>
          </div>

          <div className="p-6 space-y-6">
             <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-[var(--radius-sm)] border border-amber-200">
                <AlertCircle className="text-amber-600 shrink-0" size={16} />
                <p className="text-xs font-bold text-amber-900 leading-relaxed">
                   By signing this document, you acknowledge and agree to the terms specified within the legal waiver.
                </p>
             </div>

             <div className="relative aspect-[2/1] w-full rounded-[var(--radius-md)] bg-brand-surface-muted border border-dashed border-brand-muted/30 cursor-crosshair overflow-hidden">
                <Stage
                  width={600}
                  height={300}
                  onMouseDown={handleMouseDown}
                  onMousemove={handleMouseMove}
                  onMouseup={handleMouseUp}
                  ref={stageRef}
                >
                  <Layer>
                    {lines.map((line, i) => (
                      <Line
                        key={i}
                        points={line.points}
                        stroke="var(--color-brand-text)"
                        strokeWidth={2.5}
                        tension={0.5}
                        lineCap="round"
                        globalCompositeOperation="source-over"
                      />
                    ))}
                  </Layer>
                </Stage>
                <button 
                  onClick={clear}
                  className="absolute bottom-4 right-4 btn-secondary text-[10px] px-3 h-7 bg-white/80 backdrop-blur"
                >
                  Clear Pad
                </button>
             </div>

             <div className="flex gap-3 justify-end pt-2 border-t border-brand-border/50">
                <button 
                  disabled={busy}
                  onClick={onClose}
                  className="btn-secondary h-9 px-4 text-xs"
                >
                   Cancel
                </button>
                <button 
                  disabled={busy}
                  onClick={handleSign}
                  className="btn-primary h-9 px-6 gap-2 text-xs disabled:opacity-50"
                >
                   {busy ? "Applying..." : "Apply Signature"}
                </button>
             </div>
          </div>
       </motion.div>
    </div>
  );
}
