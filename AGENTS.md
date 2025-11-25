# AGENTS.md

# Project Overview

This is a **Developer Tool Dashboard** built with Next.js, providing various utility tools for developers including JSON formatting, Base64 encoding/decoding, hash generation, JWT decoding, and more.

# Project Structure

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI (`@radix-ui/*`)
- **Package Manager**: `pnpm`

## Key Directories

- `app/`: Next.js App Router pages and layouts
  - `page.tsx`: Main dashboard entry point
  - `tools/`: Individual tool pages (e.g., `base64/page.tsx`, `json-formatter/page.tsx`)
  - `globals.css`: Global styles and Tailwind directives
- `components/`: React components
  - `tools/`: Tool-specific components (e.g., `json-formatter.tsx`, `base64-tool.tsx`)
  - `ui/`: Reusable UI components from Shadcn UI
- `lib/`: Utility functions and configurations
  - `tools-config.ts`: Tool configuration and metadata
  - `utils.ts`: Helper functions (e.g., `cn` utility)

# Development Guidelines

## Adding New Tools

1. Create a new component in `components/tools/` (e.g., `my-tool.tsx`)
2. Export it from `components/tools/index.ts`
3. Add tool configuration to `lib/tools-config.ts`
4. Create a page route in `app/tools/my-tool/page.tsx` that imports and renders the component

## Code Style

- Use functional components with React Hooks
- Prefer `useState` for local component state
- Use Shadcn UI components from `components/ui/` for consistency
- Icons from `lucide-react`
- Follow TypeScript best practices with proper typing

## Common Patterns

- Tools typically accept user input, process it, and display results
- Use controlled components for form inputs
- Implement real-time updates where appropriate (e.g., as user types)
- Provide copy-to-clipboard functionality for outputs

# Commands

- `pnpm install`: Install dependencies
- `pnpm dev`: Start development server (runs on `http://localhost:3000`)
- `pnpm build`: Build for production
- `pnpm start`: Start production server
- `pnpm lint`: Lint code

