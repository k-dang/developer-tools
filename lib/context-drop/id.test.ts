import { describe, expect, it } from "vitest";
import { DROP_ID_LENGTH, DROP_ID_PATTERN, generateDropId } from "./id";

describe("generateDropId", () => {
  it("produces a 22-char base64url string", () => {
    for (let i = 0; i < 1000; i++) {
      const id = generateDropId();
      expect(id).toHaveLength(DROP_ID_LENGTH);
      expect(id).toMatch(DROP_ID_PATTERN);
    }
  });

  it("has no collisions across a large iteration count", () => {
    const seen = new Set<string>();
    const iterations = 100_000;
    for (let i = 0; i < iterations; i++) {
      seen.add(generateDropId());
    }
    expect(seen.size).toBe(iterations);
  });

  it("draws from a cryptographic source: high entropy, no obvious patterning", () => {
    const ids = Array.from({ length: 5000 }, () => generateDropId());

    // Every position varies across the sample (a constant-prefix bug would
    // pin a position to one character).
    for (let pos = 0; pos < DROP_ID_LENGTH; pos++) {
      const charsAtPos = new Set(ids.map((id) => id[pos]));
      expect(charsAtPos.size).toBeGreaterThan(1);
    }

    // Roughly uniform character distribution: every observed character stays
    // well under half of all samples (a degenerate source would spike).
    const counts = new Map<string, number>();
    for (const id of ids) {
      for (const ch of id) counts.set(ch, (counts.get(ch) ?? 0) + 1);
    }
    const total = ids.length * DROP_ID_LENGTH;
    for (const count of counts.values()) {
      expect(count / total).toBeLessThan(0.5);
    }
  });
});
