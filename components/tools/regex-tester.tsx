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
  const [testString, setTestString] = useState("The quick brown fox jumps over the lazy dog. Email: test@example.com, Phone: 555-1234, Date: 2024-01-15");
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
        <Card className="p-4 bg-card border-border h-full">
          <p className="text-sm font-medium text-foreground mb-4">Regex Hints</p>
          <div className="space-y-4 text-sm overflow-y-auto max-h-[600px] pr-2">
            <div>
              <p className="font-medium mb-2 text-foreground">Character Classes</p>
              <div className="grid gap-2 font-mono text-xs">
                <div className="flex gap-2 items-center">
                  <code className="bg-muted px-2 py-1 rounded text-foreground">.</code>
                  <span className="text-muted-foreground">Any character except newline</span>
                </div>
                <div className="flex gap-2 items-center">
                  <code className="bg-muted px-2 py-1 rounded text-foreground">\w</code>
                  <span className="text-muted-foreground">Word character (a-z, A-Z, 0-9, _)</span>
                </div>
                <div className="flex gap-2 items-center">
                  <code className="bg-muted px-2 py-1 rounded text-foreground">\d</code>
                  <span className="text-muted-foreground">Digit (0-9)</span>
                </div>
                <div className="flex gap-2 items-center">
                  <code className="bg-muted px-2 py-1 rounded text-foreground">\s</code>
                  <span className="text-muted-foreground">Whitespace character</span>
                </div>
                <div className="flex gap-2 items-center">
                  <code className="bg-muted px-2 py-1 rounded text-foreground">\W</code>
                  <span className="text-muted-foreground">Non-word character</span>
                </div>
                <div className="flex gap-2 items-center">
                  <code className="bg-muted px-2 py-1 rounded text-foreground">\D</code>
                  <span className="text-muted-foreground">Non-digit</span>
                </div>
                <div className="flex gap-2 items-center">
                  <code className="bg-muted px-2 py-1 rounded text-foreground">\S</code>
                  <span className="text-muted-foreground">Non-whitespace</span>
                </div>
                <div className="flex gap-2 items-center">
                  <code className="bg-muted px-2 py-1 rounded text-foreground">[abc]</code>
                  <span className="text-muted-foreground">Any of a, b, or c</span>
                </div>
              </div>
            </div>
            <div>
              <p className="font-medium mb-2 text-foreground">Quantifiers</p>
              <div className="grid gap-2 font-mono text-xs">
                <div className="flex gap-2 items-center">
                  <code className="bg-muted px-2 py-1 rounded text-foreground">*</code>
                  <span className="text-muted-foreground">Zero or more</span>
                </div>
                <div className="flex gap-2 items-center">
                  <code className="bg-muted px-2 py-1 rounded text-foreground">+</code>
                  <span className="text-muted-foreground">One or more</span>
                </div>
                <div className="flex gap-2 items-center">
                  <code className="bg-muted px-2 py-1 rounded text-foreground">?</code>
                  <span className="text-muted-foreground">Zero or one</span>
                </div>
                <div className="flex gap-2 items-center">
                  <code className="bg-muted px-2 py-1 rounded text-foreground">{`{n}`}</code>
                  <span className="text-muted-foreground">Exactly n times</span>
                </div>
                <div className="flex gap-2 items-center">
                  <code className="bg-muted px-2 py-1 rounded text-foreground">{`{n,m}`}</code>
                  <span className="text-muted-foreground">Between n and m times</span>
                </div>
              </div>
            </div>
            <div>
              <p className="font-medium mb-2 text-foreground">Anchors & Boundaries</p>
              <div className="grid gap-2 font-mono text-xs">
                <div className="flex gap-2 items-center">
                  <code className="bg-muted px-2 py-1 rounded text-foreground">^</code>
                  <span className="text-muted-foreground">Start of string</span>
                </div>
                <div className="flex gap-2 items-center">
                  <code className="bg-muted px-2 py-1 rounded text-foreground">$</code>
                  <span className="text-muted-foreground">End of string</span>
                </div>
                <div className="flex gap-2 items-center">
                  <code className="bg-muted px-2 py-1 rounded text-foreground">\b</code>
                  <span className="text-muted-foreground">Word boundary</span>
                </div>
                <div className="flex gap-2 items-center">
                  <code className="bg-muted px-2 py-1 rounded text-foreground">\B</code>
                  <span className="text-muted-foreground">Non-word boundary</span>
                </div>
              </div>
            </div>
            <div>
              <p className="font-medium mb-2 text-foreground">Groups & Alternation</p>
              <div className="grid gap-2 font-mono text-xs">
                <div className="flex gap-2 items-center">
                  <code className="bg-muted px-2 py-1 rounded text-foreground">(abc)</code>
                  <span className="text-muted-foreground">Capture group</span>
                </div>
                <div className="flex gap-2 items-center">
                  <code className="bg-muted px-2 py-1 rounded text-foreground">(?:abc)</code>
                  <span className="text-muted-foreground">Non-capturing group</span>
                </div>
                <div className="flex gap-2 items-center">
                  <code className="bg-muted px-2 py-1 rounded text-foreground">a|b</code>
                  <span className="text-muted-foreground">a or b</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
