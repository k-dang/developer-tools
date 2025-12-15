"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

const formatLocalISO = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const milliseconds = date.getMilliseconds().toString().padStart(3, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
};

export function TimestampConverter() {
  const initialDate = new Date();
  const [timestamp, setTimestamp] = useState(() => Date.now().toString());
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [utcTime, setUtcTime] = useState(() => initialDate.toISOString());
  const [localTime, setLocalTime] = useState(() => formatLocalISO(initialDate));

  const updateTimes = (date: Date) => {
    setSelectedDate(date);
    setUtcTime(date.toISOString());
    setLocalTime(formatLocalISO(date));
  };

  const convertTimestamp = (ts: string) => {
    setTimestamp(ts);
    const date = new Date(Number.parseInt(ts));
    if (!Number.isNaN(date.getTime())) {
      updateTimes(date);
    }
  };

  const convertUtcTime = (utc: string) => {
    setUtcTime(utc);
    const date = new Date(utc);
    if (!Number.isNaN(date.getTime())) {
      setTimestamp(date.getTime().toString());
      setSelectedDate(date);
      setLocalTime(formatLocalISO(date));
    }
  };

  const convertLocalTime = (local: string) => {
    setLocalTime(local);
    // Parse ISO 8601 with timezone offset
    const date = new Date(local);
    if (!Number.isNaN(date.getTime())) {
      setTimestamp(date.getTime().toString());
      setSelectedDate(date);
      setUtcTime(date.toISOString());
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Set time to current time if selecting from calendar
      const now = new Date();
      date.setHours(now.getHours());
      date.setMinutes(now.getMinutes());
      date.setSeconds(now.getSeconds());
      date.setMilliseconds(now.getMilliseconds());
      convertTimestamp(date.getTime().toString());
    }
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
        <Label htmlFor="utc" className="text-foreground">
          UTC Time
        </Label>
        <Input
          id="utc"
          value={utcTime}
          onChange={(e) => convertUtcTime(e.target.value)}
          className="font-mono bg-muted border-border text-foreground"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="local" className="text-foreground">
          Local Time
        </Label>
        <Input
          id="local"
          value={localTime}
          onChange={(e) => convertLocalTime(e.target.value)}
          className="font-mono bg-muted border-border text-foreground"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="local" className="text-foreground">
          Select Date
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(selectedDate, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <Button
        onClick={() => {
          const now = Date.now().toString();
          convertTimestamp(now);
        }}
      >
        Use Current Time
      </Button>
    </div>
  );
}
