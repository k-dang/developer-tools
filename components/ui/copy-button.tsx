"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2 } from "lucide-react";

interface CopyButtonProps {
  textToCopy: string;
  onCopy?: () => void;
  showText?: boolean;
  successDuration?: number;
  className?: string;
}

export function CopyButton({
  textToCopy,
  onCopy,
  showText = false,
  successDuration = 2000,
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      onCopy?.();

      setTimeout(() => {
        setCopied(false);
      }, successDuration);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <Button
      onClick={handleCopy}
      disabled={!textToCopy}
      variant="outline"
      size="icon"
      className={className}
    >
      <span className="relative inline-flex items-center justify-center">
        <Copy
          className={`size-4 transition-all duration-300 ${
            copied ? "scale-0 opacity-0 absolute" : "scale-100 opacity-100"
          }`}
        />
        <CheckCircle2
          className={`size-4 text-green-500 transition-all duration-300 ${
            copied ? "scale-100 opacity-100" : "scale-0 opacity-0 absolute"
          }`}
        />
      </span>
      {showText && <span className="ml-2">{copied ? "Copied!" : "Copy"}</span>}
    </Button>
  );
}

