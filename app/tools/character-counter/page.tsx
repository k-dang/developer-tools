import type { Metadata } from "next";
import { CharacterCounter } from "@/components/tools";

export const metadata: Metadata = {
  title: "Character Counter | DevTools",
  description: "Count characters, words, and lines",
};

export default function CharacterCounterPage() {
  return <CharacterCounter />;
}
