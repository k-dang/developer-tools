"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Papa, { type ParseResult } from "papaparse";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { AlertCircle, FileSpreadsheet, Loader2, Rows3, Search, Table2, X } from "lucide-react";
import { FileUploadZone } from "@/components/file-upload-zone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const ROW_BATCH_SIZE = 1000;
const MAX_PREVIEW_ROWS = 50000;
const COLUMN_WIDTH_SAMPLE_SIZE = 200;
const SEARCH_DEBOUNCE_MS = 200;
const COLUMN_COLOR_CLASSES = [
  {
    header: "bg-sky-500/15 text-sky-950 dark:text-sky-100",
    cell: "bg-sky-500/[0.035]",
  },
  {
    header: "bg-emerald-500/15 text-emerald-950 dark:text-emerald-100",
    cell: "bg-emerald-500/[0.035]",
  },
  {
    header: "bg-amber-500/20 text-amber-950 dark:text-amber-100",
    cell: "bg-amber-500/[0.04]",
  },
  {
    header: "bg-rose-500/15 text-rose-950 dark:text-rose-100",
    cell: "bg-rose-500/[0.035]",
  },
  {
    header: "bg-cyan-500/15 text-cyan-950 dark:text-cyan-100",
    cell: "bg-cyan-500/[0.035]",
  },
  {
    header: "bg-lime-500/15 text-lime-950 dark:text-lime-100",
    cell: "bg-lime-500/[0.035]",
  },
  {
    header: "bg-fuchsia-500/15 text-fuchsia-950 dark:text-fuchsia-100",
    cell: "bg-fuchsia-500/[0.035]",
  },
  {
    header: "bg-orange-500/15 text-orange-950 dark:text-orange-100",
    cell: "bg-orange-500/[0.035]",
  },
] as const;

type CsvRow = Record<string, string>;

type ParseState = "idle" | "parsing" | "complete" | "error";

function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

function normalizeHeaders(fields: string[] | undefined, fallbackColumnCount: number): string[] {
  if (fields?.length) {
    return fields.map((field, index) => field || `Column ${index + 1}`);
  }

  return Array.from({ length: fallbackColumnCount }, (_, index) => `Column ${index + 1}`);
}

function normalizeRow(row: unknown, headers: string[]): CsvRow | null {
  if (!row || typeof row !== "object" || Array.isArray(row)) {
    return null;
  }

  const source = row as Record<string, unknown>;
  return headers.reduce<CsvRow>((acc, header) => {
    const value = source[header];
    acc[header] = value == null ? "" : String(value);
    return acc;
  }, {});
}

function getColumnWidth(header: string, rows: CsvRow[]): string {
  const sampledRows = rows.slice(0, COLUMN_WIDTH_SAMPLE_SIZE);
  const longestValueLength = sampledRows.reduce(
    (maxLength, row) => Math.max(maxLength, row[header]?.length ?? 0),
    header.length,
  );
  const estimatedWidth = longestValueLength * 8 + 32;
  const width = Math.max(estimatedWidth, 88);
  return `${width}px`;
}

function getColumnColor(index: number) {
  return COLUMN_COLOR_CLASSES[index % COLUMN_COLOR_CLASSES.length];
}

