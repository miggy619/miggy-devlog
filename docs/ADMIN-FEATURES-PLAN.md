# Admin Features Plan — Preview / Delete / Edit

> **Context:** `/admin/new` currently commits a brand-new post (markdown + optional cover image) to GitHub via an atomic Octokit tree commit, triggering a Vercel rebuild. This plan adds three capabilities on top of it: preview-before-commit, delete-existing, and edit-existing.
>
> **Order of execution:** Phase A → B → C. Each phase is its own PR; they layer cleanly and stop being useful in reverse. Preview alone gives ~80% of the "confidence before commit" value.

---

## Existing building blocks (already in repo)

- `src/app/admin/new/actions.ts` — `createPost(formData)` server action. Uses `@octokit/rest` tree API. Password gate via `passwordMatches` (SHA-256 + `timingSafeEqual`). Builds frontmatter via `buildFrontmatter()`. Handles cover image as base64 blob. Returns `PostResult`.
- `src/app/admin/new/page.tsx` — client form with `useTransition`, `FormData`, and `ResultPanel`.
- `src/app/admin/layout.tsx` — `robots: { index: false, follow: false }`.
- `src/lib/slugify.ts` — `slugify(title)` used for the markdown filename.
- `src/lib/posts.ts` — `getAllPosts()` and `getPostBySlug(slug)` read `content/posts/*.md` from disk (build-time or request-time).
- `src/app/globals.css` `.prose-content` — styles for rendered markdown HTML.
- Env: `POST_PASSWORD`, `GITHUB_TOKEN`, `GITHUB_REPO_OWNER`, `GITHUB_REPO_NAME`, `GITHUB_BRANCH`.

---

## Phase A — Preview before committing

**Goal:** see the post rendered exactly as it will look on `/posts/[slug]` before hitting "Publish Log".

### Approach

Render markdown client-side inside `/admin/new/page.tsx`. Same `remark` + `remark-html` pipeline as the real post page — it's already a dep — so there's no divergence between preview and production output.

The form gains a two-tab toggle: **Write** (the current editor) / **Preview** (rendered). State is kept in the form the whole time; switching tabs doesn't reset anything.

### Files

- `src/app/admin/new/page.tsx` — modify:
  - Add `const [mode, setMode] = useState<"write" | "preview">("write")`
  - Track `body` as a controlled `useState` (was uncontrolled before, still read from FormData at submit time)
  - Track `title`, `summary`, `tags`, `date`, `image` (File) controlled too, so preview reflects the current state
  - Build a preview pane that renders a cover image URL (from the File via `URL.createObjectURL`), title, summary, meta, and body-as-HTML
  - Make a helper `renderMarkdown(body: string)` that awaits `remark().use(html).process(body)`. Cache last result via `useMemo` + debounced state, or accept the re-render cost (posts are short).
  - Revoke object URLs on cleanup

- `src/components/MarkdownPreview.tsx` — **new**:
  - Takes `{ title, summary, date, tags, imageUrl, body }` props
  - Renders the same layout the production post page uses (eyebrow → title → summary → meta → cover → divider → prose)
  - Uses `.prose-content` class for body styling
  - `body` is rendered via `dangerouslySetInnerHTML={{ __html: html }}` where `html` is the remark output

- `src/lib/render-markdown.ts` — **new**:
  - Small helper: `export async function renderMarkdown(md: string): Promise<string>`
  - Reuses the same `remark().use(html).process(md)` chain as `src/lib/posts.ts`
  - Client-safe (remark has no Node-only deps at runtime)

### UI layout options

Two tabs (simple, fits the monospace aesthetic):

```
[ write ][ preview ]
──────────────────
<textarea or preview pane>
```

Keep the **Publish Log** button at the bottom, always visible from either tab.

### Gotchas

1. **File → blob URL cleanup.** When the user picks a new cover image file, revoke the old `URL.createObjectURL` result in a `useEffect` cleanup so we don't leak blobs.
2. **Remark on the client.** remark ships ESM and works in the browser. If Turbopack complains about a Node-only dep, switch to `marked` (smaller, no unified pipeline) for preview only — the server still uses remark so there's no visible difference for typical markdown.
3. **Debouncing.** For long posts, re-rendering on every keystroke is wasteful. Use `useDeferredValue(body)` (React 19) before running remark — gives automatic debouncing with no setTimeout.
4. **Date default.** When `body` is empty, show an empty-state hint in the preview ("nothing to preview yet"), not a blank card.

### Done when

- Switching to Preview shows the rendered post including any cover image chosen
- Headings, lists, code blocks, blockquotes, links all match what `/posts/[slug]` produces
- `npm run build` still passes
- No console errors about revoked blob URLs or remark plugin resolution

---

## Phase B — Admin post list + delete

**Goal:** see every committed post at a glance; delete any post (markdown + cover image) with a confirm step.

### Approach

