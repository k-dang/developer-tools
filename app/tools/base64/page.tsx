import type { Metadata } from "next";
import { Base64Tool } from "@/components/tools";

export const metadata: Metadata = {
  title: "Base64 Encode/Decode | DevTools",
  description: "Encode and decode Base64",
};

export default function Base64Page() {
  return (
    <div className="p-6">
      <Base64Tool />
    </div>
  );
}

