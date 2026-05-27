"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegexTester() {
  const [pattern, setPattern] = useState("\\b\\w+@\\w+\\.\\w+\\b");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState(
    "The quick brown fox jumps over the lazy dog. Email: test@example.com, Phone: 555-1234, Date: 2024-01-15",
  );
  const [matches, setMatches] = useState<string[]>([]);

  const testRegex = () => {
    try {
      const regex = new RegExp(pattern, flags);
      const results = testString.match(regex);
      setMatches(results || []);
    } catch (err) {
      setMatches([`Error: ${err instanceof Error ? err.message : "Invalid regex"}`]);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <div className="lg:col-span-3 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="regex-pattern" className="text-foreground">
              Regular Expression
            </Label>
            <Input
              id="regex-pattern"
              placeholder="/pattern/"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="font-mono bg-muted border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="regex-flags" className="text-foreground">
              Flags
            </Label>
            <Input
              id="regex-flags"
              placeholder="g, i, m..."
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              className="font-mono bg-muted border-border text-foreground"
            />
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <div className="flex gap-2 font-mono items-center">
                <code className="bg-muted px-2 py-1 rounded text-foreground">g</code>
                <span className="text-muted-foreground">Global (find all matches)</span>
              </div>
              <div className="flex gap-2 font-mono items-center">
                <code className="bg-muted px-2 py-1 rounded text-foreground">i</code>
                <span className="text-muted-foreground">Case insensitive</span>
              </div>
              <div className="flex gap-2 font-mono items-center">
                <code className="bg-muted px-2 py-1 rounded text-foreground">m</code>
                <span className="text-muted-foreground">Multiline (^ and $ match line breaks)</span>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="regex-test" className="text-foreground">
            Test String
          </Label>
          <Textarea
            id="regex-test"
            placeholder="Enter text to test against..."
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            className="min-h-[120px] font-mono text-sm bg-muted border-border text-foreground"
          />
        </div>
        <Button onClick={testRegex}>Test Regex</Button>
        <Card className="p-4 bg-card border-border">
          <p className="mb-2 text-sm font-medium text-foreground">Matches: {matches.length}</p>
          <div className="space-y-1">
            {matches.map((match, i) => (
              <div key={i} className="rounded bg-muted px-2 py-1 font-mono text-sm text-foreground">
                {match}
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="space-y-4">
        <Card className="p-4 bg-card border-border">
          <p className="text-sm font-semibold text-foreground mb-4 tracking-wide uppercase text-xs">Regex Hints</p>
          <div className="space-y-5 text-sm">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-3.5 rounded-full bg-blue-500/70" />
                <p className="font-medium text-foreground text-xs tracking-wide">Character Classes</p>
              </div>
              <div className="grid gap-1.5 font-mono text-xs">
                {[
                  [".", "Any char except newline"],
                  ["\\w", "Word char (a-z, 0-9, _)"],
                  ["\\d", "Digit (0–9)"],
                  ["\\s", "Whitespace"],
                  ["\\W", "Non-word char"],
                  ["\\D", "Non-digit"],
                  ["\\S", "Non-whitespace"],
                  ["[abc]", "Any of a, b, or c"],
                ].map(([token, desc]) => (
                  <div key={token} className="flex gap-2 items-baseline">
                    <code className="shrink-0 bg-muted px-1.5 py-0.5 rounded text-foreground min-w-[2.75rem] text-center">{token}</code>
                    <span className="text-muted-foreground leading-tight">{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border/50 pt-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-3.5 rounded-full bg-emerald-500/70" />
                <p className="font-medium text-foreground text-xs tracking-wide">Quantifiers</p>
              </div>
              <div className="grid gap-1.5 font-mono text-xs">
                {[
                  ["*", "Zero or more"],
                  ["+", "One or more"],
                  ["?", "Zero or one"],
                  ["{n}", "Exactly n times"],
                  ["{n,m}", "Between n and m"],
                ].map(([token, desc]) => (
                  <div key={token} className="flex gap-2 items-baseline">
                    <code className="shrink-0 bg-muted px-1.5 py-0.5 rounded text-foreground min-w-[2.75rem] text-center">{token}</code>
                    <span className="text-muted-foreground leading-tight">{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border/50 pt-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-3.5 rounded-full bg-amber-500/70" />
                <p className="font-medium text-foreground text-xs tracking-wide">Anchors & Boundaries</p>
              </div>
              <div className="grid gap-1.5 font-mono text-xs">
                {[
                  ["^", "Start of string"],
                  ["$", "End of string"],
                  ["\\b", "Word boundary"],
                  ["\\B", "Non-word boundary"],
                ].map(([token, desc]) => (
                  <div key={token} className="flex gap-2 items-baseline">
                    <code className="shrink-0 bg-muted px-1.5 py-0.5 rounded text-foreground min-w-[2.75rem] text-center">{token}</code>
                    <span className="text-muted-foreground leading-tight">{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border/50 pt-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-3.5 rounded-full bg-violet-500/70" />
                <p className="font-medium text-foreground text-xs tracking-wide">Groups & Alternation</p>
              </div>
              <div className="grid gap-1.5 font-mono text-xs">
                {[
                  ["(abc)", "Capture group"],
                  ["(?:abc)", "Non-capturing group"],
                  ["a|b", "a or b"],
                ].map(([token, desc]) => (
                  <div key={token} className="flex gap-2 items-baseline">
                    <code className="shrink-0 bg-muted px-1.5 py-0.5 rounded text-foreground min-w-[2.75rem] text-center">{token}</code>
                    <span className="text-muted-foreground leading-tight">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
