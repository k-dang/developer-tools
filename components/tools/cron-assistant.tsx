"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";
import cronstrue from "cronstrue";
import { CronExpressionParser } from "cron-parser";

type Preset = {
  label: string;
  expression: string;
};

const presets: Preset[] = [
  { label: "Every minute", expression: "* * * * *" },
  { label: "Every 5 minutes", expression: "*/5 * * * *" },
  { label: "Hourly", expression: "0 * * * *" },
  { label: "Daily at midnight", expression: "0 0 * * *" },
  { label: "Weekly on Monday", expression: "0 0 * * 1" },
  { label: "Monthly on 1st", expression: "0 0 1 * *" },
];

const formatDate = (date: Date) => {
  return date.toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const initialExpression = "* * * * *";

const getNextFiveRuns = (expression: string) => {
  const interval = CronExpressionParser.parse(expression);
  const runs = [];
  for (let i = 0; i < 5; i++) {
    const next = interval.next();
    runs.push(next.toDate());
  }
  return runs;
};

export function CronAssistant() {
  const [expression, setExpression] = useState(initialExpression);
  const [humanReadable, setHumanReadable] = useState(cronstrue.toString(initialExpression));
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState("");
  const [nextRuns, setNextRuns] = useState<Date[]>(getNextFiveRuns(initialExpression));

  const parseExpression = (cronExpr: string) => {
    try {
      const humanReadableDescription = cronstrue.toString(cronExpr, {
        throwExceptionOnParseError: false,
      });

      setHumanReadable(humanReadableDescription);
      setIsValid(true);
      setError("");

      setNextRuns(getNextFiveRuns(cronExpr));
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : "Invalid cron expression");
      setHumanReadable("");
      setNextRuns([]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cron-expression" className="text-foreground">
          Cron Expression
        </Label>
        <div className="flex gap-2">
          <Input
            id="cron-expression"
            value={expression}
            onChange={(e) => {
              const newValue = e.target.value;
              setExpression(newValue);
              parseExpression(newValue);
            }}
            placeholder="* * * * *"
            className="font-mono bg-muted border-border text-foreground"
          />
          <CopyButton textToCopy={expression} />
        </div>
        <div className="text-sm text-muted-foreground space-y-1 mt-2">
          <p className="font-semibold text-foreground">Cron Format:</p>
          <div className="text-xs space-y-0.5 pl-2">
            <p>
              Format:{" "}
              <span className="font-mono text-foreground">minute hour day month weekday</span>
            </p>
            <p>• Minute: 0-59</p>
            <p>• Hour: 0-23</p>
            <p>• Day of month: 1-31</p>
            <p>• Month: 1-12</p>
            <p>• Day of week: 0-7 (0 or 7 = Sunday)</p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Special characters: <span className="font-mono">*</span> (any),{" "}
            <span className="font-mono">,</span> (list), <span className="font-mono">-</span>{" "}
            (range), <span className="font-mono">/</span> (step)
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Quick Presets</Label>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.expression}
              onClick={() => {
                setExpression(preset.expression);
                parseExpression(preset.expression);
              }}
              variant="outline"
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Status</Label>
        <div className="flex items-center gap-2">
          {isValid ? (
            <>
              <CheckCircle2 className="size-5 text-green-500" />
              <span className="text-green-500">Valid</span>
            </>
          ) : (
            <>
              <XCircle className="size-5 text-red-500" />
              <span className="text-red-500">Invalid</span>
            </>
          )}
        </div>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>

      {isValid && humanReadable && (
        <div className="space-y-2">
          <Label className="text-foreground">Human-Readable Schedule</Label>
          <div className="p-3 bg-card border border-border rounded-md">
            <p className="text-foreground">{humanReadable}</p>
          </div>
        </div>
      )}

      {isValid && nextRuns.length > 0 && (
        <div className="space-y-2">
          <Label className="text-foreground">Next 5 Execution Times</Label>
          <div className="space-y-1">
            {nextRuns.map((date, index) => (
              <div
                key={index}
                className="p-2 bg-card border border-border rounded-md font-mono text-sm text-foreground"
              >
                {formatDate(date)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
