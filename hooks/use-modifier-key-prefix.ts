import { useMemo } from "react";

export function useModifierKeyPrefix() {
  return useMemo(() => {
    const isMac = navigator.userAgent.includes("MAC");
    return isMac ? "⌘" : "Ctrl";
  }, []);
}
