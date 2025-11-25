"use client";

import type React from "react";

import { useState } from "react";
import {
  Code2,
  Braces,
  Binary,
  Regex,
  Hash,
  Palette,
  Clock,
  Link2,
  FileCode,
  Fingerprint,
} from "lucide-react";
import {
  JsonFormatter,
  Base64Tool,
  RegexTester,
  HashGenerator,
  ColorPicker,
  TimestampConverter,
  UrlTool,
  JwtDecoder,
  GuidGenerator,
} from "@/components/tools";

type Tool = {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  component: React.ReactNode;
};

const tools: Tool[] = [
  {
    id: "json-formatter",
    name: "JSON Formatter",
    icon: <Braces className="size-4" />,
    description: "Format and validate JSON",
    component: <JsonFormatter />,
  },
  {
    id: "base64",
    name: "Base64 Encode/Decode",
    icon: <Binary className="size-4" />,
    description: "Encode and decode Base64",
    component: <Base64Tool />,
  },
  {
    id: "regex",
    name: "Regex Tester",
    icon: <Regex className="size-4" />,
    description: "Test regular expressions",
    component: <RegexTester />,
  },
  {
    id: "hash",
    name: "Hash Generator",
    icon: <Hash className="size-4" />,
    description: "Generate MD5, SHA hashes",
    component: <HashGenerator />,
  },
  {
    id: "color-picker",
    name: "Color Picker",
    icon: <Palette className="size-4" />,
    description: "Convert color formats",
    component: <ColorPicker />,
  },
  {
    id: "timestamp",
    name: "Timestamp Converter",
    icon: <Clock className="size-4" />,
    description: "Convert Unix timestamps",
    component: <TimestampConverter />,
  },
  {
    id: "url-encoder",
    name: "URL Encoder/Decoder",
    icon: <Link2 className="size-4" />,
    description: "Encode and decode URLs",
    component: <UrlTool />,
  },
  {
    id: "jwt-decoder",
    name: "JWT Decoder",
    icon: <FileCode className="size-4" />,
    description: "Decode JWT tokens",
    component: <JwtDecoder />,
  },
  {
    id: "guid-generator",
    name: "GUID Generator",
    icon: <Fingerprint className="size-4" />,
    description: "Generate random GUIDs/UUIDs",
    component: <GuidGenerator />,
  },
];

export function DeveloperDashboard() {
  const [selectedTool, setSelectedTool] = useState(tools[0]);

  return (
    <div className="flex h-screen bg-background dark">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <Code2 className="size-6 text-primary" />
          <h1 className="font-mono text-lg font-semibold text-foreground">DevTools</h1>
        </div>
        <nav className="space-y-1 p-4">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                selectedTool.id === tool.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tool.icon}
              <span className="font-medium">{tool.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="border-b border-border bg-card px-6 py-4">
          <h2 className="text-2xl font-semibold text-foreground">{selectedTool.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{selectedTool.description}</p>
        </div>
        <div className="p-6">{selectedTool.component}</div>
      </main>
    </div>
  );
}
