import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { toast } from 'sonner';
import * as apiModule from '../../services/api';
import { updatePatientXrayAnnotations } from '../../services/api';
import BeforeAfterSlider from './BeforeAfterSlider';
import XRayCanvas from '../xray/XRayCanvas';

type ToolMode = 'brush' | 'ruler' | 'angle';

interface Point {
  x: number;
  y: number;
}

type BrushAnnotation = {
  type: 'brush';
  points: Point[];
};

type RulerAnnotation = {
  type: 'ruler';
  start: Point;
  end: Point;
};

type AngleAnnotation = {
  type: 'angle';
  first: Point;
  vertex: Point;
  second: Point;
};

type Annotation = BrushAnnotation | RulerAnnotation | AngleAnnotation;

interface NormalizedXrayFile {
  key: string;
  source: string;
  label: string;
  timestamp: number;
  isImage: boolean;
  raw: Record<string, unknown>;
}

interface CanvasSize {
  width: number;
  height: number;
}

export interface XrayWorkspaceProps {
  patientId?: string | number;
  canWriteDental?: boolean;
  files?: unknown;
  xrayFiles?: unknown;
  className?: string;
  [key: string]: unknown;
}

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.tif', '.tiff', '.avif', '.heic'];

const LIST_FUNCTION_CANDIDATES = [
  'listPatientXrayFiles',
  'getPatientXrayFiles',
  'fetchPatientXrayFiles',
  'listPatientXrays',
  'getPatientXrays',
  'fetchPatientXrays',
  'listXrayFiles',
  'getXrayFiles',
  'fetchXrayFiles',
];

const UPLOAD_FUNCTION_CANDIDATES = [
  'uploadPatientXrayFile',
  'uploadPatientXray',
  'createPatientXray',
  'addPatientXray',
  'uploadXrayFile',
  'uploadXray',
];

const DOWNLOAD_FUNCTION_CANDIDATES = [
  'downloadPatientXrayFile',
  'downloadPatientXray',
  'getPatientXrayDownloadUrl',
  'downloadXrayFile',
  'downloadXray',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function pickString(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
}

function pickNumber(record: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }

      const dateParsed = Date.parse(value);
      if (!Number.isNaN(dateParsed)) {
        return dateParsed;
      }
    }
  }

  return undefined;
}

function getTimestamp(record: Record<string, unknown>): number {
  return (
    pickNumber(record, ['createdAt', 'uploadedAt', 'takenAt', 'date', 'updatedAt', 'timestamp', 'created_at', 'uploaded_at']) ?? 0
  );
}

function getLabel(record: Record<string, unknown>, fallbackIndex: number): string {
  return pickString(record, ['displayName', 'name', 'filename', 'fileName', 'originalName', 'title']) ?? `X-ray ${fallbackIndex + 1}`;
}

function getSource(record: Record<string, unknown>): string | undefined {
  return pickString(record, ['downloadUrl', 'url', 'src', 'previewUrl', 'fileUrl', 'path', 'href', 'location']);
}

function getMimeType(record: Record<string, unknown>): string | undefined {
  return pickString(record, ['mimeType', 'contentType', 'type']);
}

function isImageLike(file: NormalizedXrayFile): boolean {
  if (file.isImage) {
    return true;
  }

  const source = file.source.toLowerCase();
  return IMAGE_EXTENSIONS.some((extension) => source.includes(extension));
}

function normalizeSingleFile(raw: unknown, fallbackIndex: number): NormalizedXrayFile | null {
  if (!isRecord(raw)) {
    return null;
  }

  const source = getSource(raw);
  if (!source) {
    return null;
  }

  const label = getLabel(raw, fallbackIndex);
  const timestamp = getTimestamp(raw);
  const mimeType = getMimeType(raw);
  const isImage = Boolean(mimeType?.startsWith('image/')) || IMAGE_EXTENSIONS.some((extension) => source.toLowerCase().includes(extension));
  const keySeed = pickString(raw, ['id', 'uuid', 'key']) ?? `${source}-${label}-${timestamp || fallbackIndex}`;

  return {
    key: `${keySeed}-${fallbackIndex}`,
    source,
    label,
    timestamp,
    isImage,
    raw,
  };
}

