import type { Metadata } from "next";
import { MarkdownViewer } from "@/components/tools";

export const metadata: Metadata = {
  title: "Markdown Viewer | DevTools",
  description: "Preview markdown with Mermaid diagram support",
};

export default function MarkdownViewerPage() {
  return <MarkdownViewer />;
}
