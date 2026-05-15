export type ImageDimensions = {
  width: number;
  height: number;
};

export type CanvasPresetId = "auto" | "wide" | "open-graph" | "square" | "portrait";

export type BackgroundPresetId =
  | "aurora"
  | "graphite"
  | "lagoon"
  | "sunrise"
  | "ember"
  | "violet"
  | "citrus"
  | "midnight"
  | "rose";

export type CanvasPreset = {
  id: CanvasPresetId;
  name: string;
  width: number | null;
  height: number | null;
};

export type BackgroundPreset = {
  id: BackgroundPresetId;
  name: string;
  stops: readonly [string, string, string];
  angle: number;
};

export type ComposerControls = {
  canvasPreset: CanvasPresetId;
  backgroundPreset: BackgroundPresetId;
  padding: number;
  scale: number;
  cornerRadius: number;
  shadowStrength: number;
  xOffset: number;
  yOffset: number;
};

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Composition = {
  canvas: {
    width: number;
    height: number;
    preset: CanvasPreset;
  };
  background: BackgroundPreset;
  image: {
    rect: Rect;
    cornerRadius: number;
    shadow: {
      blur: number;
      offsetY: number;
      opacity: number;
    };
  };
  padding: number;
};

const MIN_CANVAS_SIZE = 1;

export const CANVAS_PRESETS: readonly CanvasPreset[] = [
  { id: "auto", name: "Auto", width: null, height: null },
  { id: "wide", name: "16:9", width: 1600, height: 900 },
  { id: "open-graph", name: "Open Graph", width: 1200, height: 630 },
  { id: "square", name: "Square", width: 1080, height: 1080 },
  { id: "portrait", name: "Portrait", width: 1080, height: 1350 },
];

export const BACKGROUND_PRESETS: readonly BackgroundPreset[] = [
  { id: "aurora", name: "Aurora", angle: 135, stops: ["#172554", "#7c3aed", "#06b6d4"] },
  { id: "graphite", name: "Graphite", angle: 145, stops: ["#111827", "#374151", "#94a3b8"] },
  { id: "lagoon", name: "Lagoon", angle: 140, stops: ["#064e3b", "#0f766e", "#67e8f9"] },
  { id: "sunrise", name: "Sunrise", angle: 135, stops: ["#7f1d1d", "#f97316", "#fde68a"] },
  { id: "ember", name: "Ember", angle: 125, stops: ["#450a0a", "#dc2626", "#fbbf24"] },
  { id: "violet", name: "Violet", angle: 150, stops: ["#312e81", "#a855f7", "#f0abfc"] },
  { id: "citrus", name: "Citrus", angle: 130, stops: ["#14532d", "#84cc16", "#fef08a"] },
  { id: "midnight", name: "Midnight", angle: 155, stops: ["#020617", "#1d4ed8", "#38bdf8"] },
  { id: "rose", name: "Rose", angle: 140, stops: ["#4a044e", "#e11d48", "#fecdd3"] },
];

export const DEFAULT_COMPOSER_CONTROLS: ComposerControls = {
  canvasPreset: "wide",
  backgroundPreset: "aurora",
  padding: 96,
  scale: 1,
  cornerRadius: 18,
  shadowStrength: 0.65,
  xOffset: 0,
  yOffset: 0,
};

export function getCanvasPreset(id: CanvasPresetId): CanvasPreset {
  return CANVAS_PRESETS.find((preset) => preset.id === id) ?? CANVAS_PRESETS[0];
}

export function getBackgroundPreset(id: BackgroundPresetId): BackgroundPreset {
  return BACKGROUND_PRESETS.find((preset) => preset.id === id) ?? BACKGROUND_PRESETS[0];
}

export function calculateComposition(
  imageDimensions: ImageDimensions,
  controls: ComposerControls,
): Composition {
  const imageWidth = positiveFinite(imageDimensions.width, MIN_CANVAS_SIZE);
  const imageHeight = positiveFinite(imageDimensions.height, MIN_CANVAS_SIZE);
  const padding = nonNegativeFinite(controls.padding);
  const scale = positiveFinite(controls.scale, 1);
  const cornerRadius = nonNegativeFinite(controls.cornerRadius);
  const shadowStrength = clampedFinite(controls.shadowStrength, 0, 1, 0);
  const xOffset = normalizedOffset(controls.xOffset);
  const yOffset = normalizedOffset(controls.yOffset);
  const preset = getCanvasPreset(controls.canvasPreset);
  const background = getBackgroundPreset(controls.backgroundPreset);

  const canvas =
    preset.id === "auto"
      ? {
          width: Math.round(imageWidth * scale + padding * 2),
          height: Math.round(imageHeight * scale + padding * 2),
        }
      : {
          width: preset.width ?? MIN_CANVAS_SIZE,
          height: preset.height ?? MIN_CANVAS_SIZE,
        };

  const canvasWidth = Math.max(MIN_CANVAS_SIZE, canvas.width);
  const canvasHeight = Math.max(MIN_CANVAS_SIZE, canvas.height);
  const availableWidth = Math.max(MIN_CANVAS_SIZE, canvasWidth - padding * 2);
  const availableHeight = Math.max(MIN_CANVAS_SIZE, canvasHeight - padding * 2);
  const fitScale =
    preset.id === "auto" ? 1 : Math.min(availableWidth / imageWidth, availableHeight / imageHeight);
  const drawWidth = imageWidth * fitScale * scale;
  const drawHeight = imageHeight * fitScale * scale;
  const remainingX = availableWidth - drawWidth;
  const remainingY = availableHeight - drawHeight;

  return {
    canvas: {
      width: canvasWidth,
      height: canvasHeight,
      preset,
    },
    background,
    image: {
      rect: {
        x: padding + remainingX / 2 + (remainingX / 2) * xOffset,
        y: padding + remainingY / 2 + (remainingY / 2) * yOffset,
        width: drawWidth,
        height: drawHeight,
      },
      cornerRadius,
      shadow: {
        blur: Math.round(64 * shadowStrength),
        offsetY: Math.round(28 * shadowStrength),
        opacity: Number((0.35 * shadowStrength).toFixed(3)),
      },
    },
    padding,
  };
}

function positiveFinite(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function nonNegativeFinite(value: number): number {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function normalizedOffset(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(-1, Math.min(1, value));
}

function clampedFinite(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}
