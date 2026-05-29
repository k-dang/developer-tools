import type { Metadata } from "next";
import { GraphqlFormatter } from "@/components/tools";

export const metadata: Metadata = {
  title: "GraphQL Formatter | DevTools",
  description: "Format and prettify GraphQL queries and schemas",
};

export default function GraphqlFormatterPage() {
  return <GraphqlFormatter />;
}
