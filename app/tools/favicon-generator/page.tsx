import type { Metadata } from "next";
import { FaviconGenerator } from "@/components/tools";

export const metadata: Metadata = {
  title: "Favicon Generator | DevTools",
  description: "Generate favicon images (ICO and PNG) from an input image",
};

export default function FaviconGeneratorPage() {
  return <FaviconGenerator />;
}
