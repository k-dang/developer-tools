import type { Metadata } from "next";
import { ColorPicker } from "@/components/tools";

export const metadata: Metadata = {
  title: "Color Picker | DevTools",
  description: "Convert color formats",
};

export default function ColorPickerPage() {
  return <ColorPicker />;
}
