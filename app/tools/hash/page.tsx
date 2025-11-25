import type { Metadata } from "next";
import { HashGenerator } from "@/components/tools";

export const metadata: Metadata = {
  title: "Hash Generator | DevTools",
  description: "Generate MD5, SHA hashes",
};

export default function HashPage() {
  return (
    <div className="p-6">
      <HashGenerator />
    </div>
  );
}

