"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Download,
  Layers,
  Image as ImageIcon,
  Package,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { FileUploadZone } from "@/components/file-upload-zone";
import JSZip from "jszip";

interface GeneratedFile {
  blob: Blob;
  size: number;
  description: string;
}

interface FaviconOutput {
  name: string;
  filename: string;
  description: string;
  file?: GeneratedFile;
}

const FAVICON_OUTPUTS: Omit<FaviconOutput, "file">[] = [
  { name: "favicon.ico", filename: "favicon.ico", description: "Multi-size (16x16, 32x32, 48x48)" },
  {
    name: "favicon-16x16.png",
    filename: "favicon-16x16.png",
    description: "16x16 pixels - Browser tabs",
  },
  {
    name: "favicon-32x32.png",
    filename: "favicon-32x32.png",
    description: "32x32 pixels - High-DPI displays",
  },
  {
    name: "favicon-48x48.png",
    filename: "favicon-48x48.png",
    description: "48x48 pixels - Windows shortcuts",
  },
  {
    name: "favicon-128x128.png",
    filename: "favicon-128x128.png",
    description: "128x128 pixels - Chrome Web Store",
  },
  {
    name: "apple-touch-icon.png",
    filename: "apple-touch-icon.png",
    description: "180x180 pixels - iOS home screen",
  },
  {
    name: "android-chrome-192x192.png",
    filename: "android-chrome-192x192.png",
    description: "192x192 pixels - Android/Chrome",
  },
  {
    name: "android-chrome-512x512.png",
    filename: "android-chrome-512x512.png",
    description: "512x512 pixels - PWA & app stores",
  },
];

const FAVICON_SIZES = [16, 32, 48, 128, 180, 192, 512];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function resizeImage(canvas: HTMLCanvasElement, targetSize: number): HTMLCanvasElement {
  const resizedCanvas = document.createElement("canvas");
  resizedCanvas.width = targetSize;
  resizedCanvas.height = targetSize;
  const ctx = resizedCanvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(canvas, 0, 0, targetSize, targetSize);

  return resizedCanvas;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Failed to generate PNG blob"));
      }
    }, "image/png");
  });
}

async function createIcoFile(images: Map<number, Blob>): Promise<Blob> {
  const sizes = [16, 32, 48];
  const numImages = sizes.length;
  const headerSize = 6;
  const entrySize = 16;
  const iconDirSize = headerSize + entrySize * numImages;

  let offset = iconDirSize;
  const entries: ArrayBuffer[] = [];
  const imageData: Buffer[] = [];

  for (const size of sizes) {
    const blob = images.get(size);
    if (!blob) continue;

    const arrayBuffer = await (blob as Blob).arrayBuffer();
    const dataArray = new Uint8Array(arrayBuffer);
    const imageSize = dataArray.length;

    const entry = new ArrayBuffer(entrySize);
    const entryView = new DataView(entry);

    entryView.setUint8(0, size === 256 ? 0 : size);
    entryView.setUint8(1, size === 256 ? 0 : size);
    entryView.setUint8(2, 0);
    entryView.setUint8(3, 0);
    entryView.setUint16(4, 1, true);
    entryView.setUint16(6, 32, true);
    entryView.setUint32(8, imageSize, true);
    entryView.setUint32(12, offset, true);

    entries.push(entry);
    imageData.push(Buffer.from(dataArray));
    offset += imageSize;
  }

  const header = new ArrayBuffer(headerSize);
  const headerView = new DataView(header);
  headerView.setUint16(0, 0, true);
  headerView.setUint16(2, 1, true);
  headerView.setUint16(4, numImages, true);

  const headerBuffer = Buffer.from(new Uint8Array(header));
  const totalSize = iconDirSize + imageData.reduce((sum, buf) => sum + buf.length, 0);
  const result = Buffer.allocUnsafe(totalSize);

  let writeOffset = 0;
  result.set(headerBuffer, writeOffset);
  writeOffset += headerSize;

  for (const entry of entries) {
    result.set(Buffer.from(new Uint8Array(entry)), writeOffset);
    writeOffset += entrySize;
  }

  for (const data of imageData) {
    result.set(data, writeOffset);
    writeOffset += data.length;
  }

  return new Blob([result], { type: "image/x-icon" });
}

