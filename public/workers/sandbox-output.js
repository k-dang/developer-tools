/// <reference lib="webworker" />

/**
 * Converts console arguments to a single text string.
 * Handles strings, objects (via JSON.stringify), and fallback to String().
 *
 * @param {unknown[]} args - console arguments
 * @param {{ indent?: number }} [options] - JSON.stringify indent (omit for compact)
 */
export function formatArgsAsText(args, { indent } = {}) {
  return args
    .map((a) => {
      if (typeof a === "string") return a;
      try {
        return JSON.stringify(a, null, indent);
      } catch {
        return String(a);
      }
    })
    .join(" ");
}

/**
 * Normalizes text (removes trailing newlines, converts CRLF to LF) and posts to main thread.
 */
export function postOutput(type, text) {
  const normalized = String(text).replaceAll("\r\n", "\n").replace(/\n$/, "");
  self.postMessage({ type, data: normalized });
}