function normalizeFileArray(input: unknown): NormalizedXrayFile[] {
  if (!Array.isArray(input)) {
    const single = normalizeSingleFile(input, 0);
    return single ? [single] : [];
  }

  return input
    .map((item, index) => normalizeSingleFile(item, index))
    .filter((item): item is NormalizedXrayFile => item !== null);
}

function normalizeApiResponse(input: unknown): NormalizedXrayFile[] {
  const direct = normalizeFileArray(input);
  if (direct.length > 0) {
    return direct;
  }

  if (!isRecord(input)) {
    return [];
  }

  for (const key of ['data', 'items', 'files', 'results', 'xrayFiles', 'documents']) {
    const nested = normalizeFileArray(input[key]);
    if (nested.length > 0) {
      return nested;
    }
  }

  return [];
}

function sortFilesByTimestamp(files: NormalizedXrayFile[]): NormalizedXrayFile[] {
  return [...files].sort((left, right) => {
    if (left.timestamp !== right.timestamp) {
      return left.timestamp - right.timestamp;
    }

    return left.label.localeCompare(right.label);
  });
}

function dedupeFiles(files: NormalizedXrayFile[]): NormalizedXrayFile[] {
  const map = new Map<string, NormalizedXrayFile>();

  for (const file of files) {
    map.set(file.key, file);
  }

  return Array.from(map.values());
}

