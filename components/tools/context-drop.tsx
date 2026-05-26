"use client";

import { useSyncExternalStore } from "react";
import { CopyButton } from "@/components/ui/copy-button";
import { ArrowRight, Check, X } from "lucide-react";

export function ContextDrop() {
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
    <div className="w-full space-y-3">
      {/* ── HERO ─────────────────────────────────────────── */}
      <div className="border border-border bg-card p-6 sm:p-8">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Context Drop
        </p>
        <p className="mb-6 max-w-lg text-sm text-muted-foreground">
          When work moves between agents — a new session, a different tool, a
          teammate&apos;s agent — the receiving side starts cold. The{" "}
          <em>why</em> is stranded in a conversation the next agent cannot see.
        </p>

        {/* Flow visualization */}
        <div className="flex items-stretch overflow-x-auto">
          <FlowBox label="producing agent" code="create_drop()" />
          <FlowConnector />
          <FlowBox label="drop link" code="/h/<id>" highlighted />
          <FlowConnector />
          <FlowBox label="consuming agent" code="fetch(url)" />
        </div>
      </div>

      {/* ── TWO-COLUMN: Connect + How it works ───────────── */}
      <div className="grid gap-3 lg:grid-cols-[3fr_2fr]">
        {/* Connect your agent */}
        <div className="border border-border bg-card p-6">
          <p className="mb-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Setup
          </p>
          <h2 className="mb-1 text-base font-medium text-foreground">
            Connect your agent
          </h2>
          <p className="mb-5 text-sm text-muted-foreground">
            Point a coding agent at this MCP server to expose{" "}
            <code className="rounded-none bg-muted px-1 font-mono text-foreground">
              create_drop
            </code>
            . The receiving agent needs none of this — it just fetches the
            link.
          </p>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs text-muted-foreground">
                MCP server configuration
              </p>
              <div className="relative">
                <pre className="overflow-x-auto border border-border bg-muted p-3 pr-12 font-mono text-xs text-foreground">
                  {mcpJson}
                </pre>
                <div className="absolute right-2 top-2">
                  <CopyButton textToCopy={mcpJson} />
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs text-muted-foreground">
                Claude Code CLI
              </p>
              <div className="relative">
                <pre className="overflow-x-auto border border-border bg-muted p-3 pr-12 font-mono text-xs text-foreground">
                  {cliCommand}
                </pre>
                <div className="absolute right-2 top-2">
                  <CopyButton textToCopy={cliCommand} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="border border-border bg-card p-6">
          <p className="mb-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Flow
          </p>
          <h2 className="mb-5 text-base font-medium text-foreground">
            How it works
          </h2>

          <div>
            {[
              {
                n: "01",
                title: "Produce",
                body: (
                  <>
                    Call{" "}
                    <code className="rounded-none bg-muted px-1 font-mono text-xs text-foreground">
                      create_drop(markdown, title?)
                    </code>{" "}
                    with the curated handoff.
                  </>
                ),
              },
              {
                n: "02",
                title: "Receive link",
                body: (
                  <>
                    Get back a permanent link like{" "}
                    <code className="rounded-none bg-muted px-1 font-mono text-xs text-foreground">
                      {origin}/h/&lt;id&gt;
                    </code>
                    .
                  </>
                ),
              },
              {
                n: "03",
                title: "Consume",
                body: "The receiving agent fetches that URL and gets the markdown byte-for-byte — no MCP, no auth.",
              },
            ].map((step, i, arr) => (
              <div key={step.n} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex size-7 shrink-0 items-center justify-center border border-border bg-muted font-mono text-[11px] text-muted-foreground">
                    {step.n}
                  </div>
                  {i < arr.length - 1 && (
                    <div className="my-1 w-px flex-1 bg-border" />
                  )}
                </div>
                <div className={i < arr.length - 1 ? "pb-5" : ""}>
                  <p className="mb-1 text-sm font-medium text-foreground">
                    {step.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HANDOFF GUIDE ────────────────────────────────── */}
      <div className="border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-base font-medium text-foreground">
            A handoff, not a codebase dump
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Drops are for curated context the next agent can&apos;t re-derive
            cheaply — not raw material it can read for itself.
          </p>
        </div>
        <div className="grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0 divide-border">
          <div className="space-y-3 p-6">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Check className="size-4 text-green-500" />
              Good to drop
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                "The task and what “done” means",
                "Decisions already made and their rationale",
                "Constraints, gotchas, and open questions",
                "Where to pick up and what to avoid",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <ArrowRight className="mt-0.5 size-3.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3 p-6">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <X className="size-4 text-red-500" />
              Not a Drop
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                "Whole-file or whole-repo source dumps",
                "Raw transcripts pasted verbatim",
                "Anything the receiver can read from the repo itself",
                "Content over the 4.5 MB platform ceiling",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <ArrowRight className="mt-0.5 size-3.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowBox({
  label,
  code,
  highlighted = false,
}: {
  label: string;
  code: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`shrink-0 border p-4 ${
        highlighted
          ? "border-foreground/30 bg-card ring-1 ring-foreground/10"
          : "border-border bg-muted"
      }`}
    >
      <div className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="font-mono text-sm text-foreground">{code}</div>
    </div>
  );
}

function FlowConnector() {
  return (
    <div className="flex min-w-12 flex-1 items-center">
      <div className="h-px w-full bg-border" />
    </div>
  );
}
