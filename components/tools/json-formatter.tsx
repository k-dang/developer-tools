"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const JSON_PLACEHOLDER = `{"name":"Ada Lovelace","role":"developer","tools":["json","graphql"],"active":true}`;

export function JsonFormatter() {
  const [input, setInput] = useState(JSON_PLACEHOLDER);
  const [output, setOutput] = useState(JSON.stringify(JSON.parse(JSON_PLACEHOLDER), null, 2));

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
        <Label className="text-foreground">Formatted Output</Label>
        <SyntaxHighlighter
          language="json"
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            borderRadius: "0.5rem",
            fontSize: "0.85rem",
            lineHeight: "1.5",
            minHeight: "200px",
            border: "1px solid hsl(var(--border))",
          }}
          showLineNumbers
        >
          {output || " "}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
