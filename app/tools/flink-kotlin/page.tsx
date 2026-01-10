import type { Metadata } from "next";
import { FlinkKotlinPatterns } from "@/components/tools";

export const metadata: Metadata = {
  title: "Flink Kotlin Patterns | DevTools",
  description: "Code patterns for Apache Flink with Kotlin",
};

export default function FlinkKotlinPatternsPage() {
  return <FlinkKotlinPatterns />;
}
