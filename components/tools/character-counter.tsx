"use client";

import { useState, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export function CharacterCounter() {
  const [input, setInput] = useState("");

  const stats = useMemo(() => {
    const characters = input.length;
    const charactersNoSpaces = input.replace(/\s/g, "").length;
    const words = input.trim() === "" ? 0 : input.trim().split(/\s+/).length;
    const lines = input === "" ? 0 : input.split("\n").length;

    return {
      characters,
      charactersNoSpaces,
      words,
      lines,
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
          className="min-h-[200px] font-mono text-sm bg-muted border-border text-foreground"
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
    </div>
  );
}
