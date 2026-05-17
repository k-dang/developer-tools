export type ContextDrop = {
  id: string;
  markdown: string;
  title?: string;
  createdAt: string;
};

export type DropSummary = Pick<ContextDrop, "id" | "title" | "createdAt">;
