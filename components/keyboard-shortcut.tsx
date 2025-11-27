"use client";

import { useModifierKeyPrefix } from "@/hooks/useModifierKeyPrefix";

export function KeyboardShortcut() {
  const mod = useModifierKeyPrefix();

  return (
    <p className="mt-4 font-mono text-sm text-muted-foreground/70">
      Press{" "}
      <kbd className="rounded border border-border bg-muted px-2 py-1 font-mono text-xs">{mod}</kbd>{" "}
      + <kbd className="rounded border border-border bg-muted px-2 py-1 font-mono text-xs">K</kbd>{" "}
      to search
    </p>
  );
}
