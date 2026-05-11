"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Image as ImageIcon, RotateCcw, SlidersHorizontal, Upload } from "lucide-react";
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
  type ComposerControls,
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
        <span className="text-xs tabular-nums text-muted-foreground">{displayValue}</span>
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
    setError(null);
  };

  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="min-w-0 rounded-lg border bg-card">
        <div className="border-b px-4 py-3 sm:px-6">
          <h3 className="text-base font-semibold text-foreground">Preview</h3>
          <p className="text-sm text-muted-foreground">Local image layer on the export surface</p>
        </div>
        <div className="flex min-h-[420px] items-center justify-center p-4 sm:min-h-[560px] sm:p-6">
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
            <div className="flex w-full max-w-md flex-col items-center justify-center rounded-lg border border-dashed bg-muted/40 px-6 py-16 text-center">
              <ImageIcon className="mb-4 size-12 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                Upload a screenshot to preview it
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                PNG, JPEG, and WebP files stay in this browser.
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
              label="Image scale"
              value={controls.scale}
              min={0.65}
              max={1.35}
              step={0.01}
              displayValue={`${Math.round(controls.scale * 100)}%`}
              onChange={(scale) => updateControls({ scale })}
            />
            <ControlSlider
              label="Corner radius"
              value={controls.cornerRadius}
              min={0}
              max={40}
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
              min={-1}
              max={1}
              step={0.01}
              displayValue={`${Math.round(controls.xOffset * 100)}%`}
              onChange={(xOffset) => updateControls({ xOffset })}
            />
            <ControlSlider
              label="Vertical"
              value={controls.yOffset}
              min={-1}
              max={1}
              step={0.01}
              displayValue={`${Math.round(controls.yOffset * 100)}%`}
              onChange={(yOffset) => updateControls({ yOffset })}
            />
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
