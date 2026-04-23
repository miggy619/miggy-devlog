# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev       # start dev server (Next.js 16, port 3000)
npm run build     # production build
npm run lint      # ESLint
```

No test suite is configured.

## Stack

- **Next.js 16** (App Router, React 19, TypeScript)
- **Tailwind CSS v4** — CSS-first config, NO `tailwind.config.js` (it was deleted on the v4 migration)
- **shadcn-style UI primitives** in `src/components/ui/` built with `class-variance-authority` + `tailwind-merge` + `@radix-ui/react-slot`
- **Dark-only** — `next-themes` and `@tailwindcss/typography` are removed. There is no theme toggle and no `dark:` class toggling. All colors are hard-coded for the dark palette (`bg-zinc-950` body, cyan-400 / violet-400 accents).
- **Octokit** for the admin posting flow

## Content pipeline

Markdown files in `content/posts/` are parsed at build/request time by `src/lib/posts.ts` (`gray-matter` for frontmatter, `remark` + `remark-html` for body → HTML via `src/lib/render-markdown.ts`). No database or CMS.

**Frontmatter shape:**
```yaml
title: string
date: "YYYY-MM-DD"
summary: string
tags: string[]   # optional
image: string    # optional, web path like "/images/posts/<slug>.png"
```

Cover images live in `public/images/posts/<slug>.<ext>`.

`src/lib/posts.ts` exports:
- `getAllPosts()` — sorted by date desc, no body
- `getPostBySlug(slug)` — includes rendered `contentHtml`
- `getPostRawBySlug(slug)` — includes raw `body` (used by the edit form)

## Routing

| Path | Notes |
|---|---|
| `/` | HUD-style homepage: hero + stats strip + "Now Building" project card with Phase 1/Phase 2 milestones + latest 4 logs |
| `/posts` | Archive list with thumbnails |
| `/posts/[slug]` | Article view with `ScrollProgress`, prev/next nav, reading time |
| `/admin` | Password-gated dashboard (lists posts, edit/delete) |
| `/admin/new` | Create post — three-tab editor: Write / Raw MD / Preview |
| `/admin/edit/[slug]` | Edit existing post (renames file when title changes) |

Next.js 16 dynamic params are async — `params` is a `Promise` and must be `await`ed (`const { slug } = await params`).

## Admin / GitHub commit pipeline

The admin pages use server actions in `src/app/admin/actions.ts` (delete, update) and `src/app/admin/new/actions.ts` (create). Each action:

1. Verifies the password with `passwordMatches` (timing-safe SHA-256 in `src/lib/admin-auth.ts`).
2. Validates inputs (title ≤120, summary ≤400, body ≤200KB, image ≤5MB png/jpg/webp/gif, date `YYYY-MM-DD`).
3. Builds the markdown (`buildFrontmatter` + body) and uses Octokit's git tree API to make **one atomic commit** that touches both the markdown file and (optionally) the image blob.
4. Calls `revalidatePath` on `/`, `/posts`, `/admin`, and the affected slug.

Vercel rebuilds on push (~60s). The "Raw MD" tab on the new-post form uses `parseFrontmatter` from `src/lib/frontmatter.ts` to load a pasted `.md` file (frontmatter + body) into the form state; image cover is still a separate file upload.

**Required env vars:**
- `POST_PASSWORD` — admin password
- `GITHUB_TOKEN` — PAT with `contents:write` on the repo
- `GITHUB_REPO_OWNER`, `GITHUB_REPO_NAME`
- `GITHUB_BRANCH` — optional, defaults to `main`
- `NEXT_PUBLIC_GITHUB_REPO` — optional, displayed in the form footer

## Styling system

**Tailwind v4 config lives in `src/app/globals.css`:**
```css
@import "tailwindcss";
@theme {
  --font-sans: var(--font-geist-sans), ...;
  --font-mono: var(--font-geist-mono), ...;
}
```
There is no JS config file. Theme values, custom variants, and plugins all go in CSS.

**Custom utility classes** (defined in `globals.css`, used widely):
- `gradient-text` — animated cyan→violet text gradient
- `gradient-border-wrap` — animated gradient border container
- `corner-brackets` — HUD-style cyan corner accents
- `card-glow` — cyan hover shadow on cards
- `dot-grid`, `grid-lines`, `noise-overlay` — ambient background layers
- `animate-fade-up`, `animate-float`, `reveal`, `page-transition` — animation primitives

**Layout chrome:**
- `<AmbientBackground>` is rendered once in `layout.tsx` (fixed `z-0`, cursor-follow cyan glow on desktop, respects `prefers-reduced-motion` and coarse pointers).
- `<Reveal>` wraps content for IntersectionObserver-based scroll-in animations (sets `data-reveal-visible` when intersecting).
- `app/template.tsx` wraps every route in `.page-transition` (fade-in on navigation).

**Prose styling** (`/posts/[slug]` and the live `MarkdownPreview`):
Markdown HTML is injected via `dangerouslySetInnerHTML` inside `<div className="prose-content">`. Styles for headings/paragraphs/lists/code/blockquotes are defined manually under `.prose-content` in `globals.css` (cyan H2 left-border, cyan list markers, dark code blocks). **Do not add `prose` classes** — `@tailwindcss/typography` is not installed.

## Conventions

- **Use the UI primitives** in `src/components/ui/` (`Button`, `Badge`, `Container`, `Eyebrow`, `SectionHeader`, `Input`, `Textarea`, `Label`, etc.) instead of raw HTML elements where possible. They use `cva` for variants — see `button.tsx` for the pattern.
- **Combine classes with `cn()`** from `src/lib/utils.ts` (clsx + tailwind-merge).
- **Client components** must declare `"use client"`. Anything reading `window`, mounting effects, or using `usePathname` is a client component.
- **Slugs** come from `slugify()` in `src/lib/slugify.ts` — lowercased, alphanumeric+dash, max 80 chars.
- **Sub-day post naming**: posts shipped on the same calendar day use `day-N-M-...` slugs (e.g. `day-2-1`, `day-2-5`) so the archive sorts naturally.
