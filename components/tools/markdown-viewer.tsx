"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import type { editor } from "monaco-editor";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });
const RENDER_DELAY_MS = 120;

const sampleMarkdown = `# Markdown Viewer

Write markdown in the editor and see it render instantly.

## Features
- GitHub-flavored markdown (tables, task lists, strikethrough)
- Mermaid diagrams from fenced code blocks
- Syntax-highlighted code blocks

## Code Sample
\`\`\`ts
export function greet(name: string) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Mermaid Sample
\`\`\`mermaid
flowchart TD
  A[Edit markdown] --> B[Render preview]
  B --> C{Mermaid block?}
  C -->|Yes| D[Render SVG]
  C -->|No| E[Render code block]
  D --> F[Display output]
  E --> F
\`\`\`

## Table
| Tool | Status |
|---|---|
| Markdown parsing | ✅ |
| Mermaid diagrams | ✅ |
| Math rendering | 🚫 v1 |
`;

let mermaidInstancePromise: Promise<typeof import("mermaid").default> | null = null;
let initializedMermaidTheme: "dark" | "default" | null = null;

function getMermaidInstance() {
  if (!mermaidInstancePromise) {
    mermaidInstancePromise = import("mermaid").then((mod) => mod.default);
  }
  return mermaidInstancePromise;
}

async function ensureMermaidInitialized(theme: "dark" | "default") {
  const mermaid = await getMermaidInstance();
  if (initializedMermaidTheme !== theme) {
    mermaid.initialize({
      startOnLoad: false,
      theme,
      securityLevel: "strict",
      flowchart: { useMaxWidth: true, htmlLabels: false },
    });
    initializedMermaidTheme = theme;
  }
  return mermaid;
}

type MermaidBlockProps = {
  code: string;
};

function MermaidBlock({ code }: MermaidBlockProps) {
  const elementId = useRef(`mermaid-${Math.random().toString(36).slice(2, 11)}`);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    let isActive = true;
    setIsRendering(true);
    setError("");

    (async () => {
      try {
        const mermaid = await ensureMermaidInitialized("dark");
        const { svg: outputSvg } = await mermaid.render(elementId.current, code);
        if (!isActive) return;
        setSvg(outputSvg);
      } catch (err) {
        if (!isActive) return;
        setSvg("");
        setError(err instanceof Error ? err.message : "Unable to render Mermaid diagram.");
      } finally {
        if (isActive) {
          setIsRendering(false);
        }
      }
    })();

    return () => {
      isActive = false;
    };
  }, [code]);

  if (error) {
    return (
      <div className="rounded border border-destructive/50 bg-destructive/10 p-3">
        <p className="mb-2 text-sm font-medium text-destructive">Mermaid render error</p>
        <p className="mb-3 text-xs text-destructive/90">{error}</p>
        <pre className="overflow-x-auto rounded bg-background/70 p-3 text-xs text-foreground">
          <code>{code}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded border border-border bg-muted/40 p-3">
      {isRendering && !svg ? (
        <p className="text-sm text-muted-foreground">Rendering Mermaid diagram...</p>
      ) : (
        <div className="min-w-fit text-foreground" dangerouslySetInnerHTML={{ __html: svg }} />
      )}
    </div>
  );
}

const markdownComponents: Components = {
  h1: ({ children }) => <h1 className="mb-4 mt-1 text-3xl font-bold">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-3 mt-6 text-2xl font-semibold">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-2 mt-5 text-xl font-semibold">{children}</h3>,
  p: ({ children }) => <p className="mb-3 leading-7 text-foreground">{children}</p>,
  ul: ({ children }) => <ul className="mb-4 list-disc space-y-1 pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="mb-4 list-decimal space-y-1 pl-6">{children}</ol>,
  li: ({ children }) => <li className="text-foreground">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="mb-4 border-l-2 border-primary pl-4 italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full border-collapse border border-border text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-border bg-muted px-3 py-2 text-left font-semibold">{children}</th>
  ),
  td: ({ children }) => <td className="border border-border px-3 py-2 align-top">{children}</td>,
  code: ({ className, children, ...props }) => {
    const language = className?.replace("language-", "");
    const code = String(children ?? "").replace(/\n$/, "");

    if (language === "mermaid") {
      return <MermaidBlock code={code} />;
    }

    const isInline = !language;
    if (isInline) {
      return (
        <code
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground"
          {...props}
        >
          {children}
        </code>
      );
    }

    return (
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: "0.5rem",
          fontSize: "0.85rem",
          lineHeight: "1.5",
        }}
      >
        {code}
      </SyntaxHighlighter>
    );
  },
};

