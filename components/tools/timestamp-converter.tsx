"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function TimestampConverter() {
  const [timestamp, setTimestamp] = useState(Date.now().toString());
  const [dateTime, setDateTime] = useState(new Date().toISOString());

  const convertTimestamp = (ts: string) => {
    setTimestamp(ts);
    const date = new Date(Number.parseInt(ts));
    setDateTime(date.toISOString());
  };

  const convertDateTime = (dt: string) => {
    setDateTime(dt);
    const date = new Date(dt);
    setTimestamp(date.getTime().toString());
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="timestamp" className="text-foreground">
          Unix Timestamp (ms)
        </Label>
        <Input
          id="timestamp"
          value={timestamp}
          onChange={(e) => convertTimestamp(e.target.value)}
          className="font-mono bg-muted border-border text-foreground"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="datetime" className="text-foreground">
          ISO 8601 DateTime
        </Label>
        <Input
          id="datetime"
          value={dateTime}
          onChange={(e) => convertDateTime(e.target.value)}
          className="font-mono bg-muted border-border text-foreground"
        />
      </div>
      <Button
        onClick={() => {
          const now = Date.now().toString();
          convertTimestamp(now);
        }}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Use Current Time
      </Button>
    </div>
  );
}
