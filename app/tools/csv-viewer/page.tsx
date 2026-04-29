import type { Metadata } from "next";
import { CsvViewer } from "@/components/tools";

export const metadata: Metadata = {
  title: "CSV Viewer | DevTools",
  description: "Upload and inspect CSV files",
};

export default function CsvViewerPage() {
  return <CsvViewer />;
}
