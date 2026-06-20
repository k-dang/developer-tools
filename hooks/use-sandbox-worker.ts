"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Drives a sandbox code-runner Web Worker that speaks the shared
 * `init`/`run` -> `ready`/`stdout`/`error` message protocol.
 */
export function useSandboxWorker(workerPath: string) {
  const workerRef = useRef<Worker | null>(null);
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const worker = new Worker(workerPath, { type: "module" });
    workerRef.current = worker;

    worker.onmessage = (event) => {
      const { type, data } = event.data;

      if (type === "ready") setIsReady(true);
      if (type === "stdout") setOutput((prev) => [...prev, data]);
      if (type === "error") setError(data);
    };

    // Initialize the worker (sets up its runtime / console interception)
    worker.postMessage({ type: "init" });

    return () => {
      worker.terminate();
    };
  }, [workerPath]);

  const run = useCallback((code: string) => {
    setOutput([]);
    setError(null);
    workerRef.current?.postMessage({ type: "run", code });
  }, []);

  return { run, output, error, isReady };
}
