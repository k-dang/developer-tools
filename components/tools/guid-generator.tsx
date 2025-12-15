"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/ui/copy-button";

export function GuidGenerator() {
  const [guid, setGuid] = useState("");

  const generateGuid = () => {
    try {
      const newGuid = crypto.randomUUID();
      setGuid(newGuid);
    } catch (err) {
      setGuid(`Error: ${err instanceof Error ? err.message : "GUID generation failed"}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="guid-output" className="text-foreground">
          Generated GUID
        </Label>
        <div className="flex gap-2">
          <Input
            id="guid-output"
            value={guid}
            readOnly
            placeholder="Click 'Generate GUID' to create a new GUID"
            className="font-mono bg-card border-border text-foreground"
          />
          <CopyButton textToCopy={guid} />
        </div>
      </div>
      <Button onClick={generateGuid}>Generate GUID</Button>
    </div>
  );
}
