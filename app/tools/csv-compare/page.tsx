import type { Metadata } from "next";
import { CsvCompare } from "@/components/tools";

export const metadata: Metadata = {
  title: "CSV Compare | DevTools",
  description: "Upload or paste CSV datasets to compare differences",
};

export default function CsvComparePage() {
  return <CsvCompare />;
}
