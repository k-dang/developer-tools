export const MAX_MARKDOWN_BYTES = Math.floor(4.5 * 1024 * 1024);

export const EMPTY_MARKDOWN_ERROR =
  "Context Drop markdown is empty — provide the handoff content, not an empty string.";

export const OVERSIZE_MARKDOWN_ERROR =
  "Context Drop exceeds the 4.5 MB limit — summarize the handoff; a Context Drop is a curated handoff, not a dump.";

export type ValidatedCreateInput = { markdown: string; title?: string };

export type CreateInputResult =
  | { ok: true; value: ValidatedCreateInput }
  | { ok: false; error: string };

export function validateCreateInput(input: {
  markdown: unknown;
  title?: unknown;
}): CreateInputResult {
  const { markdown, title } = input;

  if (typeof markdown !== "string" || markdown.trim().length === 0) {
    return { ok: false, error: EMPTY_MARKDOWN_ERROR };
  }

  if (Buffer.byteLength(markdown, "utf8") > MAX_MARKDOWN_BYTES) {
    return { ok: false, error: OVERSIZE_MARKDOWN_ERROR };
  }

  const normalizedTitle =
    typeof title === "string" && title.trim().length > 0 ? title.trim() : undefined;

  return {
    ok: true,
    value: {
      markdown,
      ...(normalizedTitle ? { title: normalizedTitle } : {}),
    },
  };
}
