import type { Metadata } from "next";
import { JavaScriptSandbox } from "@/components/tools";

export const metadata: Metadata = {
  title: "JavaScript Sandbox | DevTools",
  description: "JavaScript code editor with syntax highlighting",
};

export default function JavaScriptSandboxPage() {
  return <JavaScriptSandbox />;
}
