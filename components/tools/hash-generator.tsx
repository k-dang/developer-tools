"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function HashGenerator() {
  const [input, setInput] = useState("");
  const [hash, setHash] = useState("");

  const generateHash = async () => {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      setHash(hashHex);
    } catch (err) {
      setHash(`Error: ${err instanceof Error ? err.message : "Hash generation failed"}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="hash-input" className="text-foreground">
          Input Text
        </Label>
        <Textarea
          id="hash-input"
          placeholder="Enter text to hash..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[150px] font-mono text-sm bg-muted border-border text-foreground"
        />
      </div>
      <Button onClick={generateHash}>Generate SHA-256 Hash</Button>
      <div className="space-y-2">
        <Label htmlFor="hash-output" className="text-foreground">
          SHA-256 Hash
        </Label>
        <Input
          id="hash-output"
          value={hash}
          readOnly
          className="font-mono bg-card border-border text-foreground"
        />
      </div>
    </div>
  );
}
