"use client";

import { useSyncExternalStore } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { ArrowRight, Check, Share2, X } from "lucide-react";

export function ContextDrop() {
  // Resolved on the client so the config reflects the host the operator is
  // actually viewing (localhost in dev, the deployed domain in prod). The
  // server snapshot is a placeholder; useSyncExternalStore swaps in the real
  // origin after hydration without a mismatch.
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => "https://your-deployment.example.com",
  );

  const mcpUrl = `${origin}/api/mcp`;

  const mcpJson = JSON.stringify(
    {
      mcpServers: {
        "context-drop": {
          url: mcpUrl,
        },
      },
    },
    null,
    2,
  );

  const cliCommand = `claude mcp add --transport http context-drop ${mcpUrl}`;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Share2 className="size-5" />
            What is a Context Drop?
          </CardTitle>
          <CardDescription>
            A single markdown handoff one AI agent publishes and another agent — or a
            human — picks up at a permanent link.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            When work moves between agents — a new session, a different tool, a
            teammate&apos;s agent — the receiving side starts cold. The{" "}
            <em>why</em> (the task, the decisions made, the constraints, the open
            questions) is stranded in a conversation the next agent cannot see.
          </p>
          <p>
            A producing agent calls one MCP tool,{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">
              create_drop
            </code>
            , and gets back a Drop Link. Whoever picks up the task fetches that link
            and receives the markdown verbatim — no rendering, no auth, nothing else
            to install on the receiving side.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Connect your agent</CardTitle>
          <CardDescription>
            Point a coding agent at this MCP server to expose{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">
              create_drop
            </code>
            . The receiving agent needs none of this — it just fetches the link.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              MCP server configuration
            </p>
            <div className="relative">
              <pre className="overflow-x-auto rounded-md border border-border bg-muted p-4 pr-14 font-mono text-xs text-foreground">
                {mcpJson}
              </pre>
              <div className="absolute right-2 top-2">
                <CopyButton textToCopy={mcpJson} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Or, with the Claude Code CLI
            </p>
            <div className="relative">
              <pre className="overflow-x-auto rounded-md border border-border bg-muted p-4 pr-14 font-mono text-xs text-foreground">
                {cliCommand}
              </pre>
              <div className="absolute right-2 top-2">
                <CopyButton textToCopy={cliCommand} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
                1
              </span>
              <span>
                The producing agent calls{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">
                  create_drop(markdown, title?)
                </code>{" "}
                with the curated handoff.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
                2
              </span>
              <span>
                It receives a permanent Drop Link like{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">
                  {origin}/h/&lt;id&gt;
                </code>
                .
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
                3
              </span>
              <span>
                The receiving agent fetches that URL and gets the markdown
                byte-for-byte — no MCP server, no auth, no rendering.
              </span>
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">
            A handoff, not a codebase dump
          </CardTitle>
          <CardDescription>
            Drops are for curated context that the next agent can&apos;t re-derive
            cheaply — not raw material it can read for itself.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Check className="size-4 text-green-500" />
              Good to drop
            </p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <ArrowRight className="mt-0.5 size-3.5 shrink-0" />
                The task and what &quot;done&quot; means
              </li>
              <li className="flex gap-2">
                <ArrowRight className="mt-0.5 size-3.5 shrink-0" />
                Decisions already made and their rationale
              </li>
              <li className="flex gap-2">
                <ArrowRight className="mt-0.5 size-3.5 shrink-0" />
                Constraints, gotchas, and open questions
              </li>
              <li className="flex gap-2">
                <ArrowRight className="mt-0.5 size-3.5 shrink-0" />
                Where to pick up and what to avoid
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <X className="size-4 text-red-500" />
              Not a Drop
            </p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <ArrowRight className="mt-0.5 size-3.5 shrink-0" />
                Whole-file or whole-repo source dumps
              </li>
              <li className="flex gap-2">
                <ArrowRight className="mt-0.5 size-3.5 shrink-0" />
                Raw transcripts pasted verbatim
              </li>
              <li className="flex gap-2">
                <ArrowRight className="mt-0.5 size-3.5 shrink-0" />
                Anything the receiver can read from the repo itself
              </li>
              <li className="flex gap-2">
                <ArrowRight className="mt-0.5 size-3.5 shrink-0" />
                Content over the 4.5 MB platform ceiling
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
