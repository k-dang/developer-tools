"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function UrlTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const encode = () => {
    setOutput(encodeURIComponent(input));
  };

  const decode = () => {
    try {
      setOutput(decodeURIComponent(input));
    } catch (err) {
      setOutput(`Error: ${err instanceof Error ? err.message : "Decoding failed"}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="url-input" className="text-foreground">
          Input URL
        </Label>
        <Textarea
          id="url-input"
          placeholder="Enter URL to encode/decode..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[150px] font-mono text-sm bg-muted border-border text-foreground"
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={encode}>Encode</Button>
        <Button onClick={decode} variant="outline">
          Decode
        </Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="url-output" className="text-foreground">
          Output
        </Label>
        <Textarea
          id="url-output"
          value={output}
          readOnly
          className="min-h-[150px] font-mono text-sm bg-card border-border text-foreground"
        />
      </div>
    </div>
  );
}
