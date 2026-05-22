import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BrainCircuit, ShieldCheck, Search, Upload, Pencil } from "lucide-react";
import { XrayAnnotatePanel } from "./XrayAnnotatePanel";
import { toast } from "sonner";

import { XIcon } from "../../components/layout/icons";
import { analyzeXray, type AiVisionResponse } from "../../services/aiVision";
import {
  fetchPatientFileBlob,
  isXrayFile,
  listPatientFiles,
  uploadXrayFile,
  type PatientFileDto,
} from "../../services/patientFiles";

const NS = "pages.patientDetail.xray";

interface MediaItem {
  id: string;
  url: string;
  thumbnail: string;
  type: "XRAY" | "PHOTO";
  date: string;
}

function toMediaItem(file: PatientFileDto, url: string): MediaItem {
  return {
    id: file.id,
    url,
    thumbnail: url,
    type: file.annotations?.category === "XRAY" ? "XRAY" : "PHOTO",
    date: new Date(file.createdAt).toLocaleDateString(),
  };
}

export function XrayWorkspace({ patientId }: { patientId: string }): JSX.Element {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const thumbUrls = useRef<Map<string, string>>(new Map());
  const [files, setFiles] = useState<PatientFileDto[]>([]);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [selectedFile, setSelectedFile] = useState<PatientFileDto | null>(null);
  const [annotateTarget, setAnnotateTarget] = useState<{ file: PatientFileDto; url: string } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AiVisionResponse | null>(null);

  const resolveUrl = useCallback(
    async (file: PatientFileDto): Promise<string> => {
      const cached = thumbUrls.current.get(file.id);
      if (cached) return cached;
      if (file.publicUrl) {
        thumbUrls.current.set(file.id, file.publicUrl);
        return file.publicUrl;
      }
      const blob = await fetchPatientFileBlob(patientId, file.id);
      const url = URL.createObjectURL(blob);
      thumbUrls.current.set(file.id, url);
      return url;
    },
    [patientId],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await listPatientFiles(patientId);
      const xrayFiles = all.filter(isXrayFile);
      setFiles(xrayFiles);
      const media: MediaItem[] = [];
      for (const f of xrayFiles) {
        if (!f.mimeType.startsWith("image/")) continue;
        try {
          const url = await resolveUrl(f);
          media.push(toMediaItem(f, url));
        } catch {
          /* skip thumb */
        }
      }
      setItems(media);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t(`${NS}.loadFailed`));
    } finally {
      setLoading(false);
    }
  }, [patientId, resolveUrl, t]);

  useEffect(() => {
    void load();
    return () => {
      thumbUrls.current.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
      thumbUrls.current.clear();
    };
  }, [load]);

  const handleAiAnalyze = async () => {
    if (!selected) return;
    setIsAnalyzing(true);
    setAiResult(null);
    try {
      const result = await analyzeXray(selected.id);
      setAiResult(result);
    } catch (error) {
      console.error("AI Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const row = await uploadXrayFile(patientId, file);
      setFiles((prev) => [row, ...prev]);
      if (file.type.startsWith("image/")) {
        const url = await resolveUrl(row);
        setItems((prev) => [toMediaItem(row, url), ...prev]);
      }
      toast.success(t(`${NS}.uploaded`));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t(`${NS}.uploadFailed`));
    } finally {
      setUploading(false);
    }
  }

  async function openItem(item: MediaItem): Promise<void> {
    setSelected(item);
    const f = files.find((x) => x.id === item.id);
    setSelectedFile(f || null);
    setZoom(1);
    setRotation(0);
    setAiResult(null);
  }

  return (
    <motion.div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{t(`${NS}.title`)}</h3>
          <p className="text-sm text-slate-500">{t(`${NS}.subtitle`)}</p>
        </div>
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-all disabled:opacity-50"
        >
          <Upload size={14} />
          {uploading ? t(`${NS}.uploading`) : t(`${NS}.upload`)}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => void onPickFile(e)}
        />
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">{t(`${NS}.loading`)}</p>
      ) : items.length === 0 && files.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">
          {t(`${NS}.empty`)}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <motion.div
              key={item.id}
              layoutId={`media-${item.id}`}
              onClick={() => void openItem(item)}
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl bg-slate-100"
            >
              <img
                src={item.thumbnail}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <motion.div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                <span>{item.date}</span>
                <span className="rounded-full bg-white/20 px-2 py-0.5 backdrop-blur-md">{item.type}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && files.some((f) => !f.mimeType.startsWith("image/")) && items.length < files.length ? (
        <p className="text-xs text-slate-500">{t(`${NS}.previewNotSupported`)}</p>
      ) : null}

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#f5f7f9]/95 backdrop-blur-xl p-4 md:p-10"
          >
            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setSelectedFile(null);
              }}
              className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
            >
              <XIcon size={24} />
            </button>

            <div className="flex h-full w-full flex-col items-center justify-center gap-6">
              <motion.div
                layoutId={`media-${selected.id}`}
                className="relative max-h-[70vh] max-w-full overflow-hidden rounded-2xl shadow-2xl"
              >
                <motion.img
                  src={selected.url}
                  alt=""
                  animate={{ scale: zoom, rotate: rotation }}
                  className="h-full w-full object-contain"
                />
              </motion.div>

              <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-4xl justify-center">
                <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => setZoom((v) => Math.min(v + 0.2, 3))}
                    className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition-colors"
                  >
                    {t(`${NS}.zoomIn`)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom((v) => Math.max(v - 0.2, 0.5))}
                    className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition-colors"
                  >
                    {t(`${NS}.zoomOut`)}
                  </button>
                  <div className="h-4 w-px bg-white/20" />
                  <button
                    type="button"
                    onClick={() => setRotation((v) => v + 90)}
                    className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition-colors"
                  >
                    {t(`${NS}.rotate`)}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => void handleAiAnalyze()}
                  disabled={isAnalyzing || selected.type !== "XRAY"}
                  className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${ isAnalyzing ? "bg-indigo-600/50 text-white cursor-wait" : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-500/20" }`}
                >
                  <Sparkles size={18} className={isAnalyzing ? "animate-pulse" : ""} />
                  {isAnalyzing ? t(`${NS}.aiAnalyzing`) : t(`${NS}.aiAnalyze`)}
                </button>

                {selectedFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setAnnotateTarget({ file: selectedFile, url: selected.url });
                      setSelected(null);
                      setSelectedFile(null);
                    }}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-teal-500/20"
                  >
                    <Pencil size={18} />
                    {t(`${NS}.annotate`)}
                  </button>
                )}
              </div>

              <AnimatePresence>
                {(isAnalyzing || aiResult) && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="absolute right-10 top-24 w-80 bg-white/10 backdrop-blur-2xl rounded-[2rem] border border-white/10 p-6 text-white shadow-2xl"
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <BrainCircuit className="text-indigo-400" size={20} />
                      <h4 className="text-sm font-black uppercase tracking-widest">{t(`${NS}.aiInsightTitle`)}</h4>
                    </div>

                    {isAnalyzing ? (
                      <div className="space-y-4 py-10 flex flex-col items-center justify-center">
                        <div className="relative">
                          <motion.div className="h-16 w-16 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                          <Search className="absolute inset-0 m-auto text-indigo-400 animate-pulse" size={20} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
                          {t(`${NS}.aiScanning`)}
                        </p>
                      </div>
                    ) : (
                      aiResult && (
                        <div className="space-y-6">
                          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs leading-relaxed text-slate-300 italic">
                            &ldquo;{aiResult.summary}&rdquo;
                          </div>

                          <div className="space-y-3">
                            {aiResult.findings.map((f, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-3 rounded-xl bg-white/5 border-l-2 border-l-indigo-500 border-white/5"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] font-black uppercase tracking-tighter text-indigo-400">
                                    {f.label}
                                  </span>
                                  <span className="text-[8px] font-bold bg-white/10 px-1.5 py-0.5 rounded-md">
                                    {(f.confidence * 100).toFixed(0)}%
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-tight">{f.description}</p>
                              </motion.div>
                            ))}
                          </div>

                          <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-[8px] font-black uppercase text-slate-500">
                            <ShieldCheck size={12} />
                            {t(`${NS}.aiVerifyRequired`)}
                          </div>
                        </div>
                      )
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {annotateTarget ? (
        <XrayAnnotatePanel
          patientId={patientId}
          file={annotateTarget.file}
          imageUrl={annotateTarget.url}
          onClose={() => setAnnotateTarget(null)}
          onSaved={(updated) => {
            setFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
            setAnnotateTarget(null);
          }}
        />
      ) : null}
    </motion.div>
  );
}
