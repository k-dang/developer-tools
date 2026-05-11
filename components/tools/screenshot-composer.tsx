"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Download,
  Image as ImageIcon,
  RotateCcw,
  SlidersHorizontal,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploadZone } from "@/components/file-upload-zone";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  BACKGROUND_PRESETS,
  CANVAS_PRESETS,
  DEFAULT_COMPOSER_CONTROLS,
  type BackgroundPresetId,
  type CanvasPresetId,
  type Composition,
  type ComposerControls,
  type Rect,
  calculateComposition,
} from "@/lib/screenshot-composer";

type ImageDimensions = {
  width: number;
  height: number;
};

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getImageFormat(file: File): string {
  return file.type.split("/")[1]?.replace("jpeg", "jpg").toUpperCase() || "IMAGE";
}

function gradientCss(angle: number, stops: readonly [string, string, string]): string {
  return `linear-gradient(${angle}deg, ${stops[0]} 0%, ${stops[1]} 52%, ${stops[2]} 100%)`;
}

function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The selected image could not be loaded for export."));
    image.src = url;
  });
}

function getGradientPoints(width: number, height: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  const lineLength = Math.abs(width * Math.cos(radians)) + Math.abs(height * Math.sin(radians));
  const centerX = width / 2;
  const centerY = height / 2;
  const halfX = (Math.cos(radians) * lineLength) / 2;
  const halfY = (Math.sin(radians) * lineLength) / 2;

  return {
    x0: centerX - halfX,
    y0: centerY - halfY,
    x1: centerX + halfX,
    y1: centerY + halfY,
  };
}

function addRoundedRectPath(context: CanvasRenderingContext2D, rect: Rect, radius: number) {
  const safeRadius = Math.max(0, Math.min(radius, rect.width / 2, rect.height / 2));

  context.beginPath();
  context.moveTo(rect.x + safeRadius, rect.y);
  context.lineTo(rect.x + rect.width - safeRadius, rect.y);
  context.quadraticCurveTo(rect.x + rect.width, rect.y, rect.x + rect.width, rect.y + safeRadius);
  context.lineTo(rect.x + rect.width, rect.y + rect.height - safeRadius);
  context.quadraticCurveTo(
    rect.x + rect.width,
    rect.y + rect.height,
    rect.x + rect.width - safeRadius,
    rect.y + rect.height,
  );
  context.lineTo(rect.x + safeRadius, rect.y + rect.height);
  context.quadraticCurveTo(rect.x, rect.y + rect.height, rect.x, rect.y + rect.height - safeRadius);
  context.lineTo(rect.x, rect.y + safeRadius);
  context.quadraticCurveTo(rect.x, rect.y, rect.x + safeRadius, rect.y);
  context.closePath();
}

function getExportFileName(file: File): string {
  const baseName = file.name.replace(/\.[^/.]+$/, "").trim() || "screenshot";
  return `${baseName}-composed.png`;
}

async function renderCompositionToBlob(
  imageUrl: string,
  composition: Composition,
): Promise<Blob> {
  const image = await loadImageElement(imageUrl);
  const canvas = document.createElement("canvas");
  canvas.width = composition.canvas.width;
  canvas.height = composition.canvas.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas rendering is not available in this browser.");
  }

  const points = getGradientPoints(
    composition.canvas.width,
    composition.canvas.height,
    composition.background.angle,
  );
  const gradient = context.createLinearGradient(points.x0, points.y0, points.x1, points.y1);
  gradient.addColorStop(0, composition.background.stops[0]);
  gradient.addColorStop(0.52, composition.background.stops[1]);
  gradient.addColorStop(1, composition.background.stops[2]);
  context.fillStyle = gradient;
  context.fillRect(0, 0, composition.canvas.width, composition.canvas.height);

  context.save();
  context.shadowColor = `rgba(0, 0, 0, ${composition.image.shadow.opacity})`;
  context.shadowBlur = composition.image.shadow.blur;
  context.shadowOffsetY = composition.image.shadow.offsetY;
  context.fillStyle = "rgba(0, 0, 0, 0.18)";
  addRoundedRectPath(context, composition.image.rect, composition.image.cornerRadius);
  context.fill();
  context.restore();

  context.save();
  addRoundedRectPath(context, composition.image.rect, composition.image.cornerRadius);
  context.clip();
  context.drawImage(
    image,
    composition.image.rect.x,
    composition.image.rect.y,
    composition.image.rect.width,
    composition.image.rect.height,
  );
  context.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }
      reject(new Error("PNG export failed."));
    }, "image/png");
  });
}

