import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, RefreshCw, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { ListEmptyState } from "../ListEmptyState";
import {
  fetchPatientFileBlob,
  isIntraoralPhoto,
  listPatientFiles,
  uploadIntraoralPhoto,
  type PatientFileDto,
} from "../../services/patientFiles";

const NS = "pages.patientDetail.intraoral";

export function IntraoralPhotosTab({ patientId }: { patientId: string }): JSX.Element {
  const { t } = useTranslation();
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
      toast.error(e instanceof Error ? e.message : t(`${NS}.loadFailed`));
    } finally {
      setLoading(false);
    }
  }, [patientId, t]);

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
      toast.error(t(`${NS}.previewFailed`));
    }
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(t(`${NS}.imagesOnly`));
      return;
    }
    setUploading(true);
    try {
      const row = await uploadIntraoralPhoto(patientId, file);
      setFiles((prev) => [row, ...prev]);
      toast.success(t(`${NS}.uploaded`));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t(`${NS}.uploadFailed`));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Camera className="mt-1 text-rose-500" size={22} />
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">{t(`${NS}.title`)}</h3>
            <p className="text-sm text-slate-500">{t(`${NS}.subtitle`)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 dark:border-slate-700"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {t(`${NS}.refresh`)}
          </button>
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-black uppercase text-white disabled:opacity-50"
          >
            <Upload size={14} />
            {uploading ? t(`${NS}.uploading`) : t(`${NS}.upload`)}
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
        <p className="text-sm text-slate-500">{t(`${NS}.loading`)}</p>
      ) : files.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50">
          <ListEmptyState
            icon="box"
            title={t(`${NS}.empty`)}
            description={t(`${NS}.emptyHint`)}
            primary={{
              kind: "button",
              onClick: () => inputRef.current?.click(),
              label: t(`${NS}.upload`),
            }}
          />
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
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 p-6"
            onClick={() => {
              setSelected(null);
              setPreviewUrl(null);
            }}
          >
            <button
              type="button"
              className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white"
              onClick={() => {
                setSelected(null);
                setPreviewUrl(null);
              }}
            >
              <X size={24} />
            </button>
            <img
              src={previewUrl}
              alt={selected.fileName}
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="absolute bottom-8 text-xs font-bold uppercase tracking-widest text-white/70">
              {new Date(selected.createdAt).toLocaleString()}
            </p>
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- revoke on files change
  }, [files, patientId]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {files.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onOpen(f)}
          className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800"
        >
          {urls[f.id] ? (
            <img src={urls[f.id]} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] font-bold text-slate-400">…</div>
          )}
        </button>
      ))}
    </div>
  );
}
