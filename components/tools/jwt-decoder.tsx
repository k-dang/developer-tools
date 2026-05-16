"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const INITIAL_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30";

function decodeToken(input: string) {
  try {
    const parts = input.split(".");
    if (parts.length !== 3) throw new Error("Invalid JWT format");
    return {
      header: JSON.stringify(JSON.parse(atob(parts[0])), null, 2),
      payload: JSON.stringify(JSON.parse(atob(parts[1])), null, 2),
    };
  } catch (err) {
    return {
      header: `Error: ${err instanceof Error ? err.message : "Decoding failed"}`,
      payload: "",
    };
  }
}

const initial = decodeToken(INITIAL_TOKEN);

export function JwtDecoder() {
  const [token, setToken] = useState(INITIAL_TOKEN);
  const [header, setHeader] = useState(initial.header);
  const [payload, setPayload] = useState(initial.payload);

  const decodeJwt = () => {
    const result = decodeToken(token);
    setHeader(result.header);
    setPayload(result.payload);
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="jwt-input" className="text-foreground">
            JWT Token
          </Label>
          <Textarea
            id="jwt-input"
            placeholder="Paste JWT token here..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="min-h-[200px] font-mono text-sm bg-muted border-border text-foreground"
          />
        </div>
        <Button onClick={decodeJwt}>Decode JWT</Button>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-foreground">Header</Label>
          <SyntaxHighlighter
            language="json"
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              borderRadius: "0.5rem",
              fontSize: "0.85rem",
              lineHeight: "1.5",
              minHeight: "120px",
              border: "1px solid hsl(var(--border))",
            }}
          >
            {header || " "}
          </SyntaxHighlighter>
        </div>
        <div className="space-y-2">
          <Label className="text-foreground">Payload</Label>
          <SyntaxHighlighter
            language="json"
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              borderRadius: "0.5rem",
              fontSize: "0.85rem",
              lineHeight: "1.5",
              minHeight: "120px",
              border: "1px solid hsl(var(--border))",
            }}
          >
            {payload || " "}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}
