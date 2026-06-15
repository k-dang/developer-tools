import Link from "next/link";
import Image from "next/image";
import { tools, toolGroups, getToolBySlug } from "@/lib/tools-config";
import { Card, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { KeyboardShortcut } from "@/components/keyboard-shortcut";

export default function Page() {
  const sandboxes = tools.filter((tool) => tool.category === "sandboxes");

  // Build the sections from the same group definitions the sidebar uses, so
  // the landing page and navigation stay in sync.
  const sections = toolGroups
    .map((group) => ({
      ...group,
      groupTools: group.slugs
        .map((slug) => getToolBySlug(slug))
        .filter((tool): tool is NonNullable<typeof tool> => Boolean(tool)),
    }))
    .filter((section) => section.groupTools.length > 0);

  if (sandboxes.length > 0) {
    sections.push({
      id: "sandboxes",
      label: "Sandboxes",
      slugs: sandboxes.map((tool) => tool.slug),
      groupTools: sandboxes,
    });
  }

  const renderToolCard = (tool: (typeof tools)[number]) => {
    const Icon = tool.icon;
    return (
      <Link key={tool.id} href={`/tools/${tool.slug}`} className="group">
        <Card className="h-full border transition-all hover:border-primary hover:bg-muted/50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted group-hover:bg-background transition-colors">
              <Icon className="size-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="font-mono text-base font-semibold truncate">
                {tool.name}
              </CardTitle>
              <CardDescription className="font-mono text-xs mt-0.5 truncate">
                {tool.description}
              </CardDescription>
            </div>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background dark">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-mono text-2xl font-bold text-foreground md:text-5xl lg:text-6xl">
            <span className="text-muted-foreground">&gt;</span> developer_tools
            <span className="terminal-cursor ml-2 inline-block text-primary">|</span>
          </h1>
          <p className="mx-auto max-w-2xl font-mono text-lg text-muted-foreground">
            Essential utilities for developers. Fast and simple.
          </p>
          <p className="mt-2 font-mono text-sm text-muted-foreground/70 flex items-center justify-center ">
            by <span className="holographic-shimmer ml-1">Kevin</span>
            <a
              href="https://github.com/k-dang"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center ml-2 hover:text-primary transition-colors"
              aria-label="GitHub repository"
            >
              <Image
                src="/github.svg"
                alt="GitHub"
                width={24}
                height={24}
                className="dark:invert"
              />
            </a>
          </p>
          <KeyboardShortcut />
        </div>

        {/* Grouped Tool Sections (mirrors the sidebar grouping) */}
        <div className="flex flex-col gap-10">
          {sections.map((section, index) => (
            <section
              key={section.id}
              className="section-reveal"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="mb-5 flex items-center gap-3">
                <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-foreground">
                  <span className="text-[#4ade80]">$</span> {section.label}
                </h2>
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground/40">
                  [{section.groupTools.length.toString().padStart(2, "0")}]
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {section.groupTools.map(renderToolCard)}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
