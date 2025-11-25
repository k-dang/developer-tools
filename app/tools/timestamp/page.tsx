import type { Metadata } from "next";
import { TimestampConverter } from "@/components/tools";

export const metadata: Metadata = {
  title: "Timestamp Converter | DevTools",
  description: "Convert Unix timestamps",
};

export default function TimestampPage() {
  return (
    <div className="p-6">
      <TimestampConverter />
    </div>
  );
}

