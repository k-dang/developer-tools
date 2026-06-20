/// <reference lib="webworker" />

import { formatArgsAsText, postOutput } from "./sandbox-output.js";

let __consoleInterceptionInstalled = false;

/**
 * Intercepts console methods so user code output is forwarded to the main thread.
 * `log`/`info`/`debug`/`warn` go to stdout; `error` goes to the error channel.
 */
function setupConsoleInterception() {
  if (__consoleInterceptionInstalled) return;
  __consoleInterceptionInstalled = true;

  for (const method of ["log", "info", "debug", "warn"]) {
    console[method] = (...args) => postOutput("stdout", formatArgsAsText(args, { indent: 2 }));
  }
  console.error = (...args) => postOutput("error", formatArgsAsText(args, { indent: 2 }));
}

self.onmessage = async (e) => {
  const { type, code } = e.data || {};

  if (type === "init") {
    setupConsoleInterception();
    self.postMessage({ type: "ready" });
    return;
  }

  if (type === "run") {
    try {
      // Wrap in an async IIFE so user code can use `await` and top-level `let`/`const`.
      // Like a script runner: only explicit console output appears in the Output panel,
      // the completion value is intentionally not emitted.
      const fn = new Function(`return (async () => {\n${code}\n})();`);
      await fn();
    } catch (err) {
      self.postMessage({
        type: "error",
        data: err instanceof Error ? `${err.name}: ${err.message}` : String(err),
      });
    }
  }
};