New `/admin` index route lists posts from disk (same `getAllPosts()` we use everywhere). Each row has **Edit** (Phase C, wired but route can 404 for now) and **Delete** buttons. Delete hits a new server action that commits a single atomic tree-delete.

Password is still the gate. Password is entered **once on the `/admin` page** (kept in a client state / sessionStorage for the duration of the admin session) so every action doesn't require re-typing. Server still verifies the password on every action — no trusting the client.

### Files

- `src/app/admin/page.tsx` — **new**:
  - Server component that calls `getAllPosts()` and renders a table/list
  - Each row: cover thumb + title + date + tags + `[Edit]` + `[Delete]`
  - Client island for the password field + per-row Delete confirm modal (use native `<dialog>` or a simple `useState` modal)
  - Top of the page has a "+ New Log" button linking to `/admin/new` and a password input that persists via `sessionStorage` under a key like `miggy_admin_pw`
  - Uses the design-system primitives: Container, Eyebrow, Button, Badge

- `src/app/admin/actions.ts` — **new** (or extend `admin/new/actions.ts`):
  - `export async function deletePost(formData: FormData): Promise<DeleteResult>`
  - Accepts `password` and `slug`
  - Validates password via `passwordMatches` (same helper)
  - Reads current branch SHA (`git.getRef`), base commit, base tree (same as `createPost`)
  - Uses `git.createTree` with `tree` entries where markdown path and (optional) image path have `sha: null` — GitHub treats null-sha entries as deletions (this is the documented pattern)
  - `git.createCommit` with message `chore: delete post ${slug}`
  - `git.updateRef` to publish
  - Revalidates the admin list and public archive (`revalidatePath('/admin')` and `revalidatePath('/posts')`)

- `src/components/admin/DeleteButton.tsx` — **new**:
  - Client component with confirm modal
  - Calls `deletePost` via `useTransition`
  - Shows loading / success / error states

- `src/components/admin/AdminPasswordBar.tsx` — **new**:
  - Sticky bar at top of `/admin` that captures the password and stores in `sessionStorage`
  - Exposes password via a simple React context or passes it to child components via prop

### Deletion detail: image path

The markdown file is `content/posts/${slug}.md`. The cover image (if any) is `public/images/posts/${slug}.${ext}` — but the server action doesn't know the extension from the slug alone. Two options:

1. **Read the markdown frontmatter before deleting**, parse `image` field, derive the exact path. Robust.
2. **Try all four extensions** (png/jpg/webp/gif) and ignore 404s. Simpler but noisier.

Go with (1). Add a helper `getPostFilesFromGitHub(slug)` that fetches the markdown via `octokit.rest.repos.getContent`, parses frontmatter, returns `{ markdownPath, imagePath? }`.

### Gotchas

1. **Partial delete.** If the markdown is deleted but the image isn't, next build will succeed (no broken reference) but the image is orphaned. One atomic tree commit with both entries prevents this.
2. **SessionStorage password.** It's only in memory for the tab's lifetime; good enough for a single admin (you). **Never** commit the password in a cookie without `HttpOnly` + `Secure`. sessionStorage is fine because it's your browser talking to your app.
3. **No CSRF token needed** because server actions in Next.js 16 are origin-checked and the password itself is the secondary factor.
4. **Revalidation.** After delete, `revalidatePath('/posts')` and `revalidatePath('/')` (homepage shows latest posts) so stale copies don't linger. The `/posts/[slug]` page for the deleted slug will 404 via `notFound()` naturally.

### Done when

- `/admin` lists every post
- Password once at top; Delete buttons prompt confirm, then commit + revalidate
- After a delete, the row disappears from `/admin` and the post vanishes from `/posts` + homepage
- Trying to visit `/posts/deleted-slug` returns the themed 404 (already handled)

---

## Phase C — Edit existing posts

**Goal:** change title/date/summary/tags/body/cover on an existing post; commit as an update.

### Approach

Reuse the `/admin/new/page.tsx` form nearly verbatim on `/admin/edit/[slug]`. Pre-fill it from disk (or GitHub — doesn't matter, they're identical since Vercel rebuilds on push). Submit calls a new `updatePost` action.

