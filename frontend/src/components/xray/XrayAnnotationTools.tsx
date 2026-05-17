import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Pencil, Ruler, Zap, RotateCcw, Save } from 'lucide-react';

export interface ImageAdjustments {
  brightness: number;
  contrast: number;
  invert: number;
}

export interface XrayAnnotationToolsProps {
  imageElement: HTMLImageElement | null;
  onAnnotationsChange?: (annotations: Annotation[]) => void;
  initialAnnotations?: Annotation[];
  initialAdjustments?: ImageAdjustments;
  onSave?: (payload: { annotations: Annotation[]; adjustments: ImageAdjustments }) => void;
  saving?: boolean;
  className?: string;
}

export interface Point {
  x: number;
  y: number;
}

export type BrushAnnotation = {
  type: 'brush';
  points: Point[];
  color: string;
  width: number;
};

export type RulerAnnotation = {
  type: 'ruler';
  start: Point;
  end: Point;
  length: number; // in pixels
};

export type AngleAnnotation = {
  type: 'angle';
  vertex: Point;
  point1: Point;
  point2: Point;
  degrees: number;
};

export type Annotation = BrushAnnotation | RulerAnnotation | AngleAnnotation;

export default function XrayAnnotationTools({
  imageElement,
  onAnnotationsChange,
  initialAnnotations = [],
  initialAdjustments,
  onSave,
  saving = false,
  className = '',
}: XrayAnnotationToolsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<'brush' | 'ruler' | 'angle' | 'view'>('view');
  const [brushColor, setBrushColor] = useState('#ff0000');
  const [brushWidth, setBrushWidth] = useState(2);
  const [annotations, setAnnotations] = useState<Annotation[]>(initialAnnotations);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [rulerStart, setRulerStart] = useState<Point | null>(null);
  const [anglePoints, setAnglePoints] = useState<Point[]>([]);
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(
    initialAdjustments ?? { brightness: 100, contrast: 100, invert: 0 },
  );

  const redrawCanvas = useCallback(() => {
    if (!canvasRef.current || !imageElement) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Draw image with adjustments
    ctx.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) invert(${adjustments.invert}%)`;
    ctx.drawImage(imageElement, 0, 0);
    ctx.filter = 'none';

    // Draw all annotations
    annotations.forEach((ann) => {
      if (ann.type === 'brush') {
        ctx.strokeStyle = ann.color;
        ctx.lineWidth = ann.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ann.points.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
      } else if (ann.type === 'ruler') {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(ann.start.x, ann.start.y);
        ctx.lineTo(ann.end.x, ann.end.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw length label
        const midX = (ann.start.x + ann.end.x) / 2;
        const midY = (ann.start.y + ann.end.y) / 2;
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`${Math.round(ann.length)}px`, midX + 5, midY - 5);
      } else if (ann.type === 'angle') {
        // Draw angle lines
        ctx.strokeStyle = '#0099ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ann.vertex.x, ann.vertex.y);
        ctx.lineTo(ann.point1.x, ann.point1.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(ann.vertex.x, ann.vertex.y);
        ctx.lineTo(ann.point2.x, ann.point2.y);
        ctx.stroke();

        // Draw angle arc
        const dx1 = ann.point1.x - ann.vertex.x;
        const dy1 = ann.point1.y - ann.vertex.y;
        const angle1 = Math.atan2(dy1, dx1);

        const dx2 = ann.point2.x - ann.vertex.x;
        const dy2 = ann.point2.y - ann.vertex.y;
        const angle2 = Math.atan2(dy2, dx2);

        const radius = 20;
        ctx.strokeStyle = '#0099ff';
        ctx.beginPath();
        ctx.arc(ann.vertex.x, ann.vertex.y, radius, angle1, angle2);
        ctx.stroke();

        // Draw angle label
        ctx.fillStyle = '#0099ff';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`${Math.round(ann.degrees)}°`, ann.vertex.x + 25, ann.vertex.y - 5);
      }
    });
  }, [imageElement, annotations, adjustments]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const point: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    if (mode === 'brush') {
      setIsDrawing(true);
      setCurrentPoints([point]);
    } else if (mode === 'ruler') {
      if (!rulerStart) {
        setRulerStart(point);
      } else {
        const distance = Math.hypot(point.x - rulerStart.x, point.y - rulerStart.y);
        const newAnnotation: RulerAnnotation = {
          type: 'ruler',
          start: rulerStart,
          end: point,
          length: distance,
        };
        const newAnnotations = [...annotations, newAnnotation];
        setAnnotations(newAnnotations);
        onAnnotationsChange?.(newAnnotations);
        setRulerStart(null);
      }
    } else if (mode === 'angle') {
      if (anglePoints.length < 3) {
        setAnglePoints([...anglePoints, point]);
      } else {
        // Calculate angle
        const vertex = anglePoints[0];
        const p1 = anglePoints[1];
        const p2 = point;

        const dx1 = p1.x - vertex.x;
        const dy1 = p1.y - vertex.y;
        const angle1 = Math.atan2(dy1, dx1);

        const dx2 = p2.x - vertex.x;
        const dy2 = p2.y - vertex.y;
        const angle2 = Math.atan2(dy2, dx2);

        let degrees = Math.abs((angle2 - angle1) * (180 / Math.PI));
        if (degrees > 180) degrees = 360 - degrees;

        const newAnnotation: AngleAnnotation = {
          type: 'angle',
          vertex,
          point1: p1,
          point2: p2,
          degrees,
        };
        const newAnnotations = [...annotations, newAnnotation];
        setAnnotations(newAnnotations);
        onAnnotationsChange?.(newAnnotations);
        setAnglePoints([]);
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const point: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    if (mode === 'brush' && isDrawing) {
      setCurrentPoints([...currentPoints, point]);
    }
  };

  const handleCanvasMouseUp = () => {
    if (mode === 'brush' && isDrawing && currentPoints.length > 0) {
      const newAnnotation: BrushAnnotation = {
        type: 'brush',
        points: currentPoints,
        color: brushColor,
        width: brushWidth,
      };
      const newAnnotations = [...annotations, newAnnotation];
      setAnnotations(newAnnotations);
      onAnnotationsChange?.(newAnnotations);
      setCurrentPoints([]);
    }
    setIsDrawing(false);
  };

  const handleUndo = () => {
    if (annotations.length > 0) {
      const newAnnotations = annotations.slice(0, -1);
      setAnnotations(newAnnotations);
      onAnnotationsChange?.(newAnnotations);
    }
  };

  const handleClear = () => {
    setAnnotations([]);
    onAnnotationsChange?.([]);
    setRulerStart(null);
    setAnglePoints([]);
  };

  // Redraw when image, annotations or adjustments change
  React.useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  return (
    <div className={`space-y-3 rounded-lg bg-white p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">X-Ray Annotation & Analysis</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={annotations.length === 0}
            className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-50"
          >
            Undo
          </button>
          {onSave ? (
            <button
              type="button"
              disabled={saving || !imageElement}
              onClick={() => onSave({ annotations, adjustments })}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50"
            >
              <Save size={12} />
              {saving ? 'Saving…' : 'Save'}
            </button>
          ) : null}
        </div>
      </div>

      {/* Tool buttons */}
      <div className="flex flex-wrap gap-2 border-b pb-3">
        <button
          onClick={() => setMode('view')}
          className={`px-3 py-2 rounded text-sm font-medium ${
            mode === 'view' ? 'bg-blue-500 text-white' : 'bg-slate-100 hover:bg-slate-200'
          }`}
        >
          View
        </button>
        <button
          onClick={() => setMode('brush')}
          className={`px-3 py-2 rounded text-sm font-medium flex items-center gap-1 ${
            mode === 'brush' ? 'bg-blue-500 text-white' : 'bg-slate-100 hover:bg-slate-200'
          }`}
        >
          <Pencil size={16} /> Brush
        </button>
        <button
          onClick={() => setMode('ruler')}
          className={`px-3 py-2 rounded text-sm font-medium flex items-center gap-1 ${
            mode === 'ruler' ? 'bg-blue-500 text-white' : 'bg-slate-100 hover:bg-slate-200'
          }`}
        >
          <Ruler size={16} /> Measure
        </button>
        <button
          onClick={() => setMode('angle')}
          className={`px-3 py-2 rounded text-sm font-medium flex items-center gap-1 ${
            mode === 'angle' ? 'bg-blue-500 text-white' : 'bg-slate-100 hover:bg-slate-200'
          }`}
        >
          <Zap size={16} /> Angle
        </button>
        <button
          onClick={handleClear}
          className="px-3 py-2 rounded text-sm font-medium flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700"
        >
          <RotateCcw size={16} /> Clear
        </button>
      </div>

      {/* Brush options */}
      {mode === 'brush' && (
        <div className="flex items-center gap-3 p-2 bg-slate-50 rounded">
          <label className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-700">Color:</span>
            <input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              className="w-8 h-8 cursor-pointer"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-700">Width:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={brushWidth}
              onChange={(e) => setBrushWidth(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-xs text-slate-500">{brushWidth}px</span>
          </label>
        </div>
      )}

      {/* Ruler helper */}
      {mode === 'ruler' && rulerStart && (
        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
          Click start point: ({Math.round(rulerStart.x)}, {Math.round(rulerStart.y)}) — Now click end point
        </div>
      )}

      {/* Angle helper */}
      {mode === 'angle' && anglePoints.length > 0 && (
        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
          Angle measurement: {anglePoints.length}/3 points selected. {anglePoints.length === 3 ? '✓ Complete' : 'Click to add point'}
        </div>
      )}

      {/* Image adjustments */}
      <div className="space-y-2 border-t pt-3">
        <div className="text-xs font-medium text-slate-700">Image Adjustments</div>
        
        <div className="flex items-center gap-3">
          <label className="flex-1 flex items-center gap-2">
            <span className="text-xs w-20">Brightness:</span>
            <input
              type="range"
              min="0"
              max="200"
              value={adjustments.brightness}
              onChange={(e) => setAdjustments({ ...adjustments, brightness: Number(e.target.value) })}
              className="flex-1"
            />
            <span className="text-xs w-12 text-right">{adjustments.brightness}%</span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex-1 flex items-center gap-2">
            <span className="text-xs w-20">Contrast:</span>
            <input
              type="range"
              min="0"
              max="200"
              value={adjustments.contrast}
              onChange={(e) => setAdjustments({ ...adjustments, contrast: Number(e.target.value) })}
              className="flex-1"
            />
            <span className="text-xs w-12 text-right">{adjustments.contrast}%</span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex-1 flex items-center gap-2">
            <span className="text-xs w-20">Invert:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={adjustments.invert}
              onChange={(e) => setAdjustments({ ...adjustments, invert: Number(e.target.value) })}
              className="flex-1"
            />
            <span className="text-xs w-12 text-right">{adjustments.invert}%</span>
          </label>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={imageElement?.width || 400}
        height={imageElement?.height || 300}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        className="w-full border border-slate-300 rounded bg-black cursor-crosshair"
      />

      {/* Annotation count */}
      <div className="text-xs text-slate-500">
        {annotations.length} annotation{annotations.length !== 1 ? 's' : ''} ·{' '}
        {annotations.filter((a) => a.type === 'brush').length} brush ·{' '}
        {annotations.filter((a) => a.type === 'ruler').length} ruler ·{' '}
        {annotations.filter((a) => a.type === 'angle').length} angle
      </div>
    </div>
  );
}