function formatTimestamp(timestamp: number): string {
  if (!timestamp) {
    return 'Unknown date';
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function getPointFromEvent(event: PointerEvent<HTMLCanvasElement>): Point {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0;
  const y = rect.height > 0 ? (event.clientY - rect.top) / rect.height : 0;

  return {
    x: Math.min(1, Math.max(0, x)),
    y: Math.min(1, Math.max(0, y)),
  };
}

function pointToCanvas(point: Point, width: number, height: number): [number, number] {
  return [point.x * width, point.y * height];
}

function distanceBetweenPoints(start: Point, end: Point, width: number, height: number): number {
  const [x1, y1] = pointToCanvas(start, width, height);
  const [x2, y2] = pointToCanvas(end, width, height);
  return Math.hypot(x2 - x1, y2 - y1);
}

function angleBetweenPoints(first: Point, vertex: Point, second: Point, width: number, height: number): number {
  const [x1, y1] = pointToCanvas(first, width, height);
  const [vx, vy] = pointToCanvas(vertex, width, height);
  const [x2, y2] = pointToCanvas(second, width, height);

  const angle1 = Math.atan2(y1 - vy, x1 - vx);
  const angle2 = Math.atan2(y2 - vy, x2 - vx);
  let delta = Math.abs((angle2 - angle1) * (180 / Math.PI));

  if (delta > 180) {
    delta = 360 - delta;
  }

  return delta;
}

function drawLabel(
  ctx: CanvasRenderingContext2D,
  label: string,
  x: number,
  y: number,
  options?: { background?: string; color?: string }
): void {
  const fontSize = 13;
  ctx.save();
  ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui, sans-serif`;
  ctx.textBaseline = 'middle';
  const metrics = ctx.measureText(label);
  const paddingX = 6;
  const paddingY = 4;
  const boxWidth = metrics.width + paddingX * 2;
  const boxHeight = fontSize + paddingY * 2;
  const background = options?.background ?? 'rgba(15, 23, 42, 0.82)';
  const color = options?.color ?? '#ffffff';

  ctx.fillStyle = background;
  ctx.fillRect(x - boxWidth / 2, y - boxHeight / 2, boxWidth, boxHeight);

  ctx.fillStyle = color;
  ctx.fillText(label, x - metrics.width / 2, y + 0.5);
  ctx.restore();
}

function drawAnnotation(
  ctx: CanvasRenderingContext2D,
  annotation: Annotation,
  width: number,
  height: number,
  options?: { preview?: boolean }
): void {
  const preview = options?.preview ?? false;
  const baseColor = preview ? 'rgba(148, 163, 184, 0.85)' : '#38bdf8';
  const rulerColor = preview ? 'rgba(148, 163, 184, 0.9)' : '#22c55e';
  const angleColor = preview ? 'rgba(148, 163, 184, 0.9)' : '#f59e0b';
  const brushWidth = Math.max(2, Math.round(Math.min(width, height) * 0.0035));
  const measurementWidth = Math.max(2, Math.round(Math.min(width, height) * 0.003));

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (annotation.type === 'brush') {
    if (annotation.points.length < 2) {
      const [x, y] = pointToCanvas(annotation.points[0], width, height);
      ctx.fillStyle = baseColor;
      ctx.beginPath();
      ctx.arc(x, y, brushWidth, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    ctx.strokeStyle = baseColor;
    ctx.lineWidth = brushWidth;
    ctx.beginPath();

    annotation.points.forEach((point, index) => {
      const [x, y] = pointToCanvas(point, width, height);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
    ctx.restore();
    return;
  }

  if (annotation.type === 'ruler') {
    const [x1, y1] = pointToCanvas(annotation.start, width, height);
    const [x2, y2] = pointToCanvas(annotation.end, width, height);
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const length = distanceBetweenPoints(annotation.start, annotation.end, width, height);

    ctx.strokeStyle = rulerColor;
    ctx.lineWidth = measurementWidth;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.fillStyle = rulerColor;
    ctx.beginPath();
    ctx.arc(x1, y1, brushWidth * 1.1, 0, Math.PI * 2);
    ctx.arc(x2, y2, brushWidth * 1.1, 0, Math.PI * 2);
    ctx.fill();

    drawLabel(ctx, `${length.toFixed(0)} px`, midX, midY - 18, {
      background: preview ? 'rgba(15, 23, 42, 0.62)' : 'rgba(21, 128, 61, 0.9)',
    });

    ctx.restore();
    return;
  }

  const [firstX, firstY] = pointToCanvas(annotation.first, width, height);
  const [vertexX, vertexY] = pointToCanvas(annotation.vertex, width, height);
  const [secondX, secondY] = pointToCanvas(annotation.second, width, height);
  const angle = angleBetweenPoints(annotation.first, annotation.vertex, annotation.second, width, height);

  ctx.strokeStyle = angleColor;
  ctx.lineWidth = measurementWidth;
  ctx.beginPath();
  ctx.moveTo(firstX, firstY);
  ctx.lineTo(vertexX, vertexY);
  ctx.lineTo(secondX, secondY);
  ctx.stroke();

  ctx.fillStyle = angleColor;
  ctx.beginPath();
  ctx.arc(firstX, firstY, brushWidth * 1.1, 0, Math.PI * 2);
  ctx.arc(vertexX, vertexY, brushWidth * 1.25, 0, Math.PI * 2);
  ctx.arc(secondX, secondY, brushWidth * 1.1, 0, Math.PI * 2);
  ctx.fill();

  drawLabel(ctx, `${angle.toFixed(1)}°`, vertexX + 24, vertexY - 18, {
    background: preview ? 'rgba(15, 23, 42, 0.62)' : 'rgba(217, 119, 6, 0.9)',
  });

  ctx.restore();
}

function drawDraft(
  ctx: CanvasRenderingContext2D,
  toolMode: ToolMode,
  draftPoints: Point[],
  width: number,
  height: number
): void {
  if (draftPoints.length === 0) {
    return;
  }

  if (toolMode === 'brush') {
    drawAnnotation(
      ctx,
      {
        type: 'brush',
        points: draftPoints,
      },
      width,
      height,
      { preview: true }
    );
    return;
  }

  if (toolMode === 'ruler' && draftPoints.length === 1) {
    const [x, y] = pointToCanvas(draftPoints[0], width, height);
    ctx.save();
    ctx.fillStyle = 'rgba(148, 163, 184, 0.85)';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (toolMode === 'ruler' && draftPoints.length >= 2) {
    drawAnnotation(
      ctx,
      {
        type: 'ruler',
        start: draftPoints[0],
        end: draftPoints[1],
      },
      width,
      height,
      { preview: true }
    );
    return;
  }

  if (toolMode === 'angle' && draftPoints.length === 1) {
    const [x, y] = pointToCanvas(draftPoints[0], width, height);
    ctx.save();
    ctx.fillStyle = 'rgba(148, 163, 184, 0.85)';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (toolMode === 'angle' && draftPoints.length === 2) {
    const [firstX, firstY] = pointToCanvas(draftPoints[0], width, height);
    const [vertexX, vertexY] = pointToCanvas(draftPoints[1], width, height);

    ctx.save();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.9)';
    ctx.lineWidth = Math.max(2, Math.round(Math.min(width, height) * 0.003));
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(firstX, firstY);
    ctx.lineTo(vertexX, vertexY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(148, 163, 184, 0.9)';
    ctx.beginPath();
    ctx.arc(firstX, firstY, 4, 0, Math.PI * 2);
    ctx.arc(vertexX, vertexY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (toolMode === 'angle' && draftPoints.length >= 3) {
    drawAnnotation(
      ctx,
      {
        type: 'angle',
        first: draftPoints[0],
        vertex: draftPoints[1],
        second: draftPoints[2],
      },
      width,
      height,
      { preview: true }
    );
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load image: ${src}`));
    image.src = src;
  });
}

