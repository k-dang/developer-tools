import type { Metadata } from "next";
import { JsonFormatter } from "@/components/tools";

export const metadata: Metadata = {
  title: "JSON Formatter | DevTools",
  description: "Format and validate JSON",
};

export default function JsonFormatterPage() {
  return (
    <div className="p-6">
      <JsonFormatter />
    </div>
  );
}

