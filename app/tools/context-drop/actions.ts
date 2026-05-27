"use server";

import { cookies } from "next/headers";
import { deleteDrop, listDrops } from "@/lib/context-drop/store";
import type { DropSummary } from "@/lib/context-drop/types";

async function assertAuthorized(): Promise<void> {
  const secret = process.env.DROP_MANAGER_SECRET;
  if (!secret) throw new Error("Drop manager is not configured.");
  const cookieStore = await cookies();
  if (cookieStore.get("drop_manager_token")?.value !== secret) {
    throw new Error("Not authorized.");
  }
}

export async function listDropsAction(): Promise<DropSummary[]> {
  await assertAuthorized();
  return listDrops();
}

export async function deleteDropAction(id: string): Promise<DropSummary[]> {
  await assertAuthorized();
  await deleteDrop(id);
  return listDrops();
}
