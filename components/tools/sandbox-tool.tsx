"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import type { editor } from "monaco-editor";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Play } from "lucide-react";
import { useSandboxWorker } from "@/hooks/use-sandbox-worker";
import { Spinner } from "@/components/ui/spinner";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export interface SandboxToolProps {
  /** Path to the code-runner Web Worker, e.g. "/workers/js-worker.js". */
  workerPath: string;
  /** Monaco language id, e.g. "javascript" or "ruby". */
  language: string;
  /** Code shown in the editor on first load. */
  defaultCode: string;
  /** Label above the editor, e.g. "JavaScript Code". */
  codeLabel: string;
  /** id used for the editor Label's htmlFor. */
  codeId: string;
  /** Button text while the worker is initializing. */
  loadingLabel?: string;
}

export function SandboxTool({
  workerPath,
  language,
  defaultCode,
  codeLabel,
  codeId,
  loadingLabel = "Loading...",
}: SandboxToolProps) {
  const { run, output, error, isReady } = useSandboxWorker(workerPath);
  const [code, setCode] = useState(defaultCode);

  // Keep latest readiness readable from the editor command without
  // re-registering the command (which Monaco cannot deregister).
  const isReadyRef = useRef(isReady);
  useEffect(() => {
    isReadyRef.current = isReady;
  }, [isReady]);

  const handleEditorDidMount = async (editorInstance: editor.IStandaloneCodeEditor) => {
    // Dynamically import KeyMod and KeyCode to avoid SSR issues
    const { KeyMod, KeyCode } = await import("monaco-editor");

    // Register Ctrl+Enter (or Cmd+Enter on Mac) once to run the current code.
    editorInstance.addCommand(KeyMod.CtrlCmd | KeyCode.Enter, () => {
      if (isReadyRef.current) {
        run(editorInstance.getModel()?.getValue() ?? "");
      }
    });
  };

  const outputValue = useMemo(() => {
    const joined = output.join("\n");
    if (error) {
      return `Error: ${error}${joined ? `\n\nOutput:\n${joined}` : ""}`;
    }
    return joined;
  }, [output, error]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <div className="flex h-8 items-center justify-between">
          <Label htmlFor={codeId} className="text-foreground">
            {codeLabel}
          </Label>
          <Button
            onClick={() => run(code)}
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={!isReady}
          >
            <Play className="size-4" />
            {!isReady ? loadingLabel : "Run"}
          </Button>
        </div>
        <MonacoEditor
          className="border"
          height="500px"
          defaultLanguage={language}
          value={code}
          onChange={(value) => setCode(value || "")}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: "on",
          }}
          loading={<Spinner />}
        />
      </div>

      <div className="space-y-2">
        <div className="flex h-8 items-center">
          <Label className={error ? "text-destructive" : "text-foreground"}>Output</Label>
        </div>
        <Textarea
          value={outputValue}
          readOnly
          className={`font-mono text-sm h-[500px] resize-none whitespace-pre ${
            error ? "bg-destructive/10 border-destructive text-destructive" : "bg-muted"
          }`}
          rows={10}
        />
      </div>
    </div>
  );
}
