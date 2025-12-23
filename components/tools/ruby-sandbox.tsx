"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import type { editor } from "monaco-editor";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Play } from "lucide-react";
import { useRubyWorker } from "@/hooks/use-ruby-worker";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export function RubySandbox() {
  const { run, output, error, isReady } = useRubyWorker();
  const [code, setCode] = useState(`puts "Hello from Ruby!"`);
  const [isEditorMounted, setIsEditorMounted] = useState(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleRun = () => {
    run(code);
  };

  const handleEditorDidMount = (editorInstance: editor.IStandaloneCodeEditor) => {
    editorRef.current = editorInstance;
    setIsEditorMounted(true);
  };

  // Set up keyboard shortcut after editor is mounted
  useEffect(() => {
    if (!editorRef.current) return;

    const setupCommand = async () => {
      // Dynamically import KeyMod and KeyCode to avoid SSR issues
      const { KeyMod, KeyCode } = await import("monaco-editor");

      // Register Ctrl+Enter (or Cmd+Enter on Mac) keyboard shortcut to run code
      editorRef.current?.addCommand(KeyMod.CtrlCmd | KeyCode.Enter, () => {
        if (isReady && editorRef.current) {
          const currentCode = editorRef.current.getModel()?.getValue() || "";
          run(currentCode);
        }
      });
    };

    setupCommand();
  }, [isReady, run]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="ruby-code" className="text-foreground">
            Ruby Code
          </Label>
          <Button
            onClick={handleRun}
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={!isReady}
          >
            <Play className="size-4" />
            {!isReady ? "Loading VM..." : "Run"}
          </Button>
        </div>
        <div className="border rounded-md overflow-hidden">
          <MonacoEditor
            height="500px"
            defaultLanguage="ruby"
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
          />
        </div>
      </div>

      {isEditorMounted && (
        <div className="space-y-2">
          {error && (
            <div className="space-y-2">
              <Label className="text-destructive">Error</Label>
              <Textarea
                value={error}
                readOnly
                className="font-mono text-sm bg-destructive/10 border-destructive text-destructive"
                rows={4}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label className="text-foreground">Output</Label>
            <Textarea
              value={output.length > 0 ? output.join("\n") : ""}
              readOnly
              className="font-mono text-sm bg-muted h-[200px] resize-none whitespace-pre"
              rows={10}
            />
          </div>
        </div>
      )}
    </div>
  );
}
