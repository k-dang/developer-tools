import type { Metadata } from "next";
import { ContextDrop, ContextDropManager } from "@/components/tools";
import { listDrops } from "@/lib/context-drop/store";

export const metadata: Metadata = {
  title: "Context Drop | DevTools",
  description: "Hand off curated context between AI agents via a single link",
};

export const dynamic = "force-dynamic";

export default async function ContextDropPage() {
  const showManager = process.env.NODE_ENV !== "production";

  let drops: Awaited<ReturnType<typeof listDrops>> = [];
  let loadError = false;
  if (showManager) {
    try {
      drops = await listDrops();
    } catch {
      loadError = true;
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-3">
      <ContextDrop />
      {showManager && (
        <ContextDropManager initialDrops={drops} initialError={loadError} />
      )}
    </div>
  );
}