function ControlSlider({
  label,
  value,
  min,
  max,
  step,
  displayValue,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  displayValue: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{displayValue}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([nextValue]) => onChange(nextValue ?? value)}
      />
    </div>
  );
}

export function ScreenshotComposer() {
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [inputUrl, setInputUrl] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);
  const [controls, setControls] = useState<ComposerControls>(DEFAULT_COMPOSER_CONTROLS);
  const [error, setError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const inputUrlRef = useRef<string | null>(null);
  const composition = imageDimensions ? calculateComposition(imageDimensions, controls) : null;
  const previewWidth = composition ? `min(100%, ${composition.canvas.width}px)` : undefined;
  const previewBackground = composition
    ? gradientCss(composition.background.angle, composition.background.stops)
    : undefined;

  const updateControls = (nextControls: Partial<ComposerControls>) => {
    setControls((currentControls) => ({ ...currentControls, ...nextControls }));
  };

  useEffect(() => {
    return () => {
      if (inputUrlRef.current) {
        URL.revokeObjectURL(inputUrlRef.current);
      }
    };
  }, []);

  const handleFileSelect = (file: File) => {
    if (inputUrlRef.current) {
      URL.revokeObjectURL(inputUrlRef.current);
    }

    const url = URL.createObjectURL(file);
    inputUrlRef.current = url;
    setInputFile(file);
    setInputUrl(url);
    setImageDimensions(null);
    setError(null);
    setExportError(null);

    const image = new window.Image();
    image.onload = () => {
      if (image.naturalWidth > 0 && image.naturalHeight > 0) {
        setImageDimensions({
          width: image.naturalWidth,
          height: image.naturalHeight,
        });
        return;
      }

      setError("The selected image has invalid dimensions.");
    };
    image.onerror = () => {
      setImageDimensions(null);
      setError("The selected image could not be loaded.");
    };
    image.src = url;
  };

  const handleReset = () => {
    if (inputUrlRef.current) {
      URL.revokeObjectURL(inputUrlRef.current);
      inputUrlRef.current = null;
    }

    setInputFile(null);
    setInputUrl(null);
    setImageDimensions(null);
    setControls(DEFAULT_COMPOSER_CONTROLS);
    setError(null);
    setExportError(null);
    setIsExporting(false);
  };

  const handleExport = async () => {
    if (!inputFile || !inputUrl || !composition) {
      setExportError("Upload an image before exporting.");
      return;
    }

    setIsExporting(true);
    setExportError(null);

    try {
      const blob = await renderCompositionToBlob(inputUrl, composition);
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = getExportFileName(inputFile);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (exportFailure) {
      setExportError(
        exportFailure instanceof Error ? exportFailure.message : "PNG export failed.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="min-w-0 rounded-lg border bg-card">
        <div className="border-b px-4 py-3 sm:px-6">
          <h3 className="text-base font-semibold text-foreground">Preview</h3>
          <p className="text-sm text-muted-foreground">Local image layer on the export surface</p>
        </div>
        <div className="flex min-h-[360px] items-center justify-center p-3 sm:min-h-[560px] sm:p-6">
          {inputUrl && composition ? (
            <div className="flex size-full items-center justify-center rounded-lg bg-muted/70 p-2 sm:p-6">
              <div
                className="relative overflow-hidden rounded-md"
                style={{
                  width: previewWidth,
                  aspectRatio: `${composition.canvas.width} / ${composition.canvas.height}`,
                  background: previewBackground,
                }}
              >
                <Image
                  src={inputUrl}
                  alt="Uploaded screenshot preview"
                  width={composition.image.rect.width}
                  height={composition.image.rect.height}
                  className="absolute object-fill"
                  style={{
                    left: `${(composition.image.rect.x / composition.canvas.width) * 100}%`,
                    top: `${(composition.image.rect.y / composition.canvas.height) * 100}%`,
                    width: `${(composition.image.rect.width / composition.canvas.width) * 100}%`,
                    height: `${(composition.image.rect.height / composition.canvas.height) * 100}%`,
                    borderRadius: `${composition.image.cornerRadius}px`,
                    boxShadow: `0 ${composition.image.shadow.offsetY}px ${composition.image.shadow.blur}px rgb(0 0 0 / ${composition.image.shadow.opacity})`,
                  }}
                  unoptimized
                />
              </div>
            </div>
          ) : (
            <div className="flex w-full max-w-md flex-col items-center justify-center rounded-lg border border-dashed bg-muted/40 px-6 py-14 text-center">
              <ImageIcon className="mb-4 size-12 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                Upload a screenshot
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                PNG, JPEG, or WebP. Preview and export stay in this browser.
              </p>
            </div>
          )}
        </div>
      </section>

      <aside className="min-w-0 space-y-4">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Image</CardTitle>
            <CardDescription>Select one local screenshot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileUploadZone
              onFileSelect={handleFileSelect}
              onReset={handleReset}
              selectedFile={inputFile}
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              uploadIcon={Upload}
              fileIcon={ImageIcon}
              title="Upload screenshot"
              description="PNG, JPEG, or WebP"
              fileId="screenshot-composer-upload"
              validateFile={(file) => {
                if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
                  return "Upload a PNG, JPEG, or WebP image.";
                }
                return true;
              }}
              fileMetadata={() =>
                imageDimensions
                  ? `${imageDimensions.width} x ${imageDimensions.height}px`
                  : "Reading dimensions"
              }
            />

            {inputFile && (
              <Button variant="outline" className="w-full" onClick={handleReset}>
                <RotateCcw className="size-4" />
                Reset image
              </Button>
            )}

            {error && (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2">
                  <SlidersHorizontal className="size-4" />
                  Controls
                </CardTitle>
                <CardDescription>Presentation settings</CardDescription>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0"
                onClick={() => setControls(DEFAULT_COMPOSER_CONTROLS)}
              >
                <RotateCcw className="size-4" />
                Defaults
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Background</Label>
                <Select
                  value={controls.backgroundPreset}
                  onValueChange={(value) =>
                    updateControls({ backgroundPreset: value as BackgroundPresetId })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BACKGROUND_PRESETS.map((preset) => (
                      <SelectItem key={preset.id} value={preset.id}>
                        <span
                          className="size-3 rounded-full"
                          style={{ background: gradientCss(preset.angle, preset.stops) }}
                        />
                        {preset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Aspect ratio</Label>
                <Select
                  value={controls.canvasPreset}
                  onValueChange={(value) =>
                    updateControls({ canvasPreset: value as CanvasPresetId })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CANVAS_PRESETS.map((preset) => (
                      <SelectItem key={preset.id} value={preset.id}>
                        {preset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ControlSlider
              label="Padding"
              value={controls.padding}
              min={24}
              max={220}
              step={4}
              displayValue={`${controls.padding}px`}
              onChange={(padding) => updateControls({ padding })}
            />
            <ControlSlider
              label="Scale"
              value={controls.scale}
              min={0.7}
              max={1.25}
              step={0.01}
              displayValue={`${Math.round(controls.scale * 100)}%`}
              onChange={(scale) => updateControls({ scale })}
            />
            <ControlSlider
              label="Radius"
              value={controls.cornerRadius}
              min={0}
              max={48}
              step={1}
              displayValue={`${controls.cornerRadius}px`}
              onChange={(cornerRadius) => updateControls({ cornerRadius })}
            />
            <ControlSlider
              label="Shadow"
              value={controls.shadowStrength}
              min={0}
              max={1}
              step={0.01}
              displayValue={`${Math.round(controls.shadowStrength * 100)}%`}
              onChange={(shadowStrength) => updateControls({ shadowStrength })}
            />
            <ControlSlider
              label="Horizontal"
              value={controls.xOffset}
              min={-0.75}
              max={0.75}
              step={0.01}
              displayValue={`${Math.round(controls.xOffset * 100)}%`}
              onChange={(xOffset) => updateControls({ xOffset })}
            />
            <ControlSlider
              label="Vertical"
              value={controls.yOffset}
              min={-0.75}
              max={0.75}
              step={0.01}
              displayValue={`${Math.round(controls.yOffset * 100)}%`}
              onChange={(yOffset) => updateControls({ yOffset })}
            />
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Export</CardTitle>
            <CardDescription>Download the current PNG</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" disabled={!composition || isExporting} onClick={handleExport}>
              <Download className="size-4" />
              {isExporting ? "Exporting" : "Export PNG"}
            </Button>
            {exportError && (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {exportError}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
            <CardDescription>Current upload details</CardDescription>
          </CardHeader>
          <CardContent>
            {inputFile ? (
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="min-w-0">
                  <dt className="text-muted-foreground">File</dt>
                  <dd className="truncate font-medium text-foreground">{inputFile.name}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Format</dt>
                  <dd className="font-medium text-foreground">{getImageFormat(inputFile)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Size</dt>
                  <dd className="font-medium text-foreground">{formatFileSize(inputFile.size)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Dimensions</dt>
                  <dd className="font-medium text-foreground">
                    {imageDimensions
                      ? `${imageDimensions.width} x ${imageDimensions.height}px`
                      : "Loading"}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">No image selected</p>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
