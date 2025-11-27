import type { Metadata } from "next";
import { LoremIpsum } from "@/components/tools";

export const metadata: Metadata = {
  title: "Lorem Ipsum Generator | DevTools",
  description: "Generate placeholder text",
};

export default function LoremIpsumPage() {
  return <LoremIpsum />;
}

