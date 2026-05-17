export function dropUrl(id: string): string {
  return `${baseUrl()}/h/${id}`;
}

function baseUrl(): string {
  const explicit = process.env.CONTEXT_DROP_BASE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  // Vercel injects these as bare hosts (no protocol).
  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercelHost) return `https://${vercelHost}`;

  return "http://localhost:3000";
}
