import type { Metadata } from "next";
import { JwtDecoder } from "@/components/tools";

export const metadata: Metadata = {
  title: "JWT Decoder | DevTools",
  description: "Decode JWT tokens",
};

export default function JwtDecoderPage() {
  return <JwtDecoder />;
}
