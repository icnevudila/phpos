import { useMemo, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
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

const CONSENT_NS = "pages.patientDetail.consentsTab";

export function ConsentsTab({ patientId, canWrite }: { patientId: string; canWrite: boolean }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data: forms = [], isLoading } = useQuery({
    queryKey: ["consentForms", patientId],
    queryFn: () => listConsentForms(patientId),
  });

  if (isLoading) return <motion.div className="py-20 text-center text-slate-400 font-black uppercase tracking-widest animate-pulse">{t(`${CONSENT_NS}.loading`)}</motion.div>;

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
         <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t(`${CONSENT_NS}.title`)}</h3>
            <p className="text-xs font-bold text-slate-400">{t(`${CONSENT_NS}.subtitle`)}</p>
         </div>
         {canWrite && (
           <button 
             onClick={() => setIsCreating(true)}
             className="flex h-12 items-center gap-2 rounded-2xl bg-white text-white px-6 text-xs font-black uppercase tracking-widest shadow-lg transition-all hover:scale-105 active:scale-95"
           >
             <Plus size={18} /> {t(`${CONSENT_NS}.newDocument`)}
           </button>
         )}
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            <AddConsentForm patientId={patientId} onCancel={() => setIsCreating(false)} onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["consentForms", patientId] });
              setIsCreating(false);
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6">
        {forms.map((form) => (
          <div key={form.id} className="group flex items-center justify-between p-8 rounded-[2.5rem] bg-white shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 transition-all hover:shadow-2xl">
             <div className="flex items-center gap-6">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${form.signedAt ? 'bg-teal-50 text-teal-600' : 'bg-slate-50 text-slate-400'}`}>
                   {form.signedAt ? <FileCheck size={28} /> : <Clock size={28} />}
                </div>
                <div>
                   <h4 className="text-lg font-black text-slate-900">{form.title}</h4>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {form.signedAt
                        ? t(`${CONSENT_NS}.signedOn`, { date: new Date(form.signedAt).toLocaleDateString() })
                        : t(`${CONSENT_NS}.createdOn`, { date: new Date(form.createdAt).toLocaleDateString() })}
                   </p>
                </div>
             </div>
             <div className="flex items-center gap-3">
                {!form.signedAt && (
                  <button 
                    onClick={() => setSelectedFormId(form.id)}
                    className="flex h-12 items-center gap-2 rounded-2xl bg-amber-500 text-white px-6 text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
                  >
                    <PenTool size={18} /> {t(`${CONSENT_NS}.signNow`)}
                  </button>
                )}
                {form.signedAt && (
                   <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500 text-white shadow-lg shadow-teal-500/20">
                      <ShieldCheck size={24} />
                   </div>
                )}
                <button className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-white hover:text-white transition-all">
                   <Eye size={20} />
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
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const initial = useMemo(
    () => ({
      title: t(`${CONSENT_NS}.defaultTitle`),
      content: t(`${CONSENT_NS}.defaultContent`),
    }),
    [t],
  );
  const [data, setData] = useState(initial);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setBusy(true);
    try {
      await createConsentForm({ patientId, ...data });
      toast.success(t(`${CONSENT_NS}.formCreated`));
      onSuccess();
    } catch {
      toast.error(t(`${CONSENT_NS}.formCreateFailed`));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-10 rounded-[3rem] bg-white text-white shadow-2xl mb-12 space-y-8">
       <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-4">
            {t(`${CONSENT_NS}.documentTitle`)}
          </label>
          <input 
            value={data.title}
            onChange={e => setData({...data, title: e.target.value})}
            className="h-16 w-full rounded-2xl bg-white/5 border border-white/10 px-8 text-lg font-black outline-none focus:bg-white/10 focus:ring-2 focus:ring-indigo-500 transition-all"
          />
       </div>
       <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-4">
            {t(`${CONSENT_NS}.legalContent`)}
          </label>
          <textarea 
            value={data.content}
            onChange={e => setData({...data, content: e.target.value})}
            className="w-full h-48 rounded-2xl bg-white/5 border border-white/10 p-8 text-sm font-medium leading-relaxed outline-none focus:bg-white/10 focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
          />
       </div>
       <div className="flex justify-end gap-4">
          <button type="button" onClick={onCancel} className="px-8 h-14 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">{t(`${CONSENT_NS}.dismiss`)}</button>
          <button disabled={busy} type="submit" className="px-12 h-14 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50">
             {busy ? t(`${CONSENT_NS}.generating`) : t(`${CONSENT_NS}.generateDocument`)}
          </button>
       </div>
    </form>
  );
}

function SignatureModal({ formId, onClose, onSuccess }: any) {
  const { t } = useTranslation();
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
    if (lines.length === 0) return toast.error(t(`${CONSENT_NS}.signFirst`));
    
    setBusy(true);
    try {
      const dataUrl = stageRef.current.toDataURL();
      await signConsentForm(formId, dataUrl);
      toast.success(t(`${CONSENT_NS}.signSuccess`));
      onSuccess();
    } catch {
      toast.error(t(`${CONSENT_NS}.signFailed`));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#f5f7f9]/80 backdrop-blur-md">
       <motion.div 
         initial={{ opacity: 0, scale: 0.9 }}
         animate={{ opacity: 1, scale: 1 }}
         className="w-full max-w-2xl bg-white rounded-[3rem] overflow-hidden shadow-2xl"
       >
          <div className="p-10 border-b border-slate-100 flex justify-between items-center">
             <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{t(`${CONSENT_NS}.eSignatureTitle`)}</h3>
                <p className="text-xs font-bold text-slate-400 mt-1">{t(`${CONSENT_NS}.eSignatureHint`)}</p>
             </div>
             <button onClick={onClose} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-rose-500 transition-colors">
                <X size={24} />
             </button>
          </div>

          <div className="p-10 space-y-8">
             <div className="relative aspect-[2/1] w-full rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 cursor-crosshair overflow-hidden">
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
                        stroke="#0f172a"
                        strokeWidth={3}
                        tension={0.5}
                        lineCap="round"
                        globalCompositeOperation="source-over"
                      />
                    ))}
                  </Layer>
                </Stage>
                <button 
                  onClick={clear}
                  className="absolute bottom-6 right-6 px-4 py-2 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-rose-500 shadow-sm border border-slate-100 hover:bg-rose-500 hover:text-white transition-all"
                >
                  {t(`${CONSENT_NS}.clearSignature`)}
                </button>
             </div>

             <div className="flex items-center gap-4 p-6 bg-amber-50 rounded-2xl border border-amber-100">
                <AlertCircle className="text-amber-600 shrink-0" size={20} />
                <p className="text-xs font-bold text-amber-900 leading-relaxed">
                   {t(`${CONSENT_NS}.signLegalNotice`)}
                </p>
             </div>

             <div className="flex gap-4">
                <button 
                  disabled={busy}
                  onClick={onClose}
                  className="flex-1 h-16 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                >
                   {t(`${CONSENT_NS}.cancel`)}
                </button>
                <button 
                  disabled={busy}
                  onClick={handleSign}
                  className="flex-[2] h-16 rounded-2xl bg-teal-500 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-teal-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                   {busy ? t(`${CONSENT_NS}.applyingSignature`) : t(`${CONSENT_NS}.applySignature`)}
                </button>
             </div>
          </div>
       </motion.div>
    </div>
  );
}
