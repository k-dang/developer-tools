/// <reference lib="webworker" />

import { DefaultRubyVM } from "https://cdn.jsdelivr.net/npm/@ruby/wasm-wasi@2.7.2/dist/browser/+esm";

let vm;
let __consoleInterceptionInstalled = false;

/**
 * Converts console arguments to a single text string.
 * Handles strings, objects (via JSON.stringify), and fallback to String().
 */
function formatArgsAsText(args) {
  return args
    .map((a) => {
      if (typeof a === "string") return a;
      try {
        return JSON.stringify(a);
      } catch {
        return String(a);
      }
    })
    .join(" ");
}

/**
 * Normalizes text (removes trailing newlines, converts CRLF to LF) and posts to main thread.
 */
function postOutput(type, text) {
  const normalized = text.replaceAll("\r\n", "\n").replace(/\n$/, "");
  self.postMessage({ type, data: normalized });
}

/**
 * Sets up console interception for Ruby VM output capture.
 *
 * **Why**: The Ruby VM's `consolePrinter` captures references to `console.log` and
 * `console.warn` at creation time. We need to temporarily replace these with wrappers
 * that forward output to the main thread via `postMessage`.
 *
 * **When**: Must be called BEFORE `DefaultRubyVM()` is invoked, so the VM captures
 * our wrapped console methods instead of the originals.
 *
 * **Returns**: A restore function that restores the original console methods.
 * The VM keeps using the captured wrapper references, so restoring the global
 * console doesn't affect VM output forwarding.
 *
 * @returns {Function} Function to restore original console methods
 */
function setupConsoleInterception() {
  // Prevent multiple installations - if already installed, return a no-op restore function
  if (__consoleInterceptionInstalled) return () => {};
  __consoleInterceptionInstalled = true;

  const originalLog = console.log;
  const originalWarn = console.warn;

  console.log = (...args) => {
    const text = formatArgsAsText(args);
    postOutput("stdout", text);
    originalLog(...args);
  };

  console.warn = (...args) => {
    const text = formatArgsAsText(args);
    postOutput("error", text);
    originalWarn(...args);
  };

  return () => {
    console.log = originalLog;
    console.warn = originalWarn;
  };
}

self.onmessage = async (e) => {
  const { type, code } = e.data || {};

  if (type === "init") {
    try {
      const response = await fetch(
        "https://cdn.jsdelivr.net/npm/@ruby/3.4-wasm-wasi@2.7.2/dist/ruby+stdlib.wasm",
      );
      const wasmModule = await WebAssembly.compileStreaming(response);

      // Step 1: Install console wrappers BEFORE VM creation
      // The VM's consolePrinter will capture references to these wrapped methods
      const restoreConsole = setupConsoleInterception();

      // Step 2: Create VM (captures our wrapped console methods internally)
      const { vm: rubyVm } = await DefaultRubyVM(wasmModule);

      // Step 3: Restore global console methods
      // The VM keeps using the captured wrapper references, so output forwarding
      // continues to work even after restoring the global console
      restoreConsole();

      vm = rubyVm;
      self.postMessage({ type: "ready" });
    } catch (err) {
      self.postMessage({
        type: "error",
        data: `Initialization failed: ${err.message}\n${err.stack || ""}`,
      });
    }
  }

  if (type === "run") {
    if (!vm) {
      self.postMessage({
        type: "error",
        data: "VM not initialized. Please wait for initialization.",
      });
      return;
    }

    try {
      // Intentionally do NOT emit `vm.eval`'s return value as stdout.
      // This tool behaves like a script runner: only explicit prints (puts/print/p) appear in Output.
      vm.eval(code);
    } catch (err) {
      self.postMessage({
        type: "error",
        data: `Ruby Error: ${err.toString()}\n${err.stack || ""}`,
      });
    }
  }
};
