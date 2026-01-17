"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ParsedCSV = {
  headers: string[];
  rows: string[][];
};

type DiffRow = {
  key: string;
  left?: string[];
  right?: string[];
  status: "unchanged" | "added" | "removed" | "changed";
};

const ROW_INDEX_OPTION = "Row Index";

function parseLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === "\"") {
      const nextChar = line[i + 1];
      if (inQuotes && nextChar === "\"") {
        current += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

function parseCSV(text: string): ParsedCSV {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const parsedLines = lines.map(parseLine);
  const [headerRow, ...rows] = parsedLines;
  return {
    headers: headerRow,
    rows,
  };
}

function getMaxColumns(csv: ParsedCSV) {
  const rowMax = csv.rows.reduce((max, row) => Math.max(max, row.length), 0);
  return Math.max(csv.headers.length, rowMax);
}

function areRowsEqual(left?: string[], right?: string[]) {
  if (!left || !right) return false;
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

function getRowKey(row: string[], index: number, headers: string[], keyColumn: string) {
  if (keyColumn === ROW_INDEX_OPTION) {
    return String(index + 1);
  }

  const columnIndex = headers.indexOf(keyColumn);
  if (columnIndex === -1) {
    return String(index + 1);
  }

  return row[columnIndex] ?? String(index + 1);
}

function buildDiff(leftCSV: ParsedCSV, rightCSV: ParsedCSV, keyColumn: string) {
  const useRowIndex = keyColumn === ROW_INDEX_OPTION || !keyColumn;
  const diffRows: DiffRow[] = [];

  if (useRowIndex) {
    const maxLength = Math.max(leftCSV.rows.length, rightCSV.rows.length);

    for (let i = 0; i < maxLength; i += 1) {
      const left = leftCSV.rows[i];
      const right = rightCSV.rows[i];
      const status = left && right ? (areRowsEqual(left, right) ? "unchanged" : "changed") : left ? "removed" : "added";

      diffRows.push({
        key: String(i + 1),
        left,
        right,
        status,
      });
    }
  } else {
    const leftMap = new Map<string, string[]>();
    const rightMap = new Map<string, string[]>();

    leftCSV.rows.forEach((row, index) => {
      leftMap.set(getRowKey(row, index, leftCSV.headers, keyColumn), row);
    });

    rightCSV.rows.forEach((row, index) => {
      rightMap.set(getRowKey(row, index, rightCSV.headers, keyColumn), row);
    });

    const keys = Array.from(new Set([...leftMap.keys(), ...rightMap.keys()]));
    keys.forEach((key) => {
      const left = leftMap.get(key);
      const right = rightMap.get(key);
      const status = left && right ? (areRowsEqual(left, right) ? "unchanged" : "changed") : left ? "removed" : "added";

      diffRows.push({ key, left, right, status });
    });
  }

  const summary = {
    added: diffRows.filter((row) => row.status === "added").length,
    removed: diffRows.filter((row) => row.status === "removed").length,
    changed: diffRows.filter((row) => row.status === "changed").length,
    total: diffRows.length,
  };

  return { diffRows, summary };
}

function getRowClass(status: DiffRow["status"], variant: "left" | "right") {
  if (status === "unchanged") return "";
  if (status === "changed") return "bg-amber-500/10 text-foreground";
  if (status === "added") return variant === "right" ? "bg-emerald-500/10 text-foreground" : "bg-muted text-muted-foreground";
  return variant === "left" ? "bg-destructive/10 text-foreground" : "bg-muted text-muted-foreground";
}

export function CsvCompare() {
  const [csvLeft, setCsvLeft] = useState("");
  const [csvRight, setCsvRight] = useState("");
  const [keyColumn, setKeyColumn] = useState<string>(ROW_INDEX_OPTION);

  const parsedLeft = useMemo(() => parseCSV(csvLeft), [csvLeft]);
  const parsedRight = useMemo(() => parseCSV(csvRight), [csvRight]);
  const { diffRows, summary } = useMemo(
    () => buildDiff(parsedLeft, parsedRight, keyColumn),
    [parsedLeft, parsedRight, keyColumn],
  );

  const columnCount = Math.max(1, getMaxColumns(parsedLeft), getMaxColumns(parsedRight));
  const baseHeaders = parsedLeft.headers.length ? parsedLeft.headers : parsedRight.headers;
  const headers = baseHeaders.length
    ? Array.from({ length: columnCount }, (_, index) => baseHeaders[index] ?? `Column ${index + 1}`)
    : Array.from({ length: columnCount }, (_, index) => `Column ${index + 1}`);

  const keyOptions = [ROW_INDEX_OPTION, ...Array.from(new Set([...parsedLeft.headers, ...parsedRight.headers].filter(Boolean)))]
    .filter(Boolean)
    .map((option) => option || ROW_INDEX_OPTION);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setter(String(e.target?.result ?? ""));
    };
    reader.readAsText(file);
  };

  const renderCells = (row?: string[]) => {
    const cells = row ?? [];
    return Array.from({ length: headers.length }, (_, index) => (
      <td key={index} className="px-3 py-2 border-b border-border align-top">
        <div className="text-xs text-foreground/90 whitespace-pre-wrap break-words">
          {cells[index] ?? ""}
        </div>
      </td>
    ));
  };

  const renderPlaceholderRow = (
    key: string,
    message: string,
    status: DiffRow["status"],
    variant: "left" | "right",
  ) => (
    <tr key={key} className={getRowClass(status, variant)}>
      <td className="px-3 py-2 border-b border-border text-xs text-muted-foreground" colSpan={headers.length}>
        {message}
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4 space-y-3 bg-card border-border">
          <div className="flex items-center justify-between">
            <Label htmlFor="csv-left" className="text-foreground">
              Dataset A
            </Label>
            <Input
              id="csv-left-upload"
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => handleFileUpload(event, setCsvLeft)}
              className="max-w-[200px] text-sm"
            />
          </div>
          <Textarea
            id="csv-left"
            placeholder="Paste or upload your first CSV..."
            value={csvLeft}
            onChange={(e) => setCsvLeft(e.target.value)}
            className="min-h-[180px] font-mono text-sm bg-muted border-border text-foreground"
          />
        </Card>
        <Card className="p-4 space-y-3 bg-card border-border">
          <div className="flex items-center justify-between">
            <Label htmlFor="csv-right" className="text-foreground">
              Dataset B
            </Label>
            <Input
              id="csv-right-upload"
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => handleFileUpload(event, setCsvRight)}
              className="max-w-[200px] text-sm"
            />
          </div>
          <Textarea
            id="csv-right"
            placeholder="Paste or upload your second CSV..."
            value={csvRight}
            onChange={(e) => setCsvRight(e.target.value)}
            className="min-h-[180px] font-mono text-sm bg-muted border-border text-foreground"
          />
        </Card>
      </div>

      <Card className="p-4 space-y-4 bg-card border-border">
        <div className="grid gap-4 md:grid-cols-2 md:items-center">
          <div className="space-y-2">
            <Label htmlFor="key-column" className="text-foreground">
              Match rows by
            </Label>
            <select
              id="key-column"
              value={keyColumn}
              onChange={(e) => setKeyColumn(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {keyOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-foreground">
            <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
              <span className="inline-block h-3 w-3 rounded-full bg-emerald-400/70" />
              <span>Added: {summary.added}</span>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
              <span className="inline-block h-3 w-3 rounded-full bg-destructive" />
              <span>Removed: {summary.removed}</span>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
              <span className="inline-block h-3 w-3 rounded-full bg-amber-400" />
              <span>Changed: {summary.changed}</span>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
              <span className="inline-block h-3 w-3 rounded-full bg-foreground/60" />
              <span>Total Compared: {summary.total}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4 bg-card border-border space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Dataset A</h3>
            <Button variant="outline" size="sm" className="border-border text-foreground" onClick={() => setCsvLeft("")}>Clear</Button>
          </div>
          <div className="overflow-auto rounded-md border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/60 text-foreground">
                <tr>
                  {headers.map((header, index) => (
                    <th key={index} className="px-3 py-2 border-b border-border font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {diffRows.map((row) => {
                  if (!row.left && row.status === "added") {
                    return renderPlaceholderRow(`left-placeholder-${row.key}`, "New row in Dataset B", row.status, "left");
                  }

                  return (
                    <tr key={`left-${row.key}`} className={getRowClass(row.status, "left")}>
                      {renderCells(row.left)}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Dataset B</h3>
            <Button variant="outline" size="sm" className="border-border text-foreground" onClick={() => setCsvRight("")}>Clear</Button>
          </div>
          <div className="overflow-auto rounded-md border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/60 text-foreground">
                <tr>
                  {headers.map((header, index) => (
                    <th key={index} className="px-3 py-2 border-b border-border font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {diffRows.map((row) => {
                  if (!row.right && row.status === "removed") {
                    return renderPlaceholderRow(`right-placeholder-${row.key}`, "Row removed from Dataset A", row.status, "right");
                  }

                  return (
                    <tr key={`right-${row.key}`} className={getRowClass(row.status, "right")}>
                      {renderCells(row.right)}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
