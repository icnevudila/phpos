import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from 'lucide-react';

export interface EnhancedBeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  title?: string;
  date?: string;
  notes?: string;
  onExport?: () => void;
  className?: string;
}

export default function EnhancedBeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Before',
  afterLabel = 'After',
  title = 'Treatment Progress',
  date,
  notes,
  onExport,
  className = '',
}: EnhancedBeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDrawing, setIsDrawing] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleMouseDown = () => {
    setIsDrawing(true);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.min(100, Math.max(0, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = Math.min(100, Math.max(0, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const zoomScale = zoom / 100;

  return (
    <div className={`space-y-3 rounded-lg bg-white p-4 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {date && <p className="text-xs text-slate-500 mt-1">{date}</p>}
        </div>
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-500 text-white hover:bg-blue-600"
          >
            <Download size={14} />
            Export
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            className="p-1 hover:bg-slate-200 rounded"
            title="Zoom out"
          >
            <ZoomOut size={16} />
          </button>
          <input
            type="range"
            min="50"
            max="200"
            step="10"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-24"
          />
          <button
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            className="p-1 hover:bg-slate-200 rounded"
            title="Zoom in"
          >
            <ZoomIn size={16} />
          </button>
          <span className="text-xs text-slate-600">{zoom}%</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={(e) => setIsDarkMode(e.target.checked)}
              className="rounded"
            />
            <span>Dark mode</span>
          </label>
        </div>
      </div>

      {/* Image Slider Container */}
      <div
        ref={containerRef}
        className={`relative w-full overflow-hidden rounded-lg border-2 border-slate-200 ${
          isDarkMode ? 'bg-slate-900' : 'bg-slate-100'
        }`}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onTouchMove={handleTouchMove}
        onTouchStart={() => setIsDrawing(true)}
        onTouchEnd={() => setIsDrawing(false)}
        style={{
          aspectRatio: '4/3',
          cursor: isDrawing ? 'grabbing' : 'grab',
        }}
      >
        {/* Before image */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={beforeImage}
            alt={beforeLabel}
            className="w-full h-full object-cover"
            style={{
              transform: `scale(${zoomScale})`,
              transformOrigin: 'center',
            }}
          />
        </div>

        {/* After image (slider part) */}
        <div
          className="absolute top-0 left-0 h-full overflow-hidden"
          style={{
            width: `${sliderPosition}%`,
          }}
        >
          <img
            src={afterImage}
            alt={afterLabel}
            className="w-full h-full object-cover"
            style={{
              width: `${100 / (sliderPosition / 100)}%`,
              transform: `scale(${zoomScale})`,
              transformOrigin: 'left center',
            }}
          />
        </div>

        {/* Divider line */}
        <div
          className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-transparent via-white to-transparent pointer-events-none"
          style={{
            left: `${sliderPosition}%`,
            transform: 'translateX(-50%)',
          }}
        />

        {/* Slider handle */}
        <div
          className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-blue-500 pointer-events-auto z-10"
          style={{
            left: `${sliderPosition}%`,
            cursor: isDrawing ? 'grabbing' : 'grab',
          }}
        >
          <ChevronLeft size={18} className="text-blue-500" />
          <ChevronRight size={18} className="text-blue-500" />
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 rounded text-xs text-white font-semibold">
          {beforeLabel}
        </div>
        <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 rounded text-xs text-white font-semibold">
          {afterLabel}
        </div>

        {/* Progress indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 rounded text-xs text-white">
          {Math.round(sliderPosition)}% {afterLabel}
        </div>
      </div>

      {/* Quick jump buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setSliderPosition(0)}
          className="flex-1 px-3 py-1.5 text-xs font-medium rounded bg-slate-100 hover:bg-slate-200 text-slate-900"
        >
          100% {beforeLabel}
        </button>
        <button
          onClick={() => setSliderPosition(50)}
          className="flex-1 px-3 py-1.5 text-xs font-medium rounded bg-slate-100 hover:bg-slate-200 text-slate-900"
        >
          50/50
        </button>
        <button
          onClick={() => setSliderPosition(100)}
          className="flex-1 px-3 py-1.5 text-xs font-medium rounded bg-slate-100 hover:bg-slate-200 text-slate-900"
        >
          100% {afterLabel}
        </button>
      </div>

      {/* Notes section */}
      {notes && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
          <p className="text-xs font-medium text-blue-900 mb-1">Clinical Notes:</p>
          <p className="text-xs text-blue-800">{notes}</p>
        </div>
      )}

      {/* Info footer */}
      <div className="text-[11px] text-slate-500 text-center pt-2 border-t">
        Drag slider or click to compare. Use zoom controls for detailed view.
      </div>
    </div>
  );
}
