import type { Metadata } from "next";
import { GraphqlPrettifier } from "@/components/tools";

export const metadata: Metadata = {
  title: "GraphQL Prettifier | DevTools",
  description: "Format and prettify GraphQL queries and schemas",
};

export default function GraphqlPrettifierPage() {
  return <GraphqlPrettifier />;
}
