"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState("");
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
    <div className="space-y-4">
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
      <Button
        onClick={testRegex}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Test Regex
      </Button>
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
  );
}
