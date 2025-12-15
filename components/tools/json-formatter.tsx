"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
    } catch (err) {
      setOutput(`Error: ${err instanceof Error ? err.message : "Invalid JSON"}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="json-input" className="text-foreground">
          Input JSON
        </Label>
        <Textarea
          id="json-input"
          placeholder="Paste your JSON here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[200px] font-mono text-sm bg-muted border-border text-foreground"
        />
      </div>
      <Button onClick={formatJson}>Format JSON</Button>
      <div className="space-y-2">
        <Label htmlFor="json-output" className="text-foreground">
          Formatted Output
        </Label>
        <Textarea
          id="json-output"
          value={output}
          readOnly
          className="min-h-[200px] font-mono text-sm bg-card border-border text-foreground"
        />
      </div>
    </div>
  );
}
