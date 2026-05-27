import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ContextDrop, ContextDropManager } from "@/components/tools";
import { listDrops } from "@/lib/context-drop/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Context Drop | DevTools",
  description: "Hand off curated context between AI agents via a single link",
};

export const dynamic = "force-dynamic";

async function isAuthorized(): Promise<boolean> {
  const secret = process.env.DROP_MANAGER_SECRET;
  if (!secret) return false;
  const cookieStore = await cookies();
  return cookieStore.get("drop_manager_token")?.value === secret;
}

export default async function ContextDropPage() {
  const showManager = await isAuthorized();
  const managerConfigured = !!process.env.DROP_MANAGER_SECRET;

  let drops: Awaited<ReturnType<typeof listDrops>> = [];
  let loadError = false;
  if (showManager) {
    try {
      drops = await listDrops();
    } catch {
      loadError = true;
    }
  }

  return (
    <div className="w-full space-y-3">
      <ContextDrop />
      {showManager ? (
        <ContextDropManager initialDrops={drops} initialError={loadError} />
      ) : managerConfigured ? (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Lock className="size-5" />
              Unlock manager
            </CardTitle>
            <CardDescription>
              Enter your access token to manage Drops.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              method="POST"
              action="/tools/context-drop/grant"
              className="flex gap-2"
            >
              <Input
                name="token"
                type="password"
                placeholder="Access token"
                className="max-w-sm font-mono"
              />
              <Button type="submit">Unlock</Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
