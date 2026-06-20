"use client";

import { SandboxTool } from "./sandbox-tool";

export function JavaScriptSandbox() {
  return (
    <SandboxTool
      workerPath="/workers/js-worker.js"
      language="javascript"
      defaultCode={`console.log("Hello from JavaScript!");`}
      codeLabel="JavaScript Code"
      codeId="javascript-code"
    />
  );
}
