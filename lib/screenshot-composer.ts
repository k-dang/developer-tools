export type ImageDimensions = {
  width: number;
  height: number;
};

export type CanvasPresetId = "auto" | "wide" | "open-graph" | "square" | "portrait";

export type BackgroundPresetId = "aurora" | "graphite" | "lagoon" | "sunrise";

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
  padding: number;
  scale: number;
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
  image: {
    rect: Rect;
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
];

export const DEFAULT_COMPOSER_CONTROLS: ComposerControls = {
  canvasPreset: "wide",
  padding: 96,
  scale: 1,
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
  const xOffset = normalizedOffset(controls.xOffset);
  const yOffset = normalizedOffset(controls.yOffset);
  const preset = getCanvasPreset(controls.canvasPreset);

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
    image: {
      rect: {
        x: padding + remainingX / 2 + (remainingX / 2) * xOffset,
        y: padding + remainingY / 2 + (remainingY / 2) * yOffset,
        width: drawWidth,
        height: drawHeight,
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
