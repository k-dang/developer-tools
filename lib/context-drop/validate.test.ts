import { describe, expect, it } from "vitest";
import {
  EMPTY_MARKDOWN_ERROR,
  MAX_MARKDOWN_BYTES,
  OVERSIZE_MARKDOWN_ERROR,
  validateCreateInput,
} from "./validate";

describe("validateCreateInput", () => {
  it("rejects empty markdown", () => {
    const result = validateCreateInput({ markdown: "" });
    expect(result).toEqual({ ok: false, error: EMPTY_MARKDOWN_ERROR });
  });

  it("rejects whitespace-only markdown", () => {
    const result = validateCreateInput({ markdown: "  \n\t  " });
    expect(result).toEqual({ ok: false, error: EMPTY_MARKDOWN_ERROR });
  });

  it("rejects a non-string markdown", () => {
    const result = validateCreateInput({ markdown: 42 as unknown as string });
    expect(result).toEqual({ ok: false, error: EMPTY_MARKDOWN_ERROR });
  });

  it("rejects markdown exceeding the 4.5 MB ceiling with the actionable message", () => {
    const tooBig = "a".repeat(MAX_MARKDOWN_BYTES + 1);
    const result = validateCreateInput({ markdown: tooBig });
    expect(result).toEqual({ ok: false, error: OVERSIZE_MARKDOWN_ERROR });
    if (!result.ok) {
      expect(result.error).toMatch(/summarize/i);
      expect(result.error).toMatch(/not a dump/i);
    }
  });

  it("counts bytes, not characters, against the ceiling", () => {
    // A 2-byte UTF-8 char repeated past the byte ceiling but under the char count.
    const multiByte = "é".repeat(MAX_MARKDOWN_BYTES / 2 + 1);
    expect(multiByte.length).toBeLessThan(MAX_MARKDOWN_BYTES);
    const result = validateCreateInput({ markdown: multiByte });
    expect(result).toEqual({ ok: false, error: OVERSIZE_MARKDOWN_ERROR });
  });

  it("accepts markdown exactly at the byte boundary", () => {
    const atBoundary = "a".repeat(MAX_MARKDOWN_BYTES);
    const result = validateCreateInput({ markdown: atBoundary });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.markdown).toBe(atBoundary);
  });

  it("accepts valid markdown and preserves it verbatim (no trimming of the body)", () => {
    const markdown = "  # Handoff\n\nLeading and trailing space is preserved.  ";
    const result = validateCreateInput({ markdown });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.markdown).toBe(markdown);
      expect(result.value.title).toBeUndefined();
    }
  });

  it("normalizes a present title by trimming it", () => {
    const result = validateCreateInput({ markdown: "body", title: "  My Drop  " });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.title).toBe("My Drop");
  });

  it("treats an absent title as undefined", () => {
    const result = validateCreateInput({ markdown: "body" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.title).toBeUndefined();
  });

  it("treats an empty / whitespace-only title as undefined", () => {
    const result = validateCreateInput({ markdown: "body", title: "   " });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.title).toBeUndefined();
  });

  it("never injects the title into the markdown body", () => {
    const result = validateCreateInput({ markdown: "just the body", title: "Secret Title" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.markdown).toBe("just the body");
      expect(result.value.markdown).not.toContain("Secret Title");
    }
  });
});
