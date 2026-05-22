import { useState, useRef, useCallback, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Line, Circle, Text, Arrow } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import Konva from 'konva';

export type XRayTool = 'pan' | 'ruler' | 'angle' | 'pen' | 'circle' | 'text' | 'arrow' | 'point';

export interface XRayAnnotation {
  id: string;
  type: XRayTool;
  points: number[];
  color: string;
  text?: string;
  visible: boolean;
}

export interface XRayCanvasProps {
  imageUrl?: string;
  width?: number;
  height?: number;
  className?: string;
  onSave?: (annotations: XRayAnnotation[]) => Promise<void> | void;
}

const TOOLS: { id: XRayTool; label: string; icon: string }[] = [
  { id: 'pan', label: 'Pan', icon: '✋' },
  { id: 'ruler', label: 'Ruler', icon: '📏' },
  { id: 'angle', label: 'Angle', icon: '📐' },
  { id: 'pen', label: 'Pen', icon: '✏️' },
  { id: 'circle', label: 'Circle', icon: '⭕' },
  { id: 'text', label: 'Text', icon: '📝' },
  { id: 'arrow', label: 'Arrow', icon: '➡️' },
  { id: 'point', label: 'Point', icon: '📍' },
];

const COLORS = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6', '#000000'];

const PRESETS = [
  { label: 'Default', brightness: 100, contrast: 100 },
  { label: 'Bone', brightness: 90, contrast: 130 },
  { label: 'Soft Tissue', brightness: 110, contrast: 90 },
];

const LOCAL_STORAGE_KEY = 'xray_canvas_config';

