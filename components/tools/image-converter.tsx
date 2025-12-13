"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import { FileUploadZone } from "@/components/file-upload-zone";
import { Image as ImageIcon } from "lucide-react";

type OutputFormat = "image/png" | "image/jpeg" | "image/webp";

const FORMAT_OPTIONS: { value: OutputFormat; label: string }[] = [
  { value: "image/png", label: "PNG" },
  { value: "image/jpeg", label: "JPEG" },
  { value: "image/webp", label: "WebP" },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ImageConverter() {
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [inputUrl, setInputUrl] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/webp");
  const [quality, setQuality] = useState(0.85);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(
    null,
  );
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const convertedImageRef = useRef<HTMLDivElement>(null);

  // Cleanup object URLs on unmount only
  useEffect(() => {
    return () => {
      if (inputUrl) URL.revokeObjectURL(inputUrl);
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run cleanup on unmount

  // Scroll to converted image preview after conversion completes
  useEffect(() => {
    if (outputUrl && outputBlob && convertedImageRef.current) {
      // Small delay to ensure the DOM has updated
      setTimeout(() => {
        convertedImageRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [outputUrl, outputBlob]);

  const handleFileSelect = (file: File) => {
    // Cleanup previous URLs
    if (inputUrl) URL.revokeObjectURL(inputUrl);
    if (outputUrl) URL.revokeObjectURL(outputUrl);

    setError(null);
    setInputFile(file);
    const url = URL.createObjectURL(file);
    setInputUrl(url);

    // Reset output
    setOutputBlob(null);
    setOutputUrl(null);

    // Load image to get dimensions
    const img = new window.Image();
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
    };
    img.src = url;
  };

  const convertImage = async () => {
    if (!inputFile || !inputUrl) {
      setError("Please upload an image first");
      return;
    }

    setIsConverting(true);
    setError(null);

    try {
      // Check WebP support
      if (outputFormat === "image/webp") {
        const testCanvas = document.createElement("canvas");
        testCanvas.width = 1;
        testCanvas.height = 1;
        const supported = testCanvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
        if (!supported) {
          setError("WebP encoding is not supported in this browser");
          setIsConverting(false);
          return;
        }
      }

      // Load image with timeout - use a fresh image element each time
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new window.Image();
        const timeout = setTimeout(() => {
          image.src = ""; // Cancel loading
          reject(new Error("Image loading timed out. Please try again."));
        }, 10000); // 10 second timeout

        image.onload = () => {
          clearTimeout(timeout);
          // Ensure image is fully decoded and has valid dimensions
          if (image.complete && image.naturalWidth > 0 && image.naturalHeight > 0) {
            resolve(image);
          } else {
            reject(new Error("Image failed to load completely"));
          }
        };
        image.onerror = (e) => {
          clearTimeout(timeout);
          console.error("Image load error:", e);
          reject(
            new Error("Failed to load image. The file may be corrupted or the URL is invalid."),
          );
        };
        // Ensure we're using the current inputUrl
        image.src = inputUrl;
      });

      // Validate image dimensions
      if (img.width === 0 || img.height === 0) {
        throw new Error("Invalid image dimensions");
      }

      // Create canvas
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error(
          "Failed to get canvas context. Your browser may not support canvas operations.",
        );
      }

      // Draw image to canvas
      ctx.drawImage(img, 0, 0);

      // Convert to blob with timeout
      const blob = await new Promise<Blob>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Conversion timed out"));
        }, 10000); // 10 second timeout

        canvas.toBlob(
          (blob) => {
            clearTimeout(timeout);
            if (blob) {
              resolve(blob);
            } else {
              reject(
                new Error(
                  `Failed to convert image to ${outputFormat}. The format may not be supported.`,
                ),
              );
            }
          },
          outputFormat,
          outputFormat === "image/png" ? undefined : quality,
        );
      });

      // Cleanup previous output URL
      if (outputUrl) URL.revokeObjectURL(outputUrl);

      setOutputBlob(blob);
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Conversion failed";
      setError(errorMessage);
      console.error("Image conversion error:", err);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!outputBlob || !inputFile) return;

    const extension = outputFormat.split("/")[1].replace("jpeg", "jpg");
    const fileName = inputFile.name.replace(/\.[^/.]+$/, "") + `.${extension}`;

    const url = URL.createObjectURL(outputBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (inputUrl) URL.revokeObjectURL(inputUrl);
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setInputFile(null);
    setInputUrl(null);
    setOutputBlob(null);
    setOutputUrl(null);
    setImageDimensions(null);
    setError(null);
  };

  const showQualitySlider = outputFormat === "image/jpeg" || outputFormat === "image/webp";

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Image</CardTitle>
          <CardDescription>Select an image file (PNG, JPEG, or WebP)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUploadZone
            onFileSelect={handleFileSelect}
            onReset={handleReset}
            selectedFile={inputFile}
            accept="image/png,image/jpeg,image/webp"
            validateFile={(file) => {
              if (!file.type.startsWith("image/")) {
                return "Please select a valid image file";
              }
              return true;
            }}
            fileIcon={ImageIcon}
            description="PNG, JPEG, or WebP (max file size varies by browser)"
            fileMetadata={(file) => {
              return imageDimensions
                ? `${imageDimensions.width} × ${imageDimensions.height}px`
                : undefined;
            }}
          />
        </CardContent>
      </Card>

      {/* Conversion Settings and Original Image Preview Side by Side */}
      {inputFile && inputUrl && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Conversion Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Settings</CardTitle>
              <CardDescription>Choose output format and quality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="output-format" className="text-foreground">
                  Output Format
                </Label>
                <select
                  id="output-format"
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
                >
                  {FORMAT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {showQualitySlider && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="quality" className="text-foreground">
                      Quality
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(quality * 100)}%
                    </span>
                  </div>
                  <Slider
                    id="quality"
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={[quality]}
                    onValueChange={(values) => setQuality(values[0])}
                  />
                </div>
              )}

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button
                onClick={convertImage}
                disabled={isConverting || !inputFile}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isConverting ? "Converting..." : "Convert Image"}
              </Button>
            </CardContent>
          </Card>

          {/* Original Image Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Original Image</CardTitle>
              <CardDescription>Your uploaded image</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                {imageDimensions ? (
                  <Image
                    src={inputUrl}
                    alt="Original"
                    width={Math.min(imageDimensions.width, 800)}
                    height={Math.min(imageDimensions.height, 400)}
                    className="max-w-full max-h-[400px] w-auto h-auto object-contain rounded"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-[200px] flex items-center justify-center text-muted-foreground">
                    Loading image...
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-muted-foreground">File Size</p>
                    <p className="font-medium">{formatFileSize(inputFile.size)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Format</p>
                    <p className="font-medium uppercase">
                      {inputFile.type.split("/")[1].replace("jpeg", "jpg")}
                    </p>
                  </div>
                </div>
                {imageDimensions && (
                  <div>
                    <p className="text-muted-foreground">Dimensions</p>
                    <p className="font-medium">
                      {imageDimensions.width} × {imageDimensions.height}px
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Converted Image Preview */}
      {inputFile && outputUrl && outputBlob && (
        <div ref={convertedImageRef}>
          <Card>
            <CardHeader>
              <CardTitle>Converted Image</CardTitle>
              <CardDescription>Preview and download your converted image</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
              {imageDimensions ? (
                <Image
                  src={outputUrl}
                  alt="Converted"
                  width={Math.min(imageDimensions.width, 800)}
                  height={Math.min(imageDimensions.height, 400)}
                  className="max-w-full max-h-[400px] w-auto h-auto object-contain rounded"
                  unoptimized
                />
              ) : (
                <div className="w-full h-[200px] flex items-center justify-center text-muted-foreground">
                  Loading image...
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-muted-foreground">File Size</p>
                  <p className="font-medium">{formatFileSize(outputBlob.size)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Format</p>
                  <p className="font-medium uppercase">
                    {outputFormat.split("/")[1].replace("jpeg", "jpg")}
                  </p>
                </div>
              </div>
              {imageDimensions && (
                <div>
                  <p className="text-muted-foreground">Dimensions</p>
                  <p className="font-medium">
                    {imageDimensions.width} × {imageDimensions.height}px
                  </p>
                </div>
              )}
            </div>

            <Button
              onClick={handleDownload}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Download className="size-4 mr-2" />
              Download Converted Image
            </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
