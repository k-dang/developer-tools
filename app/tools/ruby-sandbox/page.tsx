import type { Metadata } from "next";
import { RubySandbox } from "@/components/tools";

export const metadata: Metadata = {
  title: "Ruby Sandbox | DevTools",
  description: "Ruby code editor with syntax highlighting",
};

export default function RubySandboxPage() {
  return <RubySandbox />;
}

