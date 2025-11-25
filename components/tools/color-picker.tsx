"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ColorPicker() {
  const [hex, setHex] = useState("#3b82f6");
  const [rgb, setRgb] = useState("");
  const [hsl, setHsl] = useState("");

  const convertColor = (hexValue: string) => {
    setHex(hexValue);

    // Convert to RGB
    const r = Number.parseInt(hexValue.slice(1, 3), 16);
    const g = Number.parseInt(hexValue.slice(3, 5), 16);
    const b = Number.parseInt(hexValue.slice(5, 7), 16);
    setRgb(`rgb(${r}, ${g}, ${b})`);

    // Convert to HSL
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    const l = (max + min) / 2;

    let h = 0;
    let s = 0;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case rNorm:
          h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6;
          break;
        case gNorm:
          h = ((bNorm - rNorm) / d + 2) / 6;
          break;
        case bNorm:
          h = ((rNorm - gNorm) / d + 4) / 6;
          break;
      }
    }

    setHsl(`hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="color-picker" className="text-foreground">
          Pick a Color
        </Label>
        <div className="flex gap-4">
          <input
            id="color-picker"
            type="color"
            value={hex}
            onChange={(e) => convertColor(e.target.value)}
            className="h-20 w-20 cursor-pointer rounded-lg border-2 border-border"
          />
          <div
            className="flex-1 rounded-lg border-2 border-border"
            style={{ backgroundColor: hex }}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="hex-value" className="text-foreground">
          HEX
        </Label>
        <Input
          id="hex-value"
          value={hex}
          onChange={(e) => convertColor(e.target.value)}
          className="font-mono bg-muted border-border text-foreground"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="rgb-value" className="text-foreground">
          RGB
        </Label>
        <Input
          id="rgb-value"
          value={rgb}
          readOnly
          className="font-mono bg-card border-border text-foreground"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="hsl-value" className="text-foreground">
          HSL
        </Label>
        <Input
          id="hsl-value"
          value={hsl}
          readOnly
          className="font-mono bg-card border-border text-foreground"
        />
      </div>
    </div>
  );
}