export default function XRayCanvas({ imageUrl, width = 800, height = 600, className = '', onSave }: XRayCanvasProps): JSX.Element {
  const [tool, setTool] = useState<XRayTool>('pan');
  const [color, setColor] = useState('#ef4444');
  
  // History & Annotations
  const [history, setHistory] = useState<XRayAnnotation[][]>([[]]);
  const [historyStep, setHistoryStep] = useState(0);
  const [annotations, setAnnotations] = useState<XRayAnnotation[]>([]);
  
  const [drawing, setDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<number[]>([]);
  
  // Canvas State (Load from local storage if available)
  const [scale, setScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [invert, setInvert] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  
  const stageRef = useRef<any>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const konvaImageRef = useRef<any>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Initial load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.brightness !== undefined) setBrightness(parsed.brightness);
        if (parsed.contrast !== undefined) setContrast(parsed.contrast);
        if (parsed.invert !== undefined) setInvert(parsed.invert);
        if (parsed.scale !== undefined) setScale(parsed.scale);
        if (parsed.stagePos !== undefined) setStagePos(parsed.stagePos);
      }
    } catch (e) {
      console.error('Failed to load XRay config from local storage', e);
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    try {
      const config = { brightness, contrast, invert, scale, stagePos };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save XRay config to local storage', e);
    }
  }, [brightness, contrast, invert, scale, stagePos]);

  const updateAnnotations = useCallback((newAnns: XRayAnnotation[]) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newAnns);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
    setAnnotations(newAnns);
  }, [history, historyStep]);

  const handleUndo = () => {
    if (historyStep > 0) {
      const prevStep = historyStep - 1;
      setHistoryStep(prevStep);
      setAnnotations(history[prevStep]);
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      const nextStep = historyStep + 1;
      setHistoryStep(nextStep);
      setAnnotations(history[nextStep]);
    }
  };

  const loadImage = useCallback((url: string) => {
    const img = new Image();
    img.src = url;
    img.onload = () => { 
      imageRef.current = img; 
      setImageLoaded(true);
    };
  }, []);

  if (imageUrl && !imageRef.current) loadImage(imageUrl);

  useEffect(() => {
    if (imageLoaded && konvaImageRef.current) {
      konvaImageRef.current.cache();
    }
  }, [imageLoaded, brightness, contrast, invert, width, height]);

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const scaleBy = 1.1;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const boundedScale = Math.max(0.5, Math.min(newScale, 5));

    setScale(boundedScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * boundedScale,
      y: pointer.y - mousePointTo.y * boundedScale,
    });
  };

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    if (tool === 'pan') return;
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getRelativePointerPosition();
    if (!pos) return;
    setDrawing(true);
    setCurrentPoints([pos.x, pos.y]);
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!drawing || tool === 'pan') return;
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getRelativePointerPosition();
    if (!pos) return;
    if (tool === 'ruler' || tool === 'pen' || tool === 'arrow') {
      setCurrentPoints((prev) => [...prev.slice(0, 2), pos.x, pos.y]);
    } else if (tool === 'angle') {
      if (currentPoints.length < 4) {
        setCurrentPoints((prev) => [...prev.slice(0, 2), pos.x, pos.y]);
      } else {
        setCurrentPoints((prev) => [...prev.slice(0, 4), pos.x, pos.y]);
      }
    } else if (tool === 'circle') {
      const [x0, y0] = currentPoints;
      const r = Math.sqrt((pos.x - x0) ** 2 + (pos.y - y0) ** 2);
      setCurrentPoints([x0, y0, r]);
    }
  };

  const handleMouseUp = () => {
    if (!drawing) return;
    setDrawing(false);
    if (currentPoints.length < 2) { setCurrentPoints([]); return; }
    const id = `ann-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const ann: XRayAnnotation = {
      id, type: tool, points: [...currentPoints], color, visible: true,
      text: tool === 'text' ? prompt('Enter label text:') || 'Label' : undefined,
    };
    updateAnnotations([...annotations, ann]);
    setCurrentPoints([]);
  };

  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    if (tool !== 'point' && tool !== 'text') return;
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getRelativePointerPosition();
    if (!pos) return;
    const id = `ann-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const ann: XRayAnnotation = {
      id, type: tool, points: [pos.x, pos.y], color, visible: true,
      text: tool === 'text' ? prompt('Enter label text:') || 'Label' : undefined,
    };
    updateAnnotations([...annotations, ann]);
  };

  const deleteAnnotation = (id: string) => {
    updateAnnotations(annotations.filter((a) => a.id !== id));
  };

  const toggleLayer = (id: string) => {
    updateAnnotations(annotations.map((a) => a.id === id ? { ...a, visible: !a.visible } : a));
  };

  const clearAll = () => { 
    if (confirm('Clear all annotations?')) updateAnnotations([]); 
  };

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave(annotations);
    } catch (e) {
      console.error('Error saving annotations', e);
      alert('Failed to save annotations.');
    } finally {
      setIsSaving(false);
    }
  };

  const exportImage = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const dataUrl = stage.toDataURL({ pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `xray-annotated-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  const resetView = () => {
    setScale(1);
    setStagePos({ x: 0, y: 0 });
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setBrightness(preset.brightness);
    setContrast(preset.contrast);
  };

  const filters = [Konva.Filters.Brighten, Konva.Filters.Contrast];
  if (invert) {
    filters.push(Konva.Filters.Invert);
  }

  const renderAnnotation = (ann: XRayAnnotation) => {
    if (!ann.visible) return null;
    const key = ann.id;
    switch (ann.type) {
      case 'ruler':
      case 'pen':
        return <Line key={key} points={ann.points} stroke={ann.color} strokeWidth={2 / scale} lineCap="round" lineJoin="round" />;
      case 'arrow':
        return <Arrow key={key} points={ann.points} stroke={ann.color} fill={ann.color} strokeWidth={2 / scale} pointerLength={10 / scale} pointerWidth={10 / scale} />;
      case 'angle': {
        const [x1, y1, x2, y2, x3, y3] = ann.points;
        if (x3 == null) return <Line key={key} points={[x1, y1, x2, y2]} stroke={ann.color} strokeWidth={2 / scale} />;
        return (
          <Layer key={key}>
            <Line points={[x1, y1, x2, y2]} stroke={ann.color} strokeWidth={2 / scale} />
            <Line points={[x2, y2, x3, y3]} stroke={ann.color} strokeWidth={2 / scale} />
            <Circle x={x2} y={y2} radius={4 / scale} fill={ann.color} />
          </Layer>
        );
      }
      case 'circle': {
        const [cx, cy, r] = ann.points;
        return <Circle key={key} x={cx} y={cy} radius={r} stroke={ann.color} strokeWidth={2 / scale} fill="transparent" />;
      }
      case 'point':
        return <Circle key={key} x={ann.points[0]} y={ann.points[1]} radius={6 / scale} fill={ann.color} stroke="white" strokeWidth={2 / scale} />;
      case 'text':
        return <Text key={key} x={ann.points[0]} y={ann.points[1]} text={ann.text || 'Label'} fontSize={14 / scale} fill={ann.color} fontStyle="bold" />;
      default: return null;
    }
  };

  const renderCurrent = () => {
    if (!drawing || currentPoints.length < 2) return null;
    switch (tool) {
      case 'ruler':
      case 'pen':
        return <Line points={currentPoints} stroke={color} strokeWidth={2 / scale} dash={[4 / scale, 4 / scale]} lineCap="round" />;
      case 'arrow':
        return <Arrow points={currentPoints} stroke={color} fill={color} strokeWidth={2 / scale} pointerLength={10 / scale} pointerWidth={10 / scale} dash={[4 / scale, 4 / scale]} />;
      case 'angle': {
        const [x1, y1, x2, y2, x3, y3] = currentPoints;
        if (x3 == null) return <Line points={[x1, y1, x2, y2]} stroke={color} strokeWidth={2 / scale} dash={[4 / scale, 4 / scale]} />;
        return (
          <Layer>
            <Line points={[x1, y1, x2, y2]} stroke={color} strokeWidth={2 / scale} dash={[4 / scale, 4 / scale]} />
            <Line points={[x2, y2, x3, y3]} stroke={color} strokeWidth={2 / scale} dash={[4 / scale, 4 / scale]} />
          </Layer>
        );
      }
      case 'circle': {
        const [cx, cy, r] = currentPoints;
        return <Circle x={cx} y={cy} radius={r} stroke={color} strokeWidth={2 / scale} fill="transparent" dash={[4 / scale, 4 / scale]} />;
      }
      default: return null;
    }
  };

  return (
    <div className={`space-y-3 ${className}`.trim()}>
      <div className="flex flex-wrap items-center gap-2">
        {TOOLS.map((t) => (
          <button key={t.id} onClick={() => setTool(t.id)} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${tool === t.id ? 'bg-white text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'}`}>
            {t.icon} {t.label}
          </button>
        ))}
        <div className="h-6 w-px bg-slate-200 mx-1" />
        {COLORS.map((c) => (
          <button key={c} onClick={() => setColor(c)} className={`w-6 h-6 rounded-full border-2 transition ${color === c ? 'border-slate-900 scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
        ))}
        <div className="h-6 w-px bg-slate-200 mx-1" />
        
        <button 
          onClick={handleUndo} 
          disabled={historyStep === 0}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border ${historyStep === 0 ? 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'}`}
        >
          ↩ Undo
        </button>
        <button 
          onClick={handleRedo} 
          disabled={historyStep === history.length - 1}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border ${historyStep === history.length - 1 ? 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'}`}
        >
          ↪ Redo
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1" />
        <button onClick={clearAll} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white text-red-600 border border-red-200 hover:border-red-300">Clear</button>
        <button onClick={exportImage} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:border-slate-300">Export</button>
        {onSave && (
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-teal-600 text-white border border-teal-600 hover:bg-teal-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save DB'}
          </button>
        )}
      </div>

      <div className="flex gap-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-100 overflow-hidden shadow-sm relative" style={{ width, height }}>
          <Stage
            ref={stageRef}
            width={width}
            height={height}
            scaleX={scale}
            scaleY={scale}
            x={stagePos.x}
            y={stagePos.y}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClick={handleStageClick}
            draggable={tool === 'pan'}
            onDragEnd={(e) => {
              if (tool === 'pan') {
                setStagePos({ x: e.target.x(), y: e.target.y() });
              }
            }}
          >
            <Layer>
              {imageRef.current && (
                <KonvaImage
                  ref={konvaImageRef}
                  image={imageRef.current}
                  width={width}
                  height={height}
                  filters={filters}
                  brightness={(brightness - 100) / 100}
                  contrast={contrast - 100}
                />
              )}
              {!imageUrl && (
                <Text x={width / 2 - 80} y={height / 2} text="No X-Ray image loaded" fontSize={16} fill="#94a3b8" />
              )}
            </Layer>
            <Layer>{annotations.map(renderAnnotation)}</Layer>
            <Layer>{renderCurrent()}</Layer>
          </Stage>
          
          {/* Viewport Reset Overlay */}
          {(scale !== 1 || stagePos.x !== 0 || stagePos.y !== 0) && (
            <button 
              onClick={resetView}
              className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-slate-200 shadow-sm px-3 py-1.5 rounded-full text-xs font-medium text-slate-700 hover:bg-white transition"
            >
              Reset View
            </button>
          )}
        </div>

        <div className="w-52 space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <h4 className="text-xs font-semibold text-slate-900 mb-2">Window Leveling</h4>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {PRESETS.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset)}
                  className="px-2 py-1 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 w-16">Brightness</span>
                <input type="range" min={50} max={150} value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="flex-1 h-1 accent-teal-600" />
                <span className="text-[10px] text-slate-500 w-8 text-right">{brightness}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 w-16">Contrast</span>
                <input type="range" min={50} max={150} value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="flex-1 h-1 accent-teal-600" />
                <span className="text-[10px] text-slate-500 w-8 text-right">{contrast}</span>
              </div>
              
              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={invert} 
                  onChange={(e) => setInvert(e.target.checked)} 
                  className="rounded text-teal-600 focus:ring-teal-500" 
                />
                <span className="text-[10px] font-medium text-slate-700">Invert Image</span>
              </label>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 mt-2">
                <span className="text-[10px] text-slate-500 w-16">Zoom</span>
                <input 
                  type="range" 
                  min={50} 
                  max={500} 
                  value={scale * 100} 
                  onChange={(e) => {
                    const newScale = Number(e.target.value) / 100;
                    setScale(newScale);
                    setStagePos({
                      x: width / 2 - (width / 2) * newScale,
                      y: height / 2 - (height / 2) * newScale,
                    });
                  }} 
                  className="flex-1 h-1 accent-teal-600" 
                />
                <span className="text-[10px] text-slate-500 w-8 text-right">{Math.round(scale * 100)}%</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <h4 className="text-xs font-semibold text-slate-900 mb-2">Layers ({annotations.length})</h4>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {annotations.length === 0 && <p className="text-[10px] text-slate-400">No annotations</p>}
              {annotations.map((ann) => (
                <div key={ann.id} className="flex items-center gap-1.5 p-1 hover:bg-slate-50 rounded">
                  <button onClick={() => toggleLayer(ann.id)} className={`w-3.5 h-3.5 rounded border ${ann.visible ? 'bg-teal-500 border-teal-500' : 'bg-white border-slate-300'}`} />
                  <span className="text-[10px] text-slate-600 flex-1 truncate">{ann.type} {ann.text || ''}</span>
                  <button onClick={() => deleteAnnotation(ann.id)} className="text-[10px] text-red-400 hover:text-red-600 px-1">×</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}