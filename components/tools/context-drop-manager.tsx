"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, RefreshCw, Trash2, Wrench } from "lucide-react";
import type { DropSummary } from "@/lib/context-drop/types";
import { deleteDropAction, listDropsAction } from "@/app/tools/context-drop/actions";

function formatCreatedAt(iso: string): string {
  return new Date(iso).toISOString().replace("T", " ").replace(/\.\d+Z$/, " UTC");
}

export function ContextDropManager({
  initialDrops,
  initialError = false,
}: {
  initialDrops: DropSummary[];
  initialError?: boolean;
}) {
  const [drops, setDrops] = useState(initialDrops);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    initialError ? "Could not load Drops from storage." : null,
  );
  const [isPending, startTransition] = useTransition();

  const refresh = () => {
    setError(null);
    startTransition(async () => {
      try {
        setDrops(await listDropsAction());
      } catch {
        setError("Could not refresh Drops.");
      }
    });
  };

  const remove = (id: string) => {
    setError(null);
    setConfirmId(null);
    startTransition(async () => {
      try {
        setDrops(await deleteDropAction(id));
      } catch {
        setError("Could not delete that Drop.");
      }
    });
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Wrench className="size-5" />
          Manage Drops
        </CardTitle>
        <CardDescription>
          Local-only. This list and the delete action are unavailable on the
          deployed site — production cleanup requires running the app locally.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {drops.length} {drops.length === 1 ? "Drop" : "Drops"} stored
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isPending}
          >
            <RefreshCw className="size-3.5" />
            Refresh
          </Button>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {drops.length === 0 ? (
          <p className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            No Drops yet. Create one via the{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">
              create_drop
            </code>{" "}
            MCP tool.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {drops.map((drop) => (
              <li
                key={drop.id}
                className="flex items-center gap-4 px-4 py-3 text-sm"
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="truncate font-medium text-foreground">
                    {drop.title ?? (
                      <span className="italic text-muted-foreground">
                        Untitled
                      </span>
                    )}
                  </p>
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <a
                      href={`/h/${drop.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-mono hover:text-foreground hover:underline"
                    >
                      {drop.id}
                      <ExternalLink className="size-3" />
                    </a>
                    <span>{formatCreatedAt(drop.createdAt)}</span>
                  </p>
                </div>

                {confirmId === drop.id ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => remove(drop.id)}
                      disabled={isPending}
                    >
                      Confirm delete
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmId(null)}
                      disabled={isPending}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => setConfirmId(drop.id)}
                    disabled={isPending}
                    aria-label={`Delete Drop ${drop.id}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
