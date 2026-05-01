import { memo, useId } from "react";

import type { Tooth, ToothSurface } from "../../types/dentalChart";
import { CONDITION_META } from "./conditions";
import { isUpper, surfaceSides, toothKind, type ToothKind } from "./toothGeometry";

export interface ToothSvgProps {
  tooth: Tooth;
  size?: number;
  readOnly?: boolean;
  onClickTooth?: () => void;
  onClickSurface?: (surface: ToothSurface) => void;
  highlightSurface?: ToothSurface | null;
}

/**
 * Anatomik diş: kron (crown) + kök (root).
 * Üst çene: kök yukarıda, kron aşağıda (ağız ortasına bakıyor).
 * Alt çene: kök aşağıda, kron yukarıda.
 *
 * Diş tipine göre farklı kron şekli ve kök sayısı:
 *   Molar → geniş kron + 2-3 kök
 *   Premolar → orta kron + 1-2 kök
 *   Canine → sivri kron + uzun tek kök
 *   Incisor → düz incizal kenarlı kron + tek kök
 *
 * Görsel durum haritası:
 *   HEALTHY    → ivory gradient
 *   DECAY      → ivory + kahverengi çürük lekeleri
 *   FILLED     → ivory + seçilen yüzeylerde gri amalgam dolgu
 *   CROWN      → altın gradient kron (kök normal ivory)
 *   ROOT_CANAL → ivory kron + pembe-mor kök (endodontik tedavi)
 *   EXTRACTED  → soluk gri + kırmızı X
 *   MISSING    → kesik çizgili boş silüet
 */
