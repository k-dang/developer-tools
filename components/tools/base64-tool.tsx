"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function Base64Tool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const encode = () => {
    try {
      setOutput(btoa(input));
    } catch (err) {
      setOutput(`Error: ${err instanceof Error ? err.message : "Encoding failed"}`);
    }
  };

  const decode = () => {
    try {
      setOutput(atob(input));
    } catch (err) {
      setOutput(`Error: ${err instanceof Error ? err.message : "Decoding failed"}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="base64-input" className="text-foreground">
          Input
        </Label>
        <Textarea
          id="base64-input"
          placeholder="Enter text to encode/decode..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[150px] font-mono text-sm bg-muted border-border text-foreground"
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={encode} className="bg-primary text-primary-foreground hover:bg-primary/90">
          Encode
        </Button>
        <Button
          onClick={decode}
          variant="outline"
          className="border-border text-foreground hover:bg-muted bg-transparent"
        >
          Decode
        </Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="base64-output" className="text-foreground">
          Output
        </Label>
        <Textarea
          id="base64-output"
          value={output}
          readOnly
          className="min-h-[150px] font-mono text-sm bg-card border-border text-foreground"
        />
      </div>
    </div>
  );
}
