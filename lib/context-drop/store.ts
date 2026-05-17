import { del, get, list, put } from "@vercel/blob";
import { generateDropId } from "./id";
import type { ContextDrop, DropSummary } from "./types";

const PREFIX = "drops/";
const pathnameFor = (id: string) => `${PREFIX}${id}.json`;

/** Persist a new Drop. Returns the stored record (id is freshly generated). */
export async function createDrop(input: {
  markdown: string;
  title?: string;
}): Promise<ContextDrop> {
  const drop: ContextDrop = {
    id: generateDropId(),
    markdown: input.markdown,
    ...(input.title ? { title: input.title } : {}),
    createdAt: new Date().toISOString(),
  };

  await put(pathnameFor(drop.id), JSON.stringify(drop), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: false,
    contentType: "application/json",
  });

  return drop;
}

/** Fetch a Drop by id. Returns null for an unknown id. */
export async function getDrop(id: string): Promise<ContextDrop | null> {
  const result = await get(pathnameFor(id), { access: "public" });
  if (!result) return null;

  const raw = await new Response(result.stream).text();
  return JSON.parse(raw) as ContextDrop;
}

/** List all Drops as summaries (no markdown body) for the dev-only manage UI. */
export async function listDrops(): Promise<DropSummary[]> {
  const summaries: DropSummary[] = [];
  let cursor: string | undefined;

  do {
    const page = await list({ prefix: PREFIX, cursor, limit: 1000 });
    for (const blob of page.blobs) {
      const drop = await getDrop(idFromPathname(blob.pathname));
      if (drop) {
        summaries.push({ id: drop.id, title: drop.title, createdAt: drop.createdAt });
      }
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  return summaries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Delete a Drop by id. No-op if it does not exist. */
export async function deleteDrop(id: string): Promise<void> {
  await del(pathnameFor(id));
}

function idFromPathname(pathname: string): string {
  return pathname.slice(PREFIX.length).replace(/\.json$/, "");
}
