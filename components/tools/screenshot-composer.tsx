"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Image as ImageIcon, RotateCcw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploadZone } from "@/components/file-upload-zone";

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

export function ScreenshotComposer() {
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [inputUrl, setInputUrl] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputUrlRef = useRef<string | null>(null);

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
          {inputUrl && imageDimensions ? (
            <div className="flex size-full items-center justify-center rounded-lg bg-muted p-4 sm:p-8">
              <Image
                src={inputUrl}
                alt="Uploaded screenshot preview"
                width={imageDimensions.width}
                height={imageDimensions.height}
                className="max-h-[70vh] w-auto max-w-full rounded-md object-contain shadow-2xl"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex w-full max-w-md flex-col items-center justify-center rounded-lg border border-dashed bg-muted/40 px-6 py-16 text-center">
              <ImageIcon className="mb-4 size-12 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Upload a screenshot to preview it</p>
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
