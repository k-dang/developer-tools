"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function JwtDecoder() {
  const [token, setToken] = useState("");
  const [header, setHeader] = useState("");
  const [payload, setPayload] = useState("");

  const decodeJwt = () => {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format");
      }

      const decodedHeader = JSON.parse(atob(parts[0]));
      const decodedPayload = JSON.parse(atob(parts[1]));

      setHeader(JSON.stringify(decodedHeader, null, 2));
      setPayload(JSON.stringify(decodedPayload, null, 2));
    } catch (err) {
      setHeader(`Error: ${err instanceof Error ? err.message : "Decoding failed"}`);
      setPayload("");
    }
  };

  return (
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
          className="min-h-[100px] font-mono text-sm bg-muted border-border text-foreground"
        />
      </div>
      <Button onClick={decodeJwt}>Decode JWT</Button>
      <div className="space-y-2">
        <Label htmlFor="jwt-header" className="text-foreground">
          Header
        </Label>
        <Textarea
          id="jwt-header"
          value={header}
          readOnly
          className="min-h-[120px] font-mono text-sm bg-card border-border text-foreground"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="jwt-payload" className="text-foreground">
          Payload
        </Label>
        <Textarea
          id="jwt-payload"
          value={payload}
          readOnly
          className="min-h-[120px] font-mono text-sm bg-card border-border text-foreground"
        />
      </div>
    </div>
  );
}