export function FaviconGenerator() {
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [inputUrl, setInputUrl] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(
    null,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<Map<string, GeneratedFile>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    return () => {
      if (inputUrl) URL.revokeObjectURL(inputUrl);
    };
  }, [inputUrl]);

  const handleFileSelect = (file: File) => {
    if (inputUrl) URL.revokeObjectURL(inputUrl);

    setError(null);
    setSuccess(false);
    setInputFile(file);
    const url = URL.createObjectURL(file);
    setInputUrl(url);
    setGeneratedFiles(new Map());

    const img = new window.Image();
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
    };
    img.src = url;
  };

  const handleReset = () => {
    if (inputUrl) URL.revokeObjectURL(inputUrl);
    setInputFile(null);
    setInputUrl(null);
    setImageDimensions(null);
    setGeneratedFiles(new Map());
    setError(null);
    setSuccess(false);
  };

  const generateFavicons = async () => {
    if (!inputFile || !inputUrl) return;

    setIsGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new window.Image();
        const timeout = setTimeout(() => {
          image.src = "";
          reject(new Error("Image loading timed out"));
        }, 10000);

        image.onload = () => {
          clearTimeout(timeout);
          if (image.complete && image.naturalWidth > 0 && image.naturalHeight > 0) {
            resolve(image);
          } else {
            reject(new Error("Image failed to load completely"));
          }
        };
        image.onerror = () => {
          clearTimeout(timeout);
          reject(new Error("Failed to load image"));
        };
        image.src = inputUrl;
      });

      if (img.width === 0 || img.height === 0) {
        throw new Error("Invalid image dimensions");
      }

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Failed to get canvas context");

      ctx.drawImage(img, 0, 0);

      const resizedImages = new Map<number, Blob>();
      const newGeneratedFiles = new Map<string, GeneratedFile>();

      for (const size of FAVICON_SIZES) {
        const resizedCanvas = resizeImage(canvas, size);
        const blob = await canvasToBlob(resizedCanvas);
        resizedImages.set(size, blob);

        const filename =
          size === 180
            ? "apple-touch-icon.png"
            : size === 192
              ? "android-chrome-192x192.png"
              : size === 512
                ? "android-chrome-512x512.png"
                : `favicon-${size}x${size}.png`;

        newGeneratedFiles.set(filename, {
          blob,
          size: blob.size,
          description:
            size === 180
              ? "180x180 pixels - iOS home screen"
              : size === 192
                ? "192x192 pixels - Android/Chrome"
                : size === 512
                  ? "512x512 pixels - PWA & app stores"
                  : `${size}x${size} pixels`,
        });
      }

      const icoBlob = await createIcoFile(resizedImages);
      newGeneratedFiles.set("favicon.ico", {
        blob: icoBlob,
        size: icoBlob.size,
        description: "Multi-size (16x16, 32x32, 48x48)",
      });

      setGeneratedFiles(newGeneratedFiles);
      setSuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Generation failed";
      setError(errorMessage);
      console.error("Favicon generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (filename: string) => {
    const file = generatedFiles.get(filename);
    if (!file) return;

    const url = URL.createObjectURL(file.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = async () => {
    if (generatedFiles.size === 0) return;

    try {
      const zip = new JSZip();

      for (const [filename, file] of generatedFiles) {
        zip.file(filename, file.blob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "favicons.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to create ZIP file");
      console.error("ZIP generation error:", err);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Image</CardTitle>
          <CardDescription>
            Select an image to generate favicons (PNG, JPEG, or WebP)
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                ? `${imageDimensions.width} x ${imageDimensions.height}px`
                : undefined;
            }}
          />
        </CardContent>
      </Card>

      {inputFile && inputUrl && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Image Preview</CardTitle>
              <CardDescription>Your uploaded image</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                {imageDimensions ? (
                  <Image
                    src={inputUrl}
                    alt="Preview"
                    width={Math.min(imageDimensions.width, 300)}
                    height={Math.min(imageDimensions.height, 300)}
                    className="max-w-full max-h-[300px] w-auto h-auto object-contain rounded"
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
                      {imageDimensions.width} x {imageDimensions.height}px
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generate Favicons</CardTitle>
              <CardDescription>Create favicon files in multiple sizes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm">This will generate the following files:</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• favicon.ico (16x16, 32x32, 48x48)</li>
                  <li>• favicon-16x16.png</li>
                  <li>• favicon-32x32.png</li>
                  <li>• favicon-48x48.png</li>
                  <li>• favicon-128x128.png</li>
                  <li>• apple-touch-icon.png (180x180)</li>
                  <li>• android-chrome-192x192.png</li>
                  <li>• android-chrome-512x512.png</li>
                </ul>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
                  <AlertCircle className="size-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-md text-sm text-green-600 dark:text-green-400">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>All favicons generated successfully!</span>
                </div>
              )}

              <Button onClick={generateFavicons} disabled={isGenerating} className="w-full">
                <Layers className="size-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate Favicons"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {generatedFiles.size > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated Files</CardTitle>
                <CardDescription>Download individual files or all at once</CardDescription>
              </div>
              <Button onClick={handleDownloadAll} variant="outline" size="sm">
                <Package className="size-4 mr-2" />
                Download All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {FAVICON_OUTPUTS.map((output) => {
                const file = generatedFiles.get(output.filename);
                if (!file) return null;

                return (
                  <div
                    key={output.filename}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{output.filename}</p>
                      <p className="text-xs text-muted-foreground">{output.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-muted-foreground min-w-[80px] text-right">
                        {formatFileSize(file.size)}
                      </p>
                      <Button
                        onClick={() => handleDownload(output.filename)}
                        variant="ghost"
                        size="sm"
                      >
                        <Download className="size-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
