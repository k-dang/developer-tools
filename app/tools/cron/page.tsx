import type { Metadata } from "next";
import { CronAssistant } from "@/components/tools";

export const metadata: Metadata = {
  title: "Cron Helper | DevTools",
  description: "Parse cron expressions into human-readable schedules, validate syntax, and view execution times",
};

export default function CronPage() {
  return <CronAssistant />;
}