function ToothSvgImpl({
  tooth,
  size = 60,
  readOnly,
  onClickTooth,
  onClickSurface,
  highlightSurface,
}: ToothSvgProps): JSX.Element {
  const meta = CONDITION_META[tooth.condition];
  const kind = toothKind(tooth.toothNumber);
  const upper = isUpper(tooth.toothNumber);
  const sides = surfaceSides(tooth.toothNumber);
  const selectedSurfaces = new Set<ToothSurface>(tooth.surfaces ?? []);
  const gid = useId().replace(/:/g, "");

  // viewBox: dikey diş — 64 genişlik, 100 yükseklik (crown ~42, root ~58)
  const VB_W = 64;
  const VB_H = 100;
  const w = size;
  const h = Math.round(size * (VB_H / VB_W));

  const hoverClass = readOnly ? "" : "cursor-pointer transition-all hover:brightness-[1.04]";

  const isMissing = tooth.condition === "MISSING" || tooth.condition === "EXTRACTED";

  /**
   * Renk paleti — SmileHub-stili gerçekçi gradientlar.
   * Taç: soluk-beyaz silindir efekti (horizontal gradient)
   * Kök: bej/krem (dentin)
   * FILLED: mavi silindir taç, CROWN: altın, ROOT_CANAL: mor kök
   */
  const crownGrad =
    tooth.condition === "CROWN"
      ? `url(#grad-gold-${gid})`
      : tooth.condition === "FILLED"
        ? `url(#grad-blue-${gid})`
        : `url(#grad-crown-${gid})`;
  const rootGrad =
    tooth.condition === "ROOT_CANAL"
      ? `url(#grad-rootcanal-${gid})`
      : `url(#grad-root-${gid})`;

  const baseStroke =
    tooth.condition === "FILLED"
      ? "#1e3a8a"
      : tooth.condition === "CROWN"
        ? "#a16207"
        : tooth.condition === "HEALTHY"
          ? "rgba(0,0,0,0.2)"
          : meta.stroke ?? "#475569";

  // Wrapper transform: alt dişler için tersine çevir (flip Y)
  const flipTransform = upper ? "" : `translate(0, ${VB_H}) scale(1, -1)`;

  // Path tanımları (crown + root) - üst çene tarafında, kök yukarıda olacak
  // crown: y ekseninde [42, 100] (gingiva hizası ~42)
  // root: y ekseninde [0, 42]
  const crownPaths = crownPathFor(kind);
  const rootPaths = rootPathsFor(kind, upper ? "upper" : "lower");

  const gingivalY = 42;

  function handleSurface(e: React.MouseEvent, key: ToothSurface): void {
    if (readOnly) return;
    if (onClickSurface) {
      e.stopPropagation();
      onClickSurface(key);
    }
  }

  // Yüzey tıklama alanları (crown üstünde). 5 bölge: top / bottom / left / right / center
  // Crown viewBox içinde kullanırız: x in [4..60], y in [42..100]
  const cx = VB_W / 2;
  const cTop = gingivalY; // 42
  const cBot = VB_H - 6; // 94 — incizal/oklüzal kenar
  const cLeft = 6;
  const cRight = VB_W - 6;
  const pad = 10;

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={w}
      height={h}
      role="img"
      aria-label={`Tooth ${tooth.toothNumber}`}
      className={hoverClass}
      onClick={() => {
        if (!readOnly && onClickTooth) onClickTooth();
      }}
    >
      <defs>
        {/* Taç (enamel) — horizontal silindir efekti, beyaz */}
        <linearGradient id={`grad-crown-${gid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="25%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        {/* Kök (dentin) — horizontal bej silindir */}
        <linearGradient id={`grad-root-${gid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#cfc7af" />
          <stop offset="40%" stopColor="#f5f1e1" />
          <stop offset="100%" stopColor="#b8af8e" />
        </linearGradient>
        {/* Altın kaplama (CROWN) — horizontal */}
        <linearGradient id={`grad-gold-${gid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ca8a04" />
          <stop offset="30%" stopColor="#fde68a" />
          <stop offset="70%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#a16207" />
        </linearGradient>
        {/* Mavi dolgu taç (FILLED) — horizontal silindir */}
        <linearGradient id={`grad-blue-${gid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="30%" stopColor="#93c5fd" />
          <stop offset="70%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        {/* Kanal tedavisi kök — mor */}
        <linearGradient id={`grad-rootcanal-${gid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="50%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
        {/* Drop shadow (3D derinlik) */}
        <filter id={`shadow-${gid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0.6" dy="1.2" stdDeviation="0.9" floodOpacity="0.15" />
        </filter>
        {/* Yüzey dolgu overlay — FILLED'ta koyu mavi, aksi halde amalgam grisi */}
        <linearGradient id={`grad-filling-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>

      <g
        transform={flipTransform}
        opacity={isMissing ? 0.35 : 1}
        filter={isMissing ? undefined : `url(#shadow-${gid})`}
      >
        {/* Kök (root) */}
        {rootPaths.map((d, i) => (
          <path
            key={`root-${i}`}
            d={d}
            fill={rootGrad}
            stroke="rgba(0,0,0,0.15)"
            strokeWidth={0.6}
            strokeLinejoin="round"
            strokeDasharray={tooth.condition === "MISSING" ? "3 2" : undefined}
          />
        ))}

        {/* Kron (crown) */}
        <path
          d={crownPaths.outline}
          fill={crownGrad}
          stroke={baseStroke}
          strokeWidth={tooth.condition === "FILLED" || tooth.condition === "CROWN" ? 1 : 0.6}
          strokeLinejoin="round"
          strokeDasharray={tooth.condition === "MISSING" ? "3 2" : undefined}
        />

        {/* Cusp/incisal detay çizgileri — molarlarda oklüzal oluk vb. */}
        {crownPaths.detail.map((d, i) => (
          <path
            key={`detail-${i}`}
            d={d}
            fill="none"
            stroke={tooth.condition === "FILLED" ? "#1e3a8a" : "rgba(0,0,0,0.15)"}
            strokeWidth={0.7}
            strokeLinecap="round"
            opacity={tooth.condition === "CROWN" ? 0.35 : 0.7}
          />
        ))}

        {/* Dikey beyaz parlama çizgisi (silindir 3D hissi) */}
        {!isMissing ? (
          <path
            d={crownPaths.highlight}
            fill="none"
            stroke={tooth.condition === "FILLED" ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.8)"}
            strokeWidth={1.4}
            strokeLinecap="round"
            pointerEvents="none"
          />
        ) : null}

        {/* Çürük lekeleri */}
        {tooth.condition === "DECAY" ? (
          <>
            <circle cx={cx - 8} cy={cBot - 16} r={3.5} fill="#78350f" opacity={0.85} />
            <circle cx={cx + 6} cy={cBot - 10} r={2.5} fill="#78350f" opacity={0.75} />
            <circle cx={cx + 2} cy={cBot - 22} r={2} fill="#451a03" opacity={0.7} />
          </>
        ) : null}

        {/* FILLED: seçili yüzeylere gri amalgam dolgu */}
        {tooth.condition === "FILLED" ? (
          <g pointerEvents="none">
            {selectedSurfaces.has("OCCLUSAL") ? (
              <rect
                x={cx - 10}
                y={cBot - 26}
                width={20}
                height={14}
                rx={2}
                fill={`url(#grad-filling-${gid})`}
              />
            ) : null}
            {selectedSurfaces.has(sides.left) ? (
              <rect x={cLeft + 1} y={cBot - 30} width={8} height={22} rx={2} fill={`url(#grad-filling-${gid})`} />
            ) : null}
            {selectedSurfaces.has(sides.right) ? (
              <rect x={cRight - 9} y={cBot - 30} width={8} height={22} rx={2} fill={`url(#grad-filling-${gid})`} />
            ) : null}
            {selectedSurfaces.has(sides.top) ? (
              <rect x={cx - 12} y={cTop + 2} width={24} height={6} rx={2} fill={`url(#grad-filling-${gid})`} />
            ) : null}
            {selectedSurfaces.has(sides.bottom) ? (
              <rect x={cx - 12} y={cBot - 8} width={24} height={6} rx={2} fill={`url(#grad-filling-${gid})`} />
            ) : null}
          </g>
        ) : null}

        {/* EXTRACTED: kırmızı X */}
        {tooth.condition === "EXTRACTED" ? (
          <g stroke="#dc2626" strokeWidth={2.5} strokeLinecap="round">
            <line x1={8} y1={gingivalY + 8} x2={VB_W - 8} y2={VB_H - 8} />
            <line x1={VB_W - 8} y1={gingivalY + 8} x2={8} y2={VB_H - 8} />
          </g>
        ) : null}

        {/* Tıklanabilir yüzey alanları (şeffaf, seçildiğinde vurgulu) */}
        {!readOnly || highlightSurface ? (
          <g>
            {/* Top (buccal/labial) — gingiva hizasından aşağı bir şerit */}
            <rect
              x={cLeft}
              y={cTop}
              width={cRight - cLeft}
              height={10}
              fill={
                selectedSurfaces.has(sides.top)
                  ? tooth.condition === "HEALTHY"
                    ? "#0ea5e9"
                    : meta.fill
                  : "transparent"
              }
              fillOpacity={selectedSurfaces.has(sides.top) ? 0.55 : 0}
              stroke={highlightSurface === sides.top ? "#0ea5e9" : "transparent"}
              strokeWidth={1.2}
              onClick={(e) => handleSurface(e, sides.top)}
            />
            {/* Bottom (lingual) — incizal/oklüzal kenarın iç tarafı */}
            <rect
              x={cLeft}
              y={cBot - 12}
              width={cRight - cLeft}
              height={10}
              fill={
                selectedSurfaces.has(sides.bottom)
                  ? tooth.condition === "HEALTHY"
                    ? "#0ea5e9"
                    : meta.fill
                  : "transparent"
              }
              fillOpacity={selectedSurfaces.has(sides.bottom) ? 0.55 : 0}
              stroke={highlightSurface === sides.bottom ? "#0ea5e9" : "transparent"}
              strokeWidth={1.2}
              onClick={(e) => handleSurface(e, sides.bottom)}
            />
            {/* Left */}
            <rect
              x={cLeft}
              y={cTop + 4}
              width={8}
              height={cBot - cTop - 8}
              fill={
                selectedSurfaces.has(sides.left)
                  ? tooth.condition === "HEALTHY"
                    ? "#0ea5e9"
                    : meta.fill
                  : "transparent"
              }
              fillOpacity={selectedSurfaces.has(sides.left) ? 0.55 : 0}
              stroke={highlightSurface === sides.left ? "#0ea5e9" : "transparent"}
              strokeWidth={1.2}
              onClick={(e) => handleSurface(e, sides.left)}
            />
            {/* Right */}
            <rect
              x={cRight - 8}
              y={cTop + 4}
              width={8}
              height={cBot - cTop - 8}
              fill={
                selectedSurfaces.has(sides.right)
                  ? tooth.condition === "HEALTHY"
                    ? "#0ea5e9"
                    : meta.fill
                  : "transparent"
              }
              fillOpacity={selectedSurfaces.has(sides.right) ? 0.55 : 0}
              stroke={highlightSurface === sides.right ? "#0ea5e9" : "transparent"}
              strokeWidth={1.2}
              onClick={(e) => handleSurface(e, sides.right)}
            />
            {/* Center (occlusal/incisal) */}
            <rect
              x={cLeft + pad}
              y={cTop + 10}
              width={cRight - cLeft - pad * 2}
              height={cBot - cTop - 22}
              fill={
                selectedSurfaces.has(sides.center)
                  ? tooth.condition === "HEALTHY"
                    ? "#0ea5e9"
                    : meta.fill
                  : "transparent"
              }
              fillOpacity={selectedSurfaces.has(sides.center) ? 0.5 : 0}
              stroke={highlightSurface === sides.center ? "#0ea5e9" : "transparent"}
              strokeWidth={1.2}
              onClick={(e) => handleSurface(e, sides.center)}
            />
          </g>
        ) : null}
      </g>
    </svg>
  );
}

/**
 * Kron (crown) path'leri — viewBox 64×100, kron y ∈ [42..100].
 * Üst çene varsayılır; alt çenede SVG'de flip uygulanır.
 *
 * highlight: silindir 3D hissini veren sol tarafta dikey parlama çizgisi.
 */
function crownPathFor(kind: ToothKind): {
  outline: string;
  detail: string[];
  highlight: string;
} {
  switch (kind) {
    case "molar":
      return {
        outline:
          "M 7,44 C 6,52 5,62 6,74 C 7,86 12,94 20,95 L 44,95 C 52,94 57,86 58,74 C 59,62 58,52 57,44 Z",
        detail: [
          "M 20,94 C 24,82 24,78 20,66",
          "M 32,95 C 32,82 32,78 32,66",
          "M 44,94 C 40,82 40,78 44,66",
          "M 12,78 C 22,76 42,76 52,78",
        ],
        highlight: "M 13,52 C 10,66 11,82 15,92",
      };
    case "premolar":
      return {
        outline:
          "M 12,44 C 10,54 10,66 11,78 C 12,88 16,94 22,95 L 42,95 C 48,94 52,88 53,78 C 54,66 54,54 52,44 Z",
        detail: [
          "M 18,94 C 22,82 22,76 18,66",
          "M 46,94 C 42,82 42,76 46,66",
          "M 22,82 C 32,80 32,80 42,82",
        ],
        highlight: "M 17,54 C 14,66 15,82 19,92",
      };
    case "canine":
      return {
        outline:
          "M 16,44 C 13,56 12,70 14,82 C 16,92 22,97 32,97 C 42,97 48,92 50,82 C 52,70 51,56 48,44 Z",
        detail: [
          "M 20,90 C 26,84 30,82 32,82 C 34,82 38,84 44,90",
          "M 32,96 C 32,88 32,82 32,70",
        ],
        highlight: "M 19,56 C 17,68 18,82 22,94",
      };
    case "incisor":
    default:
      return {
        outline:
          "M 14,44 C 12,54 11,68 12,80 C 13,90 16,95 22,96 L 42,96 C 48,95 51,90 52,80 C 53,68 52,54 50,44 Z",
        detail: [
          "M 18,94 L 46,94",
          "M 24,94 C 24,90 24,88 24,86",
          "M 32,94 C 32,90 32,88 32,86",
          "M 40,94 C 40,90 40,88 40,86",
        ],
        highlight: "M 17,54 C 15,66 16,82 19,93",
      };
  }
}

/**
 * Kök (root) path'leri — y ∈ [0..42], gingiva hizası y=42'de kron ile birleşir.
 */
function rootPathsFor(kind: ToothKind, jaw: "upper" | "lower"): string[] {
  switch (kind) {
    case "molar":
      if (jaw === "upper") {
        // 3 kök: mesio-bukkal, disto-bukkal, palatal
        return [
          "M 10,42 C 9,30 8,18 12,6 C 14,2 18,2 20,6 C 22,18 22,30 22,42 Z",
          "M 27,42 C 26,30 28,18 30,8 C 32,4 36,4 38,8 C 40,18 40,30 37,42 Z",
          "M 44,42 C 44,30 44,18 46,8 C 48,4 52,4 54,8 C 56,18 56,30 54,42 Z",
        ];
      }
      // alt molar: 2 kök
      return [
        "M 12,42 C 10,28 10,14 14,4 C 16,0 22,0 24,4 C 26,14 26,28 26,42 Z",
        "M 38,42 C 38,28 38,14 40,4 C 42,0 48,0 50,4 C 54,14 54,28 52,42 Z",
      ];
    case "premolar":
      // Genelde tek kök, hafif çatallı tip
      return [
        "M 20,42 C 18,28 18,14 22,4 C 26,-1 38,-1 42,4 C 46,14 46,28 44,42 Z",
      ];
    case "canine":
      // Uzun, konik tek kök
      return [
        "M 22,42 C 18,28 16,14 20,4 C 24,-2 40,-2 44,4 C 48,14 46,28 42,42 Z",
      ];
    case "incisor":
    default:
      // Tek, kısa-orta kök
      return [
        "M 22,42 C 20,28 20,14 24,6 C 28,0 36,0 40,6 C 44,14 44,28 42,42 Z",
      ];
  }
}

export const ToothSvg = memo(ToothSvgImpl);
