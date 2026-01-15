import type { Metadata } from "next";
import { StackPatternExplorer } from "@/components/tools";

export const metadata: Metadata = {
  title: "Stack Pattern Explorer | DevTools",
  description: "Best practices and patterns for Ruby/Rails and Java/Kotlin/Maven",
};

export default function StackPatternExplorerPage() {
  return <StackPatternExplorer />;
}
