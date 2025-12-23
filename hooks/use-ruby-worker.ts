"use client";

import { useEffect, useRef, useState } from "react";

export function useRubyWorker() {
  const workerRef = useRef<Worker | null>(null);
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    workerRef.current = new Worker("/workers/ruby-worker.js", {
      type: "module",
    });

    workerRef.current.onmessage = (event) => {
      const { type, data } = event.data;

      if (type === "ready") {
        setIsReady(true);
      }

      if (type === "stdout") {
        setOutput((prev) => [...prev, data]);
      }

      if (type === "error") {
        setError(data);
      }
    };

    // Initialize the Ruby VM
    workerRef.current.postMessage({ type: "init" });

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  function run(code: string) {
    setOutput([]);
    setError(null);
    workerRef.current?.postMessage({ type: "run", code });
  }

  return { run, output, error, isReady };
}
