import type { Metadata } from "next";
import { UrlTool } from "@/components/tools";

export const metadata: Metadata = {
  title: "URL Encoder/Decoder | DevTools",
  description: "Encode and decode URLs",
};

export default function UrlEncoderPage() {
  return (
    <div className="p-6">
      <UrlTool />
    </div>
  );
}

