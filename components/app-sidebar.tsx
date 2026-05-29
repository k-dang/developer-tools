"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { tools } from "@/lib/tools-config";
import { ChevronRight } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const TOOL_GROUPS = [
  {
    id: "format",
    label: "Format",
    slugs: ["json-formatter", "graphql-formatter", "regex", "markdown-viewer"],
  },
  {
    id: "encode",
    label: "Encode",
    slugs: ["base64", "url-encoder", "jwt-decoder"],
  },
  {
    id: "generate",
    label: "Generate",
    slugs: ["hash", "guid-generator", "lorem-ipsum"],
  },
  {
    id: "visual",
    label: "Visual",
    slugs: ["color-picker", "image-converter", "screenshot-composer", "favicon-generator"],
  },
  {
    id: "utilities",
    label: "Utilities",
    slugs: ["timestamp", "character-counter", "cron", "text-differ", "csv-viewer", "context-drop"],
  },
] as const;

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const activeSlug = pathname.split("/").pop() ?? "";
  const activeGroupId = TOOL_GROUPS.find((g) => (g.slugs as readonly string[]).includes(activeSlug))?.id;

  const [openedByUser, setOpenedByUser] = useState<Set<string>>(new Set());
  const [closedByUser, setClosedByUser] = useState<Set<string>>(new Set());

  const isGroupOpen = (id: string) => {
    if (closedByUser.has(id)) return false;
    return id === activeGroupId || openedByUser.has(id);
  };

  const toggleGroup = (id: string) => {
    if (isGroupOpen(id)) {
      setClosedByUser((prev) => new Set([...prev, id]));
      setOpenedByUser((prev) => { const n = new Set(prev); n.delete(id); return n; });
    } else {
      setOpenedByUser((prev) => new Set([...prev, id]));
      setClosedByUser((prev) => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  const handleLinkClick = () => {
    if (isMobile) setOpenMobile(false);
  };

  const toolsBySlug = useMemo(() => Object.fromEntries(tools.map((t) => [t.slug, t])), []);
  const sandboxTools = tools.filter((t) => t.category === "sandboxes");

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex h-14 items-center px-4">
          <Link
            href="/"
            className="font-mono text-sm font-semibold text-foreground transition-colors hover:text-foreground/70"
          >
            <span className="text-muted-foreground">&gt;</span> developer_tools
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-2 pt-1 pb-0">
          <SidebarGroupLabel className="px-2 text-[10px] uppercase tracking-widest text-muted-foreground/50">
            Tools
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-1 flex flex-col gap-0.5">
            {TOOL_GROUPS.map((group) => {
              const isOpen = isGroupOpen(group.id);
              const isActiveGroup = group.id === activeGroupId;
              const groupTools = group.slugs.map((s) => toolsBySlug[s]).filter(Boolean);

              return (
                <div key={group.id}>
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2 py-1.5 transition-colors",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActiveGroup
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider">
                      {isActiveGroup && !isOpen && (
                        <span className="text-[#4ade80]">▸</span>
                      )}
                      {group.label}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-muted-foreground/40">
                        {group.slugs.length}
                      </span>
                      <ChevronRight
                        className={cn(
                          "size-3 text-muted-foreground/40 transition-transform duration-150",
                          isOpen && "rotate-90",
                        )}
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="ml-2 mt-0.5 border-l border-border">
                      <SidebarMenu className="gap-0 pl-2">
                        {groupTools.map((tool) => {
                          const href = `/tools/${tool.slug}`;
                          const isActive = pathname === href;
                          const Icon = tool.icon;
                          return (
                            <SidebarMenuItem key={tool.id}>
                              <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                size="sm"
                                className={cn(
                                  isActive &&
                                    "shadow-[inset_2px_0_0_#4ade80] text-foreground font-medium",
                                )}
                              >
                                <Link href={href} onClick={handleLinkClick}>
                                  <Icon className="size-3.5 shrink-0" />
                                  <span>{tool.name}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })}
                      </SidebarMenu>
                    </div>
                  )}
                </div>
              );
            })}
          </SidebarGroupContent>
        </SidebarGroup>

        {sandboxTools.length > 0 && (
          <>
            <SidebarGroup className="px-2 pb-2">
              <SidebarGroupLabel className="px-2 text-[10px] uppercase tracking-widest text-muted-foreground/50">
                Sandboxes
              </SidebarGroupLabel>
              <SidebarGroupContent className="mt-1">
                <SidebarMenu>
                  {sandboxTools.map((tool) => {
                    const href = `/tools/${tool.slug}`;
                    const isActive = pathname === href;
                    const Icon = tool.icon;
                    return (
                      <SidebarMenuItem key={tool.id}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          size="sm"
                          className={cn(
                            isActive &&
                              "shadow-[inset_2px_0_0_#4ade80] text-foreground font-medium",
                          )}
                        >
                          <Link href={href} onClick={handleLinkClick}>
                            <Icon className="size-3.5 shrink-0" />
                            <span>{tool.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarRail className="hover:after:bg-transparent" />
    </Sidebar>
  );
}
