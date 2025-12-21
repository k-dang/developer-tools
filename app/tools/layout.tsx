"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { tools, getToolBySlug } from "@/lib/tools-config";

function NavigationContent() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 p-4">
      {tools.map((tool) => {
        const href = `/tools/${tool.slug}`;
        const isActive = pathname === href;
        const Icon = tool.icon;

        return (
          <Link
            key={tool.id}
            href={href}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="size-4" />
            <span className="font-medium">{tool.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const toolSlug = pathname.split("/").pop() || "";
  const currentTool = getToolBySlug(toolSlug);

  return (
    <div className="flex h-screen bg-background dark">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r border-border bg-card sm:block">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <h1 className="font-mono text-lg font-semibold text-foreground">
            <Link href="/">
              <span className="text-muted-foreground">&gt;</span> developer_tools
            </Link>
          </h1>
        </div>
        <NavigationContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {currentTool && (
          <div className="border-b border-border bg-card px-4 py-4 md:px-6">
            <h2 className="text-2xl font-semibold text-foreground">{currentTool.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{currentTool.description}</p>
          </div>
        )}
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
