import React from "react";
import {
  Braces,
  Binary,
  Regex,
  Hash,
  Palette,
  Clock,
  Link2,
  FileCode,
  Fingerprint,
  GitCompare,
  Type,
  FileText,
  Image,
  type LucideIcon,
} from "lucide-react";
import { RubyIcon } from "@/components/ui/ruby-icon";

export type ToolConfig = {
  id: string;
  slug: string;
  name: string;
  icon: LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
  category?: "tools" | "sandboxes";
};

export const tools: ToolConfig[] = [
  {
    id: "json-formatter",
    slug: "json-formatter",
    name: "JSON Formatter",
    icon: Braces,
    description: "Format and validate JSON",
  },
  {
    id: "base64",
    slug: "base64",
    name: "Base64 Encode/Decode",
    icon: Binary,
    description: "Encode and decode Base64",
  },
  {
    id: "regex",
    slug: "regex",
    name: "Regex Tester",
    icon: Regex,
    description: "Test regular expressions",
  },
  {
    id: "hash",
    slug: "hash",
    name: "Hash Generator",
    icon: Hash,
    description: "Generate MD5, SHA hashes",
  },
  {
    id: "color-picker",
    slug: "color-picker",
    name: "Color Picker",
    icon: Palette,
    description: "Convert color formats",
  },
  {
    id: "timestamp",
    slug: "timestamp",
    name: "Timestamp Converter",
    icon: Clock,
    description: "Convert Unix timestamps",
  },
  {
    id: "url-encoder",
    slug: "url-encoder",
    name: "URL Encoder/Decoder",
    icon: Link2,
    description: "Encode and decode URLs",
  },
  {
    id: "jwt-decoder",
    slug: "jwt-decoder",
    name: "JWT Decoder",
    icon: FileCode,
    description: "Decode JWT tokens",
  },
  {
    id: "guid-generator",
    slug: "guid-generator",
    name: "GUID Generator",
    icon: Fingerprint,
    description: "Generate random GUIDs/UUIDs",
  },
  {
    id: "text-differ",
    slug: "text-differ",
    name: "Text Differ",
    icon: GitCompare,
    description: "Compare and highlight text differences",
  },
  {
    id: "character-counter",
    slug: "character-counter",
    name: "Character Counter",
    icon: Type,
    description: "Count characters, words, and lines",
  },
  {
    id: "lorem-ipsum",
    slug: "lorem-ipsum",
    name: "Lorem Ipsum",
    icon: FileText,
    description: "Generate placeholder text",
  },
  {
    id: "cron",
    slug: "cron",
    name: "Cron Helper",
    icon: Clock,
    description: "Parse and validate cron expressions",
  },
  {
    id: "image-converter",
    slug: "image-converter",
    name: "Image Converter",
    icon: Image,
    description: "Convert PNG, JPG, and WebP images",
  },
  {
    id: "ruby-sandbox",
    slug: "ruby-sandbox",
    name: "Ruby Sandbox",
    icon: RubyIcon,
    description: "Ruby code editor with syntax highlighting",
    category: "sandboxes",
  },
];

export function getToolBySlug(slug: string): ToolConfig | undefined {
  return tools.find((tool) => tool.slug === slug);
}
