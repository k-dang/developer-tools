import type { Metadata } from "next";
import { ContextDrop } from "@/components/tools";

export const metadata: Metadata = {
  title: "Context Drop | DevTools",
  description: "Hand off curated context between AI agents via a single link",
};

export default function ContextDropPage() {
  return <ContextDrop />;
}
