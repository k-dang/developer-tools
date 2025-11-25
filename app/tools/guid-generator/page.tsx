import type { Metadata } from "next";
import { GuidGenerator } from "@/components/tools";

export const metadata: Metadata = {
  title: "GUID Generator | DevTools",
  description: "Generate random GUIDs/UUIDs",
};

export default function GuidGeneratorPage() {
  return <GuidGenerator />;
}