export function MarkdownViewer() {
  const [markdown, setMarkdown] = useState(sampleMarkdown);
  const [previewValue, setPreviewValue] = useState(sampleMarkdown);
  const [copyLabel, setCopyLabel] = useState("Copy Markdown");
  const [isEditorMounted, setIsEditorMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPreviewValue(markdown);
    }, RENDER_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [markdown]);

  const stats = useMemo(() => {
    const trimmed = markdown.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    return {
      characters: markdown.length,
      words,
    };
  }, [markdown]);

  const handleEditorMount = (instance: editor.IStandaloneCodeEditor) => {
    editorRef.current = instance;
    setIsEditorMounted(true);
  };

  const handleCopy = async () => {
    if (!markdown) return;
    try {
      await navigator.clipboard.writeText(markdown);
      setCopyLabel("Copied!");
      window.setTimeout(() => setCopyLabel("Copy Markdown"), 1800);
    } catch {
      setCopyLabel("Copy failed");
      window.setTimeout(() => setCopyLabel("Copy Markdown"), 1800);
    }
  };

  const resetSample = () => {
    setMarkdown(sampleMarkdown);
    editorRef.current?.setValue(sampleMarkdown);
  };

  const clearEditor = () => {
    setMarkdown("");
    editorRef.current?.setValue("");
  };

  const paneHeight = isFullscreen ? "calc(100vh - 140px)" : "720px";

  const content = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={resetSample} variant="outline">
          Reset Sample
        </Button>
        <Button onClick={clearEditor} variant="outline">
          Clear
        </Button>
        <Button onClick={handleCopy} variant="outline" disabled={!markdown}>
          {copyLabel}
        </Button>
        <Button
          onClick={() => setIsFullscreen((prev) => !prev)}
          variant="outline"
          size="icon"
          title={isFullscreen ? "Exit full screen" : "Enter full screen"}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
        <p className="ml-auto text-xs text-muted-foreground">
          {stats.words.toLocaleString()} words · {stats.characters.toLocaleString()} chars
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border bg-card p-4">
          <Label htmlFor="markdown-editor" className="text-foreground">
            Markdown Editor
          </Label>

          <MonacoEditor
            className="overflow-hidden rounded-md border"
            height={paneHeight}
            defaultLanguage="markdown"
            value={markdown}
            onChange={(value) => setMarkdown(value ?? "")}
            onMount={handleEditorMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              automaticLayout: true,
              wordWrap: "on",
              scrollBeyondLastLine: false,
              fontSize: 14,
              lineNumbers: "on",
            }}
          />
          {!isEditorMounted && (
            <p className="mt-2 text-sm text-muted-foreground">Loading editor...</p>
          )}
        </Card>

        <Card className="border-border bg-card p-4">
          <Label className="text-foreground">Preview</Label>

          <div
            className="overflow-auto rounded-md border border-border bg-background p-4"
            style={{ height: paneHeight }}
          >
            <div className="mx-auto max-w-4xl">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {previewValue}
              </ReactMarkdown>
            </div>
          </div>
        </Card>
      </div>
    </>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col gap-4 overflow-auto bg-background p-4 md:p-6">
        {content}
      </div>
    );
  }

  return <div className="space-y-4">{content}</div>;
}
