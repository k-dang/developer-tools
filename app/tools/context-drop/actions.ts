"use server";

import { deleteDrop, listDrops } from "@/lib/context-drop/store";
import type { DropSummary } from "@/lib/context-drop/types";

const DISABLED_ERROR = "Context Drop management is available only when the app runs locally.";

export async function listDropsAction(): Promise<DropSummary[]> {
  if (process.env.NODE_ENV === "production") throw new Error(DISABLED_ERROR);
  return listDrops();
}

export async function deleteDropAction(id: string): Promise<DropSummary[]> {
  if (process.env.NODE_ENV === "production") throw new Error(DISABLED_ERROR);
  await deleteDrop(id);
  return listDrops();
}
