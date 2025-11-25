"use client";

import { useState } from "react";
import { Card } from "../ui/card";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

export function TextDiffer() {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");

  const getCharacterDiff = (str1: string, str2: string) => {
    const result: { type: "added" | "removed" | "unchanged"; value: string }[] = [];
    const len1 = str1.length;
    const len2 = str2.length;
    const maxLen = Math.max(len1, len2);

    let i = 0;
    let j = 0;

    while (i < len1 || j < len2) {
      if (i < len1 && j < len2 && str1[i] === str2[j]) {
        // Characters match
        let unchanged = "";
        while (i < len1 && j < len2 && str1[i] === str2[j]) {
          unchanged += str1[i];
          i++;
          j++;
        }
        result.push({ type: "unchanged", value: unchanged });
      } else {
        // Characters differ
        if (i < len1) {
          let removed = "";
          while (i < len1 && (j >= len2 || str1[i] !== str2[j])) {
            removed += str1[i];
            i++;
            if (j < len2 && str1[i] === str2[j]) break;
          }
          if (removed) result.push({ type: "removed", value: removed });
        }
        if (j < len2) {
          let added = "";
          while (j < len2 && (i >= len1 || str2[j] !== str1[i])) {
            added += str2[j];
            j++;
            if (i < len1 && str2[j] === str1[i]) break;
          }
          if (added) result.push({ type: "added", value: added });
        }
      }
    }

    return result;
  };

  const differences = getCharacterDiff(text1, text2);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="text1" className="text-foreground">
            Original Text
          </Label>
          <Textarea
            id="text1"
            placeholder="Paste original text here..."
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            className="min-h-[200px] font-mono text-sm bg-muted border-border text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="text2" className="text-foreground">
            Modified Text
          </Label>
          <Textarea
            id="text2"
            placeholder="Paste modified text here..."
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            className="min-h-[200px] font-mono text-sm bg-muted border-border text-foreground"
          />
        </div>
      </div>
      {(text1 || text2) && (
        <div className="space-y-2">
          <Label className="text-foreground">Character Differences (Real-time)</Label>
          <Card className="p-4 bg-card border-border max-h-[400px] overflow-auto">
            <div className="font-mono text-sm whitespace-pre-wrap break-words">
              {differences.map((diff, i) => (
                <span
                  key={i}
                  className={`${
                    diff.type === "added"
                      ? "bg-green-500/30 text-green-300"
                      : diff.type === "removed"
                        ? "bg-red-500/30 text-red-300 line-through"
                        : "text-foreground"
                  }`}
                >
                  {diff.value}
                </span>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
