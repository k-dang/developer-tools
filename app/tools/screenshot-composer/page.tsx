import type { Metadata } from "next";
import { ScreenshotComposer } from "@/components/tools";

export const metadata: Metadata = {
  title: "Screenshot Composer | DevTools",
  description: "Compose polished screenshots locally",
};

export default function ScreenshotComposerPage() {
  return <ScreenshotComposer />;
}