function pickApiFunction(
  moduleObject: Record<string, unknown>,
  candidates: string[]
): ((...args: unknown[]) => Promise<unknown>) | undefined {
  const sources: Record<string, unknown>[] = [moduleObject];

  if (isRecord(moduleObject.default)) {
    sources.push(moduleObject.default);
  }

  for (const source of sources) {
    for (const candidate of candidates) {
      const value = source[candidate];
      if (typeof value === 'function') {
        return value as (...args: unknown[]) => Promise<unknown>;
      }
    }
  }

  return undefined;
}

async function invokeWithArguments(
  fn: (...args: unknown[]) => Promise<unknown>,
  argumentSets: unknown[][]
): Promise<unknown> {
  let lastError: unknown = null;

  for (const args of argumentSets) {
    try {
      return await fn(...args);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error('Unable to invoke API function');
}

function createUploadFormData(file: File, patientId?: string | number): FormData {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', file.name);

  if (patientId !== undefined && patientId !== null) {
    formData.append('patientId', String(patientId));
  }

  return formData;
}

async function resolveDownloadedSource(candidate: unknown, fallbackSource: string): Promise<string> {
  if (typeof candidate === 'string' && candidate.trim().length > 0) {
    return candidate;
  }

  if (candidate instanceof Blob) {
    return URL.createObjectURL(candidate);
  }

  if (typeof Response !== 'undefined' && candidate instanceof Response) {
    const blob = await candidate.blob();
    return URL.createObjectURL(blob);
  }

  if (isRecord(candidate)) {
    const nested = pickString(candidate, ['downloadUrl', 'url', 'src', 'href', 'location']);
    if (nested) {
      return nested;
    }

    const dataCandidate = candidate.data;
    if (typeof dataCandidate === 'string' && dataCandidate.trim().length > 0) {
      return dataCandidate;
    }

    if (dataCandidate instanceof Blob) {
      return URL.createObjectURL(dataCandidate);
    }

    const blobCandidate = candidate.blob;
    if (blobCandidate instanceof Blob) {
      return URL.createObjectURL(blobCandidate);
    }
  }

  return fallbackSource;
}

export function XrayWorkspace(props: XrayWorkspaceProps) {
  const patientId = props.patientId;
  const canWriteDental = props.canWriteDental ?? true;
  const className = props.className;

  const externalFiles = useMemo(() => {
    const candidate =
      Array.isArray(props.files) && props.files.length > 0
        ? props.files
        : Array.isArray(props.xrayFiles) && props.xrayFiles.length > 0
          ? props.xrayFiles
          : [];

    return normalizeFileArray(candidate);
  }, [props.files, props.xrayFiles]);

  const [files, setFiles] = useState<NormalizedXrayFile[]>(externalFiles);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(externalFiles[0]?.key ?? null);
  const [toolMode, setToolMode] = useState<ToolMode>('brush');
  const [brightness, setBrightness] = useState<number>(1);
  const [contrast, setContrast] = useState<number>(1);
  const [draftPoints, setDraftPoints] = useState<Point[]>([]);
  const [isDrawingBrush, setIsDrawingBrush] = useState<boolean>(false);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 0, height: 0 });
  const [annotationsByFileId, setAnnotationsByFileId] = useState<Record<string, Annotation[]>>({});

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const currentBrushStrokeRef = useRef<Point[]>([]);

  useEffect(() => {
    if (externalFiles.length > 0) {
      setFiles(externalFiles);
      setSelectedKey((currentKey) => {
        if (currentKey && externalFiles.some((file) => file.key === currentKey)) {
          return currentKey;
        }

        return externalFiles[0].key;
      });
    }
  }, [externalFiles]);

  useEffect(() => {
    if (files.length === 0) {
      setSelectedKey(null);
      return;
    }

    setSelectedKey((currentKey) => {
      if (currentKey && files.some((file) => file.key === currentKey)) {
        return currentKey;
      }

      return files[0].key;
    });
  }, [files]);

  useEffect(() => {
    setDraftPoints([]);
    setIsDrawingBrush(false);
    currentBrushStrokeRef.current = [];
  }, [selectedKey, toolMode]);

  const selectedFile = useMemo(() => {
    if (!selectedKey) {
      return files[0] ?? null;
    }

    return files.find((file) => file.key === selectedKey) ?? files[0] ?? null;
  }, [files, selectedKey]);

  const hasEditableImage = Boolean(selectedFile?.isImage);

  const selectedAnnotations = useMemo<Annotation[]>(() => {
    if (!selectedFile) {
      return [];
    }

    return annotationsByFileId[selectedFile.key] ?? [];
  }, [annotationsByFileId, selectedFile]);

  const imageFiles = useMemo(() => sortFilesByTimestamp(files.filter(isImageLike)), [files]);

  const comparisonFiles = useMemo(() => {
    if (imageFiles.length < 2) {
      return null;
    }

    const oldest = imageFiles[0];
    const newest = imageFiles[imageFiles.length - 1];

    if (oldest.key === newest.key) {
      return null;
    }

    return {
      beforeSrc: oldest.source,
      afterSrc: newest.source,
      beforeLabel: oldest.label,
      afterLabel: newest.label,
    };
  }, [imageFiles]);

  const measureViewer = useCallback(() => {
    const element = viewerRef.current;
    if (!element) {
      return;
    }

    setCanvasSize({
      width: element.clientWidth,
      height: element.clientHeight,
    });
  }, []);

  const refreshFiles = useCallback(async () => {
    if (externalFiles.length > 0) {
      return;
    }

    if (patientId === undefined || patientId === null) {
      return;
    }

    const listFn = pickApiFunction(apiModule as Record<string, unknown>, LIST_FUNCTION_CANDIDATES);
    if (!listFn) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await invokeWithArguments(listFn, [
        [patientId],
        [String(patientId)],
        [{ patientId }],
        [{ patientId: String(patientId) }],
      ]);

      const normalized = normalizeApiResponse(response);
      setFiles(normalized);
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : 'Unable to load x-ray files';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [externalFiles.length, patientId]);

  useEffect(() => {
    void refreshFiles();
  }, [refreshFiles]);

  useEffect(() => {
    measureViewer();

    const element = viewerRef.current;
    if (!element) {
      return;
    }

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measureViewer);
      return () => window.removeEventListener('resize', measureViewer);
    }

    const observer = new ResizeObserver(() => {
      measureViewer();
    });

    observer.observe(element);
    window.addEventListener('resize', measureViewer);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measureViewer);
    };
  }, [measureViewer, selectedFile?.key, selectedFile?.source]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasSize.width <= 0 || canvasSize.height <= 0) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.round(canvasSize.width * pixelRatio);
    canvas.height = Math.round(canvasSize.height * pixelRatio);
    canvas.style.width = `${canvasSize.width}px`;
    canvas.style.height = `${canvasSize.height}px`;

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, canvasSize.width, canvasSize.height);

    for (const annotation of selectedAnnotations) {
      drawAnnotation(context, annotation, canvasSize.width, canvasSize.height);
    }

    drawDraft(context, toolMode, draftPoints, canvasSize.width, canvasSize.height);
  }, [canvasSize.height, canvasSize.width, draftPoints, selectedAnnotations, toolMode]);

  const addAnnotation = useCallback(
    (annotation: Annotation) => {
      if (!selectedFile) {
        return;
      }

      setAnnotationsByFileId((current) => {
        const currentAnnotations = current[selectedFile.key] ?? [];
        return {
          ...current,
          [selectedFile.key]: [...currentAnnotations, annotation],
        };
      });
    },
    [selectedFile]
  );

  const clearAnnotations = useCallback(() => {
    if (!selectedFile) {
      return;
    }

    setAnnotationsByFileId((current) => ({
      ...current,
      [selectedFile.key]: [],
    }));

    setDraftPoints([]);
    setIsDrawingBrush(false);
    currentBrushStrokeRef.current = [];
    toast.success('Annotations cleared');
  }, [selectedFile]);

  const handleCanvasPointerDown = useCallback(
    (event: PointerEvent<HTMLCanvasElement>) => {
      if (!selectedFile || !hasEditableImage || canvasSize.width <= 0 || canvasSize.height <= 0) {
        return;
      }

      event.preventDefault();
      const point = getPointFromEvent(event);

      if (toolMode === 'brush') {
        setIsDrawingBrush(true);
        currentBrushStrokeRef.current = [point];
        setDraftPoints([point]);

        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // Ignore pointer capture failures.
        }

        return;
      }

      if (toolMode === 'ruler') {
        setDraftPoints((current) => {
          if (current.length === 0) {
            return [point];
          }

          if (current.length === 1) {
            addAnnotation({
              type: 'ruler',
              start: current[0],
              end: point,
            });
            return [];
          }

          return [point];
        });

        return;
      }

      setDraftPoints((current) => {
        const next = [...current, point];

        if (next.length === 3) {
          addAnnotation({
            type: 'angle',
            first: next[0],
            vertex: next[1],
            second: next[2],
          });
          return [];
        }

        return next;
      });
    },
    [addAnnotation, canvasSize.height, canvasSize.width, hasEditableImage, selectedFile, toolMode]
  );

  const handleCanvasPointerMove = useCallback(
    (event: PointerEvent<HTMLCanvasElement>) => {
      if (!selectedFile || !hasEditableImage || canvasSize.width <= 0 || canvasSize.height <= 0) {
        return;
      }

      if (toolMode !== 'brush' || !isDrawingBrush) {
        return;
      }

      const point = getPointFromEvent(event);
      const lastPoint = currentBrushStrokeRef.current[currentBrushStrokeRef.current.length - 1];

      if (lastPoint && Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y) < 0.0015) {
        return;
      }

      currentBrushStrokeRef.current = [...currentBrushStrokeRef.current, point];
      setDraftPoints(currentBrushStrokeRef.current);
    },
    [canvasSize.height, canvasSize.width, hasEditableImage, isDrawingBrush, selectedFile, toolMode]
  );

  const finishBrushStroke = useCallback(() => {
    if (!selectedFile || !hasEditableImage || !isDrawingBrush) {
      return;
    }

    const points = currentBrushStrokeRef.current;

    if (points.length > 0) {
      addAnnotation({
        type: 'brush',
        points,
      });
    }

    currentBrushStrokeRef.current = [];
    setDraftPoints([]);
    setIsDrawingBrush(false);
  }, [addAnnotation, hasEditableImage, isDrawingBrush, selectedFile]);

  const handleCanvasPointerUp = useCallback(
    (event: PointerEvent<HTMLCanvasElement>) => {
      try {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      } catch {
        // Ignore pointer capture failures.
      }

      finishBrushStroke();
    },
    [finishBrushStroke]
  );

  const handleSelectFile = useCallback((key: string) => {
    setSelectedKey(key);
  }, []);

  const handleUploadClick = useCallback(() => {
    imageInputRef.current?.click();
  }, []);

  const handleUploadChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(event.target.files ?? []);
      if (selectedFiles.length === 0) {
        return;
      }

      const uploadFn = pickApiFunction(apiModule as Record<string, unknown>, UPLOAD_FUNCTION_CANDIDATES);
      if (!uploadFn) {
        toast.error('Upload is not available in this workspace');
        event.target.value = '';
        return;
      }

      setIsUploading(true);

      try {
        for (const file of selectedFiles) {
          const formData = createUploadFormData(file, patientId);

          const response = await invokeWithArguments(uploadFn, [
            [patientId, file],
            [file, patientId],
            [patientId, formData],
            [formData, patientId],
            [formData],
            [{ patientId, file }],
          ]);

          const uploadedFiles = normalizeApiResponse(response);
          if (uploadedFiles.length > 0) {
            setFiles((current) => dedupeFiles([...current, ...uploadedFiles]));
          }
        }

        if (externalFiles.length === 0) {
          await refreshFiles();
        }

        toast.success('X-ray image uploaded');
      } catch (uploadError) {
        const message = uploadError instanceof Error ? uploadError.message : 'Unable to upload x-ray image';
        toast.error(message);
      } finally {
        setIsUploading(false);
        event.target.value = '';
      }
    },
    [externalFiles.length, patientId, refreshFiles]
  );

  const handleDownloadFile = useCallback(
    async (file: NormalizedXrayFile) => {
      const downloadFn = pickApiFunction(apiModule as Record<string, unknown>, DOWNLOAD_FUNCTION_CANDIDATES);

      if (downloadFn) {
        try {
          const response = await invokeWithArguments(downloadFn, [
            [file.raw],
            [file.source],
            [file.key],
            [patientId, file.key],
            [patientId, file.raw],
          ]);

          const resolvedSource = await resolveDownloadedSource(response, file.source);
          const anchor = document.createElement('a');
          anchor.href = resolvedSource;
          anchor.download = file.label;
          anchor.rel = 'noreferrer';
          document.body.appendChild(anchor);
          anchor.click();
          anchor.remove();

          if (resolvedSource.startsWith('blob:')) {
            window.setTimeout(() => URL.revokeObjectURL(resolvedSource), 1000);
          }

          return;
        } catch {
          // Fall back to the source below.
        }
      }

      const anchor = document.createElement('a');
      anchor.href = file.source;
      anchor.download = file.label;
      anchor.rel = 'noreferrer';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    },
    [patientId]
  );

  const exportAnnotations = useCallback(async () => {
    if (!selectedFile || !hasEditableImage) {
      toast.error('Select an image to export');
      return;
    }

    try {
      const image = await loadImage(selectedFile.source);
      const exportWidth = image.naturalWidth || canvasSize.width || 1200;
      const exportHeight = image.naturalHeight || canvasSize.height || 900;

      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = exportWidth;
      offscreenCanvas.height = exportHeight;

      const context = offscreenCanvas.getContext('2d');
      if (!context) {
        throw new Error('Canvas context unavailable');
      }

      context.filter = `brightness(${brightness}) contrast(${contrast})`;
      context.drawImage(image, 0, 0, exportWidth, exportHeight);
      context.filter = 'none';

      for (const annotation of selectedAnnotations) {
        drawAnnotation(context, annotation, exportWidth, exportHeight);
      }

      const blob = await new Promise<Blob>((resolve, reject) => {
        offscreenCanvas.toBlob((result) => {
          if (result) {
            resolve(result);
            return;
          }

          reject(new Error('Unable to export canvas'));
        }, 'image/png');
      });

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${selectedFile.label.replace(/\.[^.]+$/, '') || 'xray-annotation'}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success('Annotated image exported');
    } catch (exportError) {
      const message = exportError instanceof Error ? exportError.message : 'Unable to export annotated image';
      toast.error(message);
    }
  }, [brightness, canvasSize.height, canvasSize.width, hasEditableImage, selectedAnnotations, selectedFile, contrast]);

  const currentAnnotationsCount = selectedAnnotations.length + (draftPoints.length > 0 ? 1 : 0);

  return (
    <section className={['space-y-5', className ?? ''].filter(Boolean).join(' ')}>
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">X-ray workspace</h3>
            <p className="text-sm text-slate-500">
              Annotate the selected image with brush, ruler, or angle tools.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={!canWriteDental || isUploading}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isUploading ? 'Uploading…' : 'Upload images'}
            </button>

            <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUploadChange} />
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : null}

        {comparisonFiles ? (
          <BeforeAfterSlider
            beforeSrc={comparisonFiles.beforeSrc}
            afterSrc={comparisonFiles.afterSrc}
            beforeLabel={comparisonFiles.beforeLabel}
            afterLabel={comparisonFiles.afterLabel}
          />
        ) : null}
      </div>

      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Files</h4>
              <p className="text-xs text-slate-500">
                {files.length} item{files.length === 1 ? '' : 's'}
              </p>
            </div>

            {isLoading ? <span className="text-xs font-medium text-slate-500">Loading…</span> : null}
          </div>

          <div className="space-y-2">
            {files.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">No x-ray files available yet.</div>
            ) : (
              files.map((file) => {
                const selected = file.key === selectedKey;

                return (
                  <div
                    key={file.key}
                    className={[
                      'flex items-center gap-3 rounded-xl border px-3 py-2 transition',
                      selected ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white hover:border-slate-300',
                    ].join(' ')}
                  >
                    <button type="button" onClick={() => handleSelectFile(file.key)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                        {file.isImage ? (
                          <img src={file.source} alt={file.label} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            File
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-slate-900">{file.label}</div>
                        <div className="text-xs text-slate-500">{formatTimestamp(file.timestamp)}</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDownloadFile(file)}
                      className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      Download
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-slate-900">Annotation tools</h4>
                <p className="text-xs text-slate-500">
                  {selectedFile ? selectedFile.label : 'Select a file to start annotating'}
                  {currentAnnotationsCount > 0 ? ` • ${currentAnnotationsCount} mark${currentAnnotationsCount === 1 ? '' : 's'} on canvas` : ''}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {(['brush', 'ruler', 'angle'] as ToolMode[]).map((mode) => {
                  const active = toolMode === mode;

                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setToolMode(mode)}
                      disabled={!hasEditableImage}
                      className={[
                        'rounded-xl border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed',
                        active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                      ].join(' ')}
                    >
                      {mode === 'brush' ? 'Brush' : mode === 'ruler' ? 'Ruler' : 'Angle'}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={clearAnnotations}
                  disabled={!hasEditableImage || currentAnnotationsCount === 0}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={() => void exportAnnotations()}
                  disabled={!hasEditableImage}
                  className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
                >
                  Export PNG
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span className="flex items-center justify-between">
                  <span>Brightness</span>
                  <span className="text-xs font-normal text-slate-500">{Math.round(brightness * 100)}%</span>
                </span>
                <input
                  type="range"
                  min={0.5}
                  max={1.8}
                  step={0.05}
                  value={brightness}
                  onChange={(event) => setBrightness(Number(event.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-slate-900"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span className="flex items-center justify-between">
                  <span>Contrast</span>
                  <span className="text-xs font-normal text-slate-500">{Math.round(contrast * 100)}%</span>
                </span>
                <input
                  type="range"
                  min={0.5}
                  max={1.8}
                  step={0.05}
                  value={contrast}
                  onChange={(event) => setContrast(Number(event.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-slate-900"
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div ref={viewerRef} className="relative overflow-hidden rounded-2xl bg-slate-100">
              {selectedFile ? (
                hasEditableImage ? (
                  <XRayCanvas
                    imageUrl={selectedFile.source}
                    width={canvasSize.width}
                    height={canvasSize.height || 600}
                    onSave={async (anns) => {
                      if (patientId) {
                        try {
                          await updatePatientXrayAnnotations(String(patientId), selectedFile.key.split('-').pop() || selectedFile.key, anns);
                          toast.success('Annotations saved to database');
                        } catch (err) {
                          toast.error('Failed to save annotations to database');
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="flex min-h-[360px] items-center justify-center px-6 py-16 text-center text-sm text-slate-500">
                    This file is not an image preview.
                  </div>
                )
              ) : (
                <div className="flex min-h-[360px] items-center justify-center px-6 py-16 text-center text-sm text-slate-400">
                  Choose an image file to view and annotate.
                </div>
              )}
            </div>

            {selectedFile ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
                <span>{selectedFile.label}</span>
                <span>{formatTimestamp(selectedFile.timestamp)}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}