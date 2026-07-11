# DarkForestEditor

Tauri 2 desktop app with a Svelte 5, TypeScript, Vite, Tailwind CSS 4, and Monaco frontend.

## Structure

- `src/features/<feature>/`: feature UI, services, and local helpers.
- `src/features/app/`: application bootstrap and shared app utilities.
- `src/features/ui/`: reusable UI components.
- `src-tauri/`: Rust backend and Tauri configuration.
- Use `@df/*` for imports from `src/features/*`.

## Style

- Keep code and LOC minimal; prefer simple, direct solutions over abstraction or extensibility.
- Add only what was requested. Avoid speculative helpers, complex patterns, and other clutter.
- Ask before proceeding when requirements are unclear.
- Use snake_case for TypeScript variables and functions; name Svelte components `*.ui.svelte` and services `*.service.ts`.
- Keep components small and move behavior into feature services.
- Declare feature bus events in `bus.type.ts`; `BusEvents` merges them into the typed `bus.signal`, `bus.on`, and `bus.bind` APIs.
- Use `void` for events without payloads; listeners receive the generated timestamp.
- Prefer Tailwind `@apply` rules inside `<style lang="postcss">` over inline utility classes.
- Give each UI component root the classes `<feature> <file_ui>` (for example, `editor editor_ui`).
- Keep shared design values as CSS variables in `src/main.css`.
- Follow Prettier: two spaces and no semicolons.
- Before handing off changes, run `pnpm check`, `pnpm format:check`, and `pnpm build`.

## Requirements

- Feature requirements live in `requirements/`.
- For a request such as `implement 001`, follow `skills/implement-requirement/SKILL.md`.
- For a request such as `add icon <svg>`, follow `skills/add-icon/SKILL.md`.
- For a request to commit changes, follow `skills/commit/SKILL.md`.
- Before implementing a requirement, review it, ask about unclear decisions, and update it for clarity once aligned.
- Only then implement it. When complete, offer to create logical commits.