Editing is inherently more complex than creating because:
- The commit replaces the existing markdown blob (need its current SHA via the Contents API, OR use tree API with just the path + new blob SHA — tree API handles replacement automatically)
- Title changes → slug changes → **rename**, which means the old file must be deleted and the new one created in the same commit (so links don't 404 between states). Warn the user before saving if the slug changed.
- Cover image changes: delete old image + upload new one in the same commit. If image is removed entirely, just delete. If unchanged, don't touch.

### Files

- `src/app/admin/edit/[slug]/page.tsx` — **new**:
  - Server component that reads the post via `getPostBySlug`, serializes body (raw markdown, not HTML — need to read `matter.content` not `contentHtml`)
  - Extracts frontmatter fields into initial form values
  - Passes initial values to a client form
  - If slug doesn't exist → `notFound()`

- `src/lib/posts.ts` — modify:
  - Add `getPostRawBySlug(slug)` that returns `{ ...frontmatter, body: matterResult.content, slug }` — the raw markdown source, not the processed HTML. Keep existing `getPostBySlug` unchanged for the read path.

- `src/components/admin/PostForm.tsx` — **new** (extracted from `/admin/new/page.tsx`):
  - Shared form component with a `mode: "create" | "edit"` prop
  - In edit mode: prefilled initial values, submit calls `updatePost`, image field shows current cover with an "Replace" / "Remove" toggle
  - In create mode: same behavior as today, submit calls `createPost`
  - `/admin/new/page.tsx` reduces to `<PostForm mode="create" />`

- `src/app/admin/edit/[slug]/actions.ts` — **new**:
  - `export async function updatePost(formData: FormData): Promise<PostResult>`
  - Accepts all the `createPost` fields plus `originalSlug`
  - Password check
  - Reads existing markdown via `getPostRawBySlug` to know the current image path (for deletion)
  - If new slug === original slug and no image change: single blob replacement
  - If slug changed: tree with a delete entry for old markdown + create entry for new markdown
  - If image changed: tree with delete entry for old image (if existed) + blob for new image
  - Single atomic commit `post (edit): ${title}`

### Gotchas

1. **Slug collision on rename.** If the user renames a post such that the new slug matches an existing different post → reject with a clear error. Check via `getContent` on the target path before committing.
2. **Image extension change.** If the cover was `.png` and the new one is `.jpg`, both paths differ — delete old + create new. Don't try to "overwrite" at the old path.
3. **Editor vs disk drift.** If the user edits on `/admin/edit/X` while someone else (or you in another tab) commits to `X`, the update will still succeed (tree API doesn't check blob SHAs by default) but silently clobbers. Acceptable for single-user flow; document it, don't engineer around it.
4. **Frontmatter parsing round-trip.** `gray-matter` preserves body content faithfully but you lose comments and non-standard YAML. Your frontmatter is simple (title/date/summary/tags/image) so this is fine.

### Done when

- `/admin/edit/[slug]` loads with every field pre-filled and body text matching the committed markdown
- Saving with no changes is a no-op (optional — or just a trivial commit)
- Renaming the title produces exactly one commit that deletes the old file and creates the new one
- Changing the cover image replaces it in the same commit
- `/admin` list updates after save

---

## Cross-cutting concerns

### Shared password handling

After Phase B, every admin action needs the password. The cleanest pattern:

- `AdminPasswordProvider` React context in `src/app/admin/layout.tsx` (converted to include a client island)
- Reads from `sessionStorage` on mount, writes on change
- Exposes `password` and `setPassword`
- Every admin form component reads from context rather than rendering its own password input

Keeps it to one typing instead of three.

### Rate limit on the GitHub API

Classic and fine-grained PATs both have 5000 req/hr. Each commit is ~5 API calls (getRef, getCommit, createBlob, createTree, createCommit, updateRef). You'd have to be hammering edit-save to hit this. Don't pre-optimize.

### Error surface

Reuse the existing `ResultPanel` pattern (green success / red failure) across all three actions. Keep the server action return shape uniform: `{ ok: true, commitUrl, commitSha, slug? } | { ok: false, error: string }`.

---

## Out of scope for this plan

- **Draft mode.** `draft: true` in frontmatter excluded from `getAllPosts()`. Separate feature — useful if you want to iterate without triggering Vercel builds. Mention it if editing becomes painful.
- **Markdown toolbar / WYSIWYG.** Keep the textarea. Preview tab is the escape valve.
- **Image cropping at upload time.** Cover images are rendered with `object-contain` now, so a weird aspect ratio just letterboxes. If you want real cropping, it's a separate project (react-easy-crop + canvas).
- **Multi-user auth.** Password gate is for one admin (you). If that changes, swap to NextAuth + a real provider.
- **Revisions / undo.** Git IS the revision history. `git revert <sha>` is the undo.

---

## Execution notes for future Claude

- Start with Phase A. It's self-contained and the safest thing to verify first because nothing in production changes.
- Don't extract `PostForm.tsx` until Phase C — `/admin/new` doesn't benefit from the abstraction until there's a second caller.
- Don't introduce a database, a CMS, or a content collections library. The markdown-in-repo + GitHub API model is the whole point; it's why Vercel rebuilds happen automatically and why git history is the audit log.
- Every new server action: verify password with `passwordMatches`, then do one atomic tree commit. No multi-commit sequences — they fail halfway and leave the repo in a broken state.
- Revalidate the paths you changed (`revalidatePath('/posts')`, `revalidatePath('/')`) after each mutation so the static HTML catches up before the Vercel rebuild finishes.
