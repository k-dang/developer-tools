import type { Metadata } from "next";
import { TechStackReference } from "@/components/tools";

export const metadata: Metadata = {
  title: "Tech Stack Reference | DevTools",
  description: "Quick reference for Ruby/Rails, Kotlin/Maven, and Mise",
};

export default function TechStackReferencePage() {
  return <TechStackReference />;
}
