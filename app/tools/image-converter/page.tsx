import type { Metadata } from "next";
import { ImageConverter } from "@/components/tools";

export const metadata: Metadata = {
  title: "Image Converter | DevTools",
  description: "Convert images between PNG, JPEG, and WebP formats",
};

export default function ImageConverterPage() {
  return <ImageConverter />;
}
