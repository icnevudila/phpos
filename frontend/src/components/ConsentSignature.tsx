import { useRef, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Eraser, Check, Pen } from 'lucide-react';

interface ConsentSignatureProps {
  /** Called with the signature data URL when user confirms */
  onSign: (dataUrl: string) => void;
  /** Optional: width of the canvas */
  width?: number;
  /** Optional: height of the canvas */
  height?: number;
  /** If true, shows in a disabled/read-only state with existing signature */
  existingSignature?: string | null;
  /** Patient name displayed above the signature line */
  patientName?: string;
}

export default function ConsentSignature({
  onSign,
  width = 400,
  height = 200,
  existingSignature,
  patientName,
}: ConsentSignatureProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const getCtx = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    return ctx;
  }, []);

  // Initialize canvas
  useEffect(() => {
    const ctx = getCtx();
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw signature line
    ctx.beginPath();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.moveTo(20, height - 40);
    ctx.lineTo(width - 20, height - 40);
    ctx.stroke();

    // Reset drawing style
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
  }, [getCtx, width, height]);

  const getPos = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      if (!touch) return null;
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (existingSignature) return;
    const ctx = getCtx();
    const pos = getPos(e);
    if (!ctx || !pos) return;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!isDrawing || existingSignature) return;
    const ctx = getCtx();
    const pos = getPos(e);
    if (!ctx || !pos) return;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const ctx = getCtx();
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    // Redraw signature line
    ctx.beginPath();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.moveTo(20, height - 40);
    ctx.lineTo(width - 20, height - 40);
    ctx.stroke();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    setHasDrawn(false);
  };

  const confirmSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSign(dataUrl);
  };

  if (existingSignature) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
        <p className="mb-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
          ✓ {t('consent.signed', 'Signature recorded')}
        </p>
        <img
          src={existingSignature}
          alt="Patient signature"
          className="mx-auto max-h-32 rounded border border-emerald-200 dark:border-emerald-700"
        />
        {patientName && (
          <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
            {patientName}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <Pen className="h-4 w-4" />
        <span>{t('consent.drawSignature', 'Draw your signature below')}</span>
      </div>

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full cursor-crosshair touch-none rounded border border-slate-300 dark:border-slate-600"
        style={{ maxWidth: `${width}px` }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />

      {patientName && (
        <p className="mt-1 text-center text-xs text-slate-400 dark:text-slate-500">
          {patientName}
        </p>
      )}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={clearCanvas}
          className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
        >
          <Eraser className="h-3.5 w-3.5" />
          {t('consent.clear', 'Clear')}
        </button>
        <button
          type="button"
          onClick={confirmSignature}
          disabled={!hasDrawn}
          className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-700 dark:hover:bg-emerald-600"
        >
          <Check className="h-3.5 w-3.5" />
          {t('consent.confirm', 'Confirm Signature')}
        </button>
      </div>
    </div>
  );
}
