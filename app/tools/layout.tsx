"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getToolBySlug } from "@/lib/tools-config";

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const toolSlug = pathname.split("/").pop() || "";
  const currentTool = getToolBySlug(toolSlug);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex shrink-0 items-center gap-2 border-b p-4 bg-card">
          <SidebarTrigger className="mr-2 sm:hidden" />
          {currentTool && (
            <div className="flex flex-col">
              <h2 className="text-2xl font-semibold text-foreground">{currentTool.name}</h2>
              <p className="text-sm text-muted-foreground">{currentTool.description}</p>
            </div>
          )}
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
