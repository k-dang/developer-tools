"use client";

import { useState, useRef, type ReactNode, type DragEvent, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, File as FileIcon, type LucideIcon } from "lucide-react";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  onReset?: () => void;
  selectedFile: File | null;
  accept?: string;
  maxFileSize?: number;
  className?: string;
  // Customization props
  uploadIcon?: LucideIcon;
  fileIcon?: LucideIcon;
  title?: string;
  description?: string;
  fileId?: string;
  // Custom validation function
  validateFile?: (file: File) => boolean | string;
  // Custom metadata to display after file size
  fileMetadata?: (file: File) => ReactNode;
}

export function FileUploadZone({
  onFileSelect,
  onReset,
  selectedFile,
  accept,
  maxFileSize,
  className = "",
  uploadIcon: UploadIcon = Upload,
  fileIcon: FileIconComponent = FileIcon,
  title = "Click to upload or drag and drop",
  description,
  fileId = "file-upload",
  validateFile,
  fileMetadata,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setError(null);

    // Check file size
    if (maxFileSize && file.size > maxFileSize) {
      setError(`File size exceeds the maximum allowed size of ${formatFileSize(maxFileSize)}`);
      return;
    }

    // Custom validation
    if (validateFile) {
      const validationResult = validateFile(file);
      if (validationResult !== true) {
        setError(typeof validationResult === "string" ? validationResult : "Invalid file type");
        return;
      }
    }

    onFileSelect(file);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleReset = () => {
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onReset) {
      onReset();
    }
  };

  return (
    <div className={className}>
      {!selectedFile && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInputChange}
            className="hidden"
            id={fileId}
          />
          <label htmlFor={fileId} className="cursor-pointer flex flex-col items-center gap-4">
            <UploadIcon className="size-12 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{title}</p>
              {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            </div>
          </label>
          {error && <p className="text-xs text-destructive mt-2">{error}</p>}
        </div>
      )}

      {selectedFile &&
        (() => {
          const metadata = fileMetadata ? fileMetadata(selectedFile) : null;
          return (
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <FileIconComponent className="size-5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                  {metadata && ` • ${metadata}`}
                </p>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={handleReset} className="shrink-0">
                <X className="size-4" />
              </Button>
            </div>
          );
        })()}
    </div>
  );
}
