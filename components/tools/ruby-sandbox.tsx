"use client";

import { SandboxTool } from "./sandbox-tool";

export function RubySandbox() {
  return (
    <SandboxTool
      workerPath="/workers/ruby-worker.js"
      language="ruby"
      defaultCode={`puts "Hello from Ruby!"`}
      codeLabel="Ruby Code"
      codeId="ruby-code"
      loadingLabel="Loading VM..."
    />
  );
}
