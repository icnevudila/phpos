import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, RefreshCw, Upload, X } from "lucide-react";
import { toast } from "sonner";

import {
  fetchPatientFileBlob,
  isIntraoralPhoto,
  listPatientFiles,
  uploadIntraoralPhoto,
  type PatientFileDto,
} from "../../services/patientFiles";

export function IntraoralPhotosTab({ patientId }: { patientId: string }): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<PatientFileDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selected, setSelected] = useState<PatientFileDto | null>(null);
  const thumbUrls = useRef<Map<string, string>>(new Map());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await listPatientFiles(patientId);
      setFiles(all.filter(isIntraoralPhoto));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load photos.");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    void load();
    return () => {
      thumbUrls.current.forEach((url) => URL.revokeObjectURL(url));
      thumbUrls.current.clear();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [load, previewUrl]);

  async function thumbFor(file: PatientFileDto): Promise<string> {
    const cached = thumbUrls.current.get(file.id);
    if (cached) return cached;
    if (file.publicUrl) return file.publicUrl;
    const blob = await fetchPatientFileBlob(patientId, file.id);
    const url = URL.createObjectURL(blob);
    thumbUrls.current.set(file.id, url);
    return url;
  }

  async function openPreview(file: PatientFileDto): Promise<void> {
    try {
      const url = await thumbFor(file);
      setPreviewUrl(url);
      setSelected(file);
    } catch {
      toast.error("Failed to load full resolution photo.");
    }
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      return;
    }
    setUploading(true);
    try {
      const row = await uploadIntraoralPhoto(patientId, file);
      setFiles((prev) => [row, ...prev]);
      toast.success("Photo uploaded successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload photo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Camera className="text-brand-primary" size={16} />
          <div>
            <h3 className="text-sm font-bold text-brand-text uppercase tracking-widest">Intraoral Imagery</h3>
            <p className="text-xs text-brand-muted">Clinical photographs and visual records.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="btn-secondary h-8 px-2 text-[10px] gap-1.5"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="btn-primary h-8 px-3 text-[10px] gap-1.5 disabled:opacity-50"
          >
            <Upload size={12} />
            {uploading ? "Uploading..." : "Upload Photo"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void onPickFile(e)}
          />
        </div>
      </div>

      {loading ? (
        <div className="card p-8 flex flex-col items-center justify-center text-center bg-brand-surface border border-brand-border">
          <RefreshCw className="animate-spin text-brand-muted mb-2" size={20} />
          <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Loading imagery...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="card p-8 flex flex-col items-center justify-center text-center bg-brand-surface-soft border border-brand-border">
          <Camera className="text-brand-muted mb-2" size={24} />
          <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-4">No photos recorded</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="btn-secondary h-8 px-4 text-xs"
          >
            Upload First Photo
          </button>
        </div>
      ) : (
        <PhotoGrid files={files} patientId={patientId} onOpen={(f) => void openPreview(f)} />
      )}

      <AnimatePresence>
        {selected && previewUrl ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-6 backdrop-blur-sm"
            onClick={() => {
              setSelected(null);
              setPreviewUrl(null);
            }}
          >
            <button
              type="button"
              className="absolute right-6 top-6 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-rose-500 transition-colors"
              onClick={() => {
                setSelected(null);
                setPreviewUrl(null);
              }}
            >
              <X size={20} />
            </button>
            <img
              src={previewUrl}
              alt={selected.fileName}
              className="max-h-[85vh] max-w-full rounded-[var(--radius-md)] object-contain shadow-2xl ring-1 ring-white/10"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-6 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
               <Camera size={14} className="text-white/70" />
               <p className="text-xs font-bold uppercase tracking-widest text-white/90">
                 {new Date(selected.createdAt).toLocaleString()}
               </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function PhotoGrid({
  files,
  patientId,
  onOpen,
}: {
  files: PatientFileDto[];
  patientId: string;
  onOpen: (f: PatientFileDto) => void;
}): JSX.Element {
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let alive = true;
    void (async () => {
      const next: Record<string, string> = {};
      for (const f of files) {
        try {
          if (f.publicUrl) {
            next[f.id] = f.publicUrl;
            continue;
          }
          const blob = await fetchPatientFileBlob(patientId, f.id);
          if (!alive) return;
          next[f.id] = URL.createObjectURL(blob);
        } catch {
          /* skip thumb */
        }
      }
      if (alive) setUrls(next);
    })();
    return () => {
      alive = false;
      Object.values(urls).forEach((u) => {
        if (u.startsWith("blob:")) URL.revokeObjectURL(u);
      });
    };
  }, [files, patientId]);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {files.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onOpen(f)}
          className="group relative aspect-square overflow-hidden rounded-[var(--radius-md)] bg-brand-surface border border-brand-border"
        >
          {urls[f.id] ? (
            <img src={urls[f.id]} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
          ) : (
            <div className="flex h-full items-center justify-center">
               <RefreshCw className="animate-spin text-brand-muted" size={16} />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
             <p className="text-[9px] font-black uppercase tracking-widest text-white text-left">
               {new Date(f.createdAt).toLocaleDateString()}
             </p>
          </div>
        </button>
      ))}
    </div>
  );
}
