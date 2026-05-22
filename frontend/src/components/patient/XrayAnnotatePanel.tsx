import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import XrayAnnotationTools, {
  type Annotation,
  type ImageAdjustments,
} from "../xray/XrayAnnotationTools";
import {
  saveXrayDrawings,
  type PatientFileDto,
  type XrayDrawingsPayload,
} from "../../services/patientFiles";

const NS = "pages.patientDetail.xray";

export function XrayAnnotatePanel({
  patientId,
  file,
  imageUrl,
  onClose,
  onSaved,
}: {
  patientId: string;
  file: PatientFileDto;
  imageUrl: string;
  onClose: () => void;
  onSaved: (file: PatientFileDto) => void;
}): JSX.Element {
  const { t } = useTranslation();
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgReady, setImgReady] = useState(false);
  const [saving, setSaving] = useState(false);

  const drawings = file.annotations?.xrayDrawings;
  const initialAnnotations = (drawings?.annotations ?? []) as Annotation[];
  const initialAdjustments = drawings?.adjustments as ImageAdjustments | undefined;

  async function handleSave(payload: XrayDrawingsPayload): Promise<void> {
    setSaving(true);
    try {
      const updated = await saveXrayDrawings(patientId, file, payload);
      onSaved(updated);
      toast.success(t(`${NS}.annotationsSaved`));
    } catch {
      toast.error(t(`${NS}.annotationsSaveFailed`));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-[#f5f7f9]/98 p-4 md:p-8 overflow-y-auto">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-white">{t(`${NS}.annotateTitle`)}</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20"
        >
          {t(`${NS}.annotateClose`)}
        </button>
      </div>
      <img ref={imgRef} src={imageUrl} alt="" className="hidden" onLoad={() => setImgReady(true)} />
      {imgReady && imgRef.current ? (
        <XrayAnnotationTools
          key={file.id}
          imageElement={imgRef.current}
          initialAnnotations={initialAnnotations}
          initialAdjustments={initialAdjustments}
          onSave={(p) => void handleSave(p)}
          saving={saving}
          className="max-w-5xl mx-auto w-full"
        />
      ) : (
        <p className="text-center text-sm text-slate-400">{t(`${NS}.loading`)}</p>
      )}
    </div>
  );
}
