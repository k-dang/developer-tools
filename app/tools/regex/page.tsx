import type { Metadata } from "next";
import { RegexTester } from "@/components/tools";

export const metadata: Metadata = {
  title: "Regex Tester | DevTools",
  description: "Test regular expressions",
};

export default function RegexPage() {
  return <RegexTester />;
}
