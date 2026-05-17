import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { createDrop } from "@/lib/context-drop/store";
import { dropUrl } from "@/lib/context-drop/url";
import { validateCreateInput } from "@/lib/context-drop/validate";

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "create_drop",
      {
        title: "Create a Context Drop",
        description:
          "Publish a curated markdown handoff (a Context Drop) and get back a permanent Drop Link. " +
          "Use this to pass task context — the goal, decisions made, constraints, open questions — " +
          "to another agent or a human. A Context Drop is a curated handoff, not a codebase dump. " +
          "The receiving side only needs to fetch the returned URL; it needs nothing from this server.",
        inputSchema: {
          markdown: z
            .string()
            .describe("The full handoff content as markdown. Stored and served verbatim."),
          title: z
            .string()
            .optional()
            .describe(
              "Optional human-facing label, shown only in the dev management view. Never added to the body.",
            ),
        },
        outputSchema: {
          id: z.string().describe("The Context Drop id."),
          url: z.string().describe("The permanent Drop Link to hand off."),
        },
      },
      async ({ markdown, title }) => {
        const validated = validateCreateInput({ markdown, title });
        if (!validated.ok) {
          return {
            content: [{ type: "text", text: validated.error }],
            isError: true,
          };
        }

        const drop = await createDrop(validated.value);
        const url = dropUrl(drop.id);

        return {
          content: [
            {
              type: "text",
              text:
                `Context Drop created. Hand off this link — the receiver just fetches it:\n${url}\n\n` +
                JSON.stringify({ id: drop.id, url }),
            },
          ],
          structuredContent: { id: drop.id, url },
        };
      },
    );
  },
  {},
  {
    // app/api/[transport]/route.ts -> the Streamable HTTP endpoint is /api/mcp
    basePath: "/api",
    maxDuration: 60,
  },
);

export { handler as GET, handler as POST };