export function CsvViewer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [parseState, setParseState] = useState<ParseState>("idle");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState(0);
  const [droppedRows, setDroppedRows] = useState(0);
  const parserRef = useRef<Papa.Parser | null>(null);
  const bufferedRowsRef = useRef<CsvRow[]>([]);
  const totalRowsRef = useRef(0);
  const retainedRowsRef = useRef(0);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const flushRows = () => {
    if (bufferedRowsRef.current.length === 0) {
      return;
    }

    const nextRows = bufferedRowsRef.current;
    bufferedRowsRef.current = [];
    setRows((currentRows) => [...currentRows, ...nextRows].slice(0, MAX_PREVIEW_ROWS));
  };

  const reset = () => {
    parserRef.current?.abort();
    parserRef.current = null;
    bufferedRowsRef.current = [];
    totalRowsRef.current = 0;
    retainedRowsRef.current = 0;
    setSelectedFile(null);
    setHeaders([]);
    setRows([]);
    setParseState("idle");
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setError(null);
    setParsedRows(0);
    setDroppedRows(0);
  };

  const parseFile = (file: File) => {
    reset();
    setSelectedFile(file);
    setParseState("parsing");

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: "greedy",
      worker: true,
      chunkSize: 1024 * 1024,
      chunk: (results: ParseResult<CsvRow>, parser) => {
        parserRef.current = parser;

        if (headers.length === 0 && results.meta.fields) {
          setHeaders(normalizeHeaders(results.meta.fields, Object.keys(results.data[0] ?? {}).length));
        }

        const activeHeaders = normalizeHeaders(
          results.meta.fields,
          Object.keys(results.data[0] ?? {}).length,
        );
        const normalizedRows = results.data
          .map((row) => normalizeRow(row, activeHeaders))
          .filter((row): row is CsvRow => row !== null);

        totalRowsRef.current += normalizedRows.length;

        const remainingPreviewRows = Math.max(0, MAX_PREVIEW_ROWS - retainedRowsRef.current);
        const rowsToKeep = normalizedRows.slice(0, remainingPreviewRows);
        retainedRowsRef.current += rowsToKeep.length;
        bufferedRowsRef.current.push(...rowsToKeep);

        setParsedRows(totalRowsRef.current);
        setDroppedRows(Math.max(0, totalRowsRef.current - retainedRowsRef.current));

        if (bufferedRowsRef.current.length >= ROW_BATCH_SIZE) {
          flushRows();
        }
      },
      complete: () => {
        flushRows();
        parserRef.current = null;
        setParseState("complete");
      },
      error: (parseError) => {
        parserRef.current = null;
        setParseState("error");
        setError(parseError.message);
      },
    });
  };

  const columns = useMemo<ColumnDef<CsvRow>[]>(
    () =>
      headers.map((header) => ({
        accessorKey: header,
        header,
        cell: ({ getValue }) => String(getValue() ?? ""),
      })),
    [headers],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = debouncedSearchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return rows;
    }

    return rows.filter((row) =>
      headers.some((header) => row[header]?.toLowerCase().includes(normalizedQuery)),
    );
  }, [debouncedSearchQuery, headers, rows]);

  const table = useReactTable({
    data: filteredRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const virtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 40,
    overscan: 12,
  });

  const visibleRows = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  const activeSearchQuery = debouncedSearchQuery.trim();
  const isSearchPending = searchQuery !== debouncedSearchQuery;
  const gridTemplateColumns = useMemo(
    () => headers.map((header) => getColumnWidth(header, filteredRows)).join(" "),
    [headers, filteredRows],
  );

  return (
    <div className="space-y-4">
      <FileUploadZone
        selectedFile={selectedFile}
        onFileSelect={parseFile}
        onReset={reset}
        accept=".csv,text/csv"
        uploadIcon={FileSpreadsheet}
        fileIcon={FileSpreadsheet}
        fileId="csv-upload"
        title="Upload a CSV file"
        description="Parses locally in your browser and virtualizes larger previews."
      />

      {selectedFile && (
        <div className="grid gap-3 md:grid-cols-4">
          <Card className="gap-3 rounded-lg py-4">
            <CardHeader className="px-4">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Rows3 className="size-4 text-muted-foreground" />
                Parsed Rows
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 text-2xl font-semibold">
              {formatNumber(parsedRows)}
            </CardContent>
          </Card>
          <Card className="gap-3 rounded-lg py-4">
            <CardHeader className="px-4">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Table2 className="size-4 text-muted-foreground" />
                Preview Rows
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 text-2xl font-semibold">
              {formatNumber(rows.length)}
            </CardContent>
          </Card>
          <Card className="gap-3 rounded-lg py-4">
            <CardHeader className="px-4">
              <CardTitle className="text-sm">Columns</CardTitle>
            </CardHeader>
            <CardContent className="px-4 text-2xl font-semibold">
              {formatNumber(headers.length)}
            </CardContent>
          </Card>
          <Card className="gap-3 rounded-lg py-4">
            <CardHeader className="px-4">
              <CardTitle className="text-sm">Status</CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <div className="flex items-center gap-2 text-sm font-medium capitalize">
                {parseState === "parsing" && <Loader2 className="size-4 animate-spin" />}
                {parseState === "error" && <AlertCircle className="size-4 text-destructive" />}
                {parseState}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {droppedRows > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
          Showing the first {formatNumber(MAX_PREVIEW_ROWS)} rows to keep the browser responsive.
          Search and scrolling are limited to retained preview rows. {formatNumber(droppedRows)}{" "}
          additional rows were parsed but not retained in the preview.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {headers.length > 0 && (
        <div className="max-w-full overflow-hidden rounded-lg border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold">CSV Preview</h3>
              <p className="text-xs text-muted-foreground">
                {isSearchPending
                  ? "Searching retained rows..."
                  : activeSearchQuery
                    ? `${formatNumber(filteredRows.length)} matches from ${formatNumber(rows.length)} retained rows.`
                    : `Showing and searching up to the first ${formatNumber(MAX_PREVIEW_ROWS)} rows.`}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <div className="relative w-full min-w-56 sm:w-72">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search retained rows..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="h-8 pl-8 pr-8 text-sm"
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-0.5 top-1/2 size-7 -translate-y-1/2"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
              {parseState === "parsing" && (
                <Button variant="outline" size="sm" onClick={() => parserRef.current?.abort()}>
                  Stop
                </Button>
              )}
            </div>
          </div>
          <div
            ref={tableContainerRef}
            className="h-[620px] max-w-full overflow-auto"
          >
            <div className="w-max min-w-full">
              <div className="sticky top-0 z-10 grid border-b bg-muted text-xs font-medium">
                {table.getHeaderGroups().map((headerGroup) => (
                  <div
                    key={headerGroup.id}
                    className="grid min-w-0"
                    style={{ gridTemplateColumns }}
                  >
                    {headerGroup.headers.map((header) => {
                      const color = getColumnColor(header.index);

                      return (
                        <div
                          key={header.id}
                          className={cn(
                            "min-w-0 whitespace-nowrap border-r px-3 py-2 last:border-r-0",
                            color.header,
                          )}
                          title={String(header.column.columnDef.header ?? "")}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="relative" style={{ height: totalSize }}>
                {filteredRows.length === 0 && activeSearchQuery && !isSearchPending && (
                  <div className="flex h-32 items-center justify-center px-4 text-sm text-muted-foreground">
                    No rows match your search.
                  </div>
                )}
                {visibleRows.map((virtualRow) => {
                  const row = table.getRowModel().rows[virtualRow.index];

                  return (
                    <div
                      key={row.id}
                      className={cn(
                        "absolute left-0 grid w-full border-b text-sm",
                        virtualRow.index % 2 === 0 ? "bg-card" : "bg-muted/25",
                      )}
                      style={{
                        height: virtualRow.size,
                        transform: `translateY(${virtualRow.start}px)`,
                        gridTemplateColumns,
                      }}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const color = getColumnColor(cell.column.getIndex());

                        return (
                          <div
                            key={cell.id}
                            className={cn(
                              "min-w-0 whitespace-nowrap border-r px-3 py-2 last:border-r-0",
                              color.cell,
                            )}
                            title={String(cell.getValue() ?? "")}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
