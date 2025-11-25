import type { Metadata } from "next";
import { TextDiffer } from "@/components/tools";

export const metadata: Metadata = {
  title: "Text Differ | DevTools",
  description: "Compare and highlight text differences",
};

export default function TextDifferPage() {
  return <TextDiffer />;
}
