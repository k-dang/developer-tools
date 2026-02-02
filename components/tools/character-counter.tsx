"use client";

import { useState, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const lineColors = [
  "bg-red-500/20",
  "bg-orange-500/20",
  "bg-yellow-500/20",
  "bg-green-500/20",
  "bg-blue-500/20",
  "bg-purple-500/20",
  "bg-pink-500/20",
];

export function CharacterCounter() {
  const [input, setInput] = useState("");

  const lines = useMemo(() => {
    if (input === "") return [];
    return input.split("\n");
  }, [input]);

  const stats = useMemo(() => {
    const characters = input.length;
    const charactersNoSpaces = input.replace(/\s/g, "").length;
    const words = input.trim() === "" ? 0 : input.trim().split(/\s+/).length;
    const lineCount = input === "" ? 0 : input.split("\n").length;

    return {
      characters,
      charactersNoSpaces,
      words,
      lines: lineCount,
    };
  }, [input]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="character-counter-input" className="text-foreground">
          Input
        </Label>
        <Textarea
          id="character-counter-input"
          placeholder="Enter text to count characters..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[200px] font-mono text-sm bg-muted border-border text-foreground break-all"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent>
            <div className="text-sm text-muted-foreground">Characters</div>
            <div className="text-2xl font-semibold mt-1">{stats.characters.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-sm text-muted-foreground">Characters (no spaces)</div>
            <div className="text-2xl font-semibold mt-1">
              {stats.charactersNoSpaces.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-sm text-muted-foreground">Words</div>
            <div className="text-2xl font-semibold mt-1">{stats.words.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-sm text-muted-foreground">Lines</div>
            <div className="text-2xl font-semibold mt-1">{stats.lines.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>
      {lines.length > 0 && (
        <div className="space-y-2">
          <Label className="text-foreground">Lines Preview</Label>
          <div className="rounded-md border border-border p-3 font-mono text-sm">
            {lines.map((line, index) => (
              <div
                key={index}
                className={`${lineColors[index % lineColors.length]} break-all whitespace-pre-wrap px-1`}
              >
                {line ? line.replace(/ /g, "·") : "\u00A0"}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
