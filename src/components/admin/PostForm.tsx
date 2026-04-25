"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Eyebrow } from "@/components/ui/eyebrow";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import { cn } from "@/lib/utils";
import { parseFrontmatter } from "@/lib/frontmatter";
import { createPost, type PostResult } from "@/app/admin/new/actions";
import { updatePost, type UpdateResult } from "@/app/admin/actions";

const TODAY = new Date().toISOString().slice(0, 10);

const BODY_PLACEHOLDER = `## What got done today

- item
- item

## Plan for tomorrow

...`;

const RAW_PLACEHOLDER = `---
title: "Day 3 – Discord Mod Simulator"
date: "2026-04-21"
summary: "Added a second enemy type, built the wave system..."
tags: ["roblox", "luau", "devlog"]
image: "/images/posts/day-3.png"
---

Day 3 wasn't a big flashy change, but it was the tipping point...

## What got done today

- item
- item`;

type ParseFeedback =
  | { kind: "ok"; imagePath?: string; missing: string[] }
  | { kind: "err"; message: string };

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);
}

export type InitialValues = {
  title: string;
  date: string;
  summary: string;
  tagsRaw: string;
  body: string;
  imageWebPath: string | null;
};

type Props =
  | { mode: "create" }
  | { mode: "edit"; originalSlug: string; initial: InitialValues };

type ActionResult = PostResult | UpdateResult;

const EMPTY_INITIAL: InitialValues = {
  title: "",
  date: TODAY,
  summary: "",
  tagsRaw: "",
  body: "",
  imageWebPath: null,
};

export function PostForm(props: Props) {
  const isEdit = props.mode === "edit";
  const initial = isEdit ? props.initial : EMPTY_INITIAL;

  const passwordRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);

  const [mode, setMode] = useState<"write" | "raw" | "preview">("write");
  const [title, setTitle] = useState(initial.title);
  const [date, setDate] = useState(initial.date);
  const [tagsRaw, setTagsRaw] = useState(initial.tagsRaw);
  const [summary, setSummary] = useState(initial.summary);
  const [body, setBody] = useState(initial.body);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [rawMd, setRawMd] = useState("");
  const [parseFeedback, setParseFeedback] = useState<ParseFeedback | null>(null);

  const newImageUrl = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : null),
    [imageFile],
  );

  useEffect(() => {
    if (!newImageUrl) return;
    return () => URL.revokeObjectURL(newImageUrl);
  }, [newImageUrl]);

  const effectiveImageUrl = newImageUrl
    ? newImageUrl
    : removeImage
      ? null
      : initial.imageWebPath;

  const resetForm = () => {
    setTitle("");
    setDate(TODAY);
    setTagsRaw("");
    setSummary("");
    setBody("");
    setImageFile(null);
    setRemoveImage(false);
    setRawMd("");
    setParseFeedback(null);
    if (passwordRef.current) passwordRef.current.value = "";
  };

  const handleParseRaw = (switchTo: "write" | "preview") => {
    if (!rawMd.trim()) {
      setParseFeedback({ kind: "err", message: "Paste some markdown first." });
      return;
    }

    const { data, content } = parseFrontmatter(rawMd);

    if (!data.title && !data.summary && !content.trim()) {
      setParseFeedback({
        kind: "err",
        message:
          "Couldn't parse frontmatter. Expected a --- block with title / date / summary / tags, then the body.",
      });
      return;
    }

    if (data.title !== undefined) setTitle(data.title);
    if (data.date !== undefined) setDate(data.date);
    if (data.summary !== undefined) setSummary(data.summary);
    if (data.tags !== undefined) setTagsRaw(data.tags.join(", "));
    if (content) setBody(content.trimEnd());

    const missing: string[] = [];
    if (!data.title) missing.push("title");
    if (!data.date) missing.push("date");
    if (!data.summary) missing.push("summary");
    if (!content.trim()) missing.push("body");

    setParseFeedback({
      kind: "ok",
      imagePath: data.image,
      missing,
    });
    setMode(switchTo);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const password = passwordRef.current?.value ?? "";

    const fd = new FormData();
    fd.set("password", password);
    fd.set("title", title);
    fd.set("date", date);
    fd.set("tags", tagsRaw);
    fd.set("summary", summary);
    fd.set("body", body);
    if (imageFile) fd.set("image", imageFile);

    if (isEdit) {
      fd.set("originalSlug", props.originalSlug);
      if (removeImage && !imageFile) fd.set("removeImage", "1");
    }

    setResult(null);
    startTransition(async () => {
      const res = isEdit ? await updatePost(fd) : await createPost(fd);
      setResult(res);
      if (res.ok && !isEdit) {
        resetForm();
        setMode("write");
      }
      if (res.ok && isEdit) {
        setImageFile(null);
        setRemoveImage(false);
      }
    });
  };

  const tags = parseTags(tagsRaw);

  return (
    <Container size="reader" className="py-14">
      <header className="mb-10">
        <Eyebrow className="mb-3">
          <span>▸</span> Admin
        </Eyebrow>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100 md:text-4xl">
          {isEdit ? (
            <>
              Edit <span className="gradient-text">Log</span>
            </>
          ) : (
            <>
              New <span className="gradient-text">Log</span>
            </>
          )}
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          {isEdit
            ? "Saving commits an update to the post's markdown file. Vercel redeploys automatically on push (usually ~60s)."
            : "Submitting commits a new markdown file to "}
          {!isEdit && (
            <>
              <code className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-[11px] text-yellow-400">
                content/posts/
              </code>
              . Vercel redeploys automatically on push (usually ~60s).
            </>
          )}
        </p>
      </header>

      <div
        role="tablist"
        aria-label="Editor mode"
        className="mb-6 inline-flex rounded-lg border border-zinc-800 bg-zinc-950/60 p-1 font-mono text-[11px] uppercase tracking-[0.15em]"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "write"}
          onClick={() => setMode("write")}
          className={cn(
            "rounded-md px-3.5 py-1.5 transition-colors",
            mode === "write"
              ? "bg-yellow-400/10 text-yellow-400"
              : "text-zinc-500 hover:text-zinc-300",
          )}
        >
          Write
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "raw"}
          onClick={() => setMode("raw")}
          className={cn(
            "rounded-md px-3.5 py-1.5 transition-colors",
            mode === "raw"
              ? "bg-yellow-400/10 text-yellow-400"
              : "text-zinc-500 hover:text-zinc-300",
          )}
        >
          Raw MD
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "preview"}
          onClick={() => setMode("preview")}
          className={cn(
            "rounded-md px-3.5 py-1.5 transition-colors",
            mode === "preview"
              ? "bg-yellow-400/10 text-yellow-400"
              : "text-zinc-500 hover:text-zinc-300",
          )}
        >
          Preview
        </button>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <div>
          <Label htmlFor="password" hint="server-verified">
            Password
          </Label>
          <Input
            ref={passwordRef}
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••••••"
          />
        </div>

        <div className="h-px bg-zinc-900" />

        {mode === "raw" && (
          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="rawMd" hint="paste full .md including --- frontmatter">
                Raw Markdown
              </Label>
              <Textarea
                id="rawMd"
                name="rawMd"
                rows={20}
                value={rawMd}
                onChange={(e) => {
                  setRawMd(e.target.value);
                  setParseFeedback(null);
                }}
                placeholder={RAW_PLACEHOLDER}
                className="font-mono text-[13px] leading-relaxed"
              />
              <p className="mt-1.5 font-mono text-[10px] text-zinc-600">
                Recognised frontmatter keys: title · date · summary · tags · image
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => handleParseRaw("preview")}
              >
                Parse & Preview
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleParseRaw("write")}
              >
                Parse & Edit
              </Button>
              {rawMd && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRawMd("");
                    setParseFeedback(null);
                  }}
                >
                  Clear
                </Button>
              )}
            </div>

            {parseFeedback?.kind === "err" && (
              <div className="rounded-md border border-red-500/30 bg-red-500/5 px-3 py-2 font-mono text-[11px] text-red-300">
                {parseFeedback.message}
              </div>
            )}

            {parseFeedback?.kind === "ok" && (
              <div className="rounded-md border border-emerald-400/30 bg-emerald-400/5 px-3 py-2 font-mono text-[11px] text-emerald-300">
                Loaded into form.
                {parseFeedback.missing.length > 0 && (
                  <>
                    {" "}
                    <span className="text-yellow-300">
                      Missing: {parseFeedback.missing.join(", ")}.
                    </span>
                  </>
                )}
                {parseFeedback.imagePath && (
                  <>
                    {" "}
                    <span className="text-zinc-400">
                      Cover referenced{" "}
                      <code className="rounded bg-zinc-900 px-1 py-0.5 text-yellow-400">
                        {parseFeedback.imagePath}
                      </code>
                      {" "}— upload the file below if it isn&apos;t committed yet.
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {mode === "write" && (
          <>
            <div>
              <Label htmlFor="title" hint={isEdit ? "→ slug (renames file)" : "→ slug"}>
                Title
              </Label>
              <Input
                id="title"
                name="title"
                required
                maxLength={120}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Day 2 – Enemy spawning"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="tags" hint="comma-separated">
                  Tags
                </Label>
                <Input
                  id="tags"
                  name="tags"
                  value={tagsRaw}
                  onChange={(e) => setTagsRaw(e.target.value)}
                  placeholder="roblox, luau, devlog"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="summary" hint="shown in cards">
                Summary
              </Label>
              <Input
                id="summary"
                name="summary"
                required
                maxLength={400}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="One-liner about what happened today."
              />
            </div>

            <div>
              <Label htmlFor="image" hint="png / jpg / webp / gif · max 5 MB">
                Cover image
              </Label>
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(e) => {
                  setImageFile(e.target.files?.[0] ?? null);
                  setRemoveImage(false);
                }}
              />
              {imageFile && (
                <p className="mt-1.5 font-mono text-[10px] text-zinc-600">
                  {imageFile.name} · {(imageFile.size / 1024).toFixed(1)} KB
                  {isEdit && initial.imageWebPath ? " · replaces current cover" : ""}
                </p>
              )}
              {isEdit && initial.imageWebPath && !imageFile && (
                <div className="mt-2 flex items-center gap-3 rounded-md border border-zinc-800 bg-zinc-950/60 p-2 font-mono text-[10px] text-zinc-500">
                  <span className="truncate text-zinc-400">
                    current: {initial.imageWebPath}
                  </span>
                  {removeImage ? (
                    <>
                      <span className="text-red-400">
                        ✕ will be removed on save
                      </span>
                      <button
                        type="button"
                        onClick={() => setRemoveImage(false)}
                        className="ml-auto shrink-0 rounded-md border border-zinc-800 px-2 py-0.5 uppercase tracking-[0.15em] text-zinc-400 hover:border-yellow-400/30 hover:text-yellow-400"
                      >
                        Undo
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setRemoveImage(true)}
                      className="ml-auto shrink-0 rounded-md border border-red-500/30 px-2 py-0.5 uppercase tracking-[0.15em] text-red-300 hover:bg-red-500/10"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="body" hint="markdown">
                Body
              </Label>
              <Textarea
                id="body"
                name="body"
                required
                rows={16}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={BODY_PLACEHOLDER}
              />
            </div>
          </>
        )}

        {mode === "preview" && (
          <MarkdownPreview
            title={title}
            date={date}
            summary={summary}
            tags={tags}
            body={body}
            imageUrl={effectiveImageUrl}
          />
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button type="submit" disabled={isPending} size="lg">
            {isPending
              ? isEdit
                ? "Saving…"
                : "Publishing…"
              : isEdit
                ? "Save Changes"
                : "Publish Log"}
          </Button>
          {mode === "preview" && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setMode("write")}
            >
              ← Back to editor
            </Button>
          )}
          {isEdit && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin">Cancel</Link>
            </Button>
          )}
          <p className="font-mono text-[11px] text-zinc-600">
            Commits to{" "}
            <span className="text-zinc-400">
              {process.env.NEXT_PUBLIC_GITHUB_REPO ?? "your repo"}
            </span>{" "}
            and triggers rebuild.
          </p>
        </div>
      </form>

      {result && <ResultPanel result={result} isEdit={isEdit} />}
    </Container>
  );
}

function ResultPanel({
  result,
  isEdit,
}: {
  result: ActionResult;
  isEdit: boolean;
}) {
  if (result.ok) {
    const renamed =
      isEdit &&
      "previousSlug" in result &&
      result.previousSlug !== result.slug;
    return (
      <div className="mt-8 rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-5">
        <Eyebrow tone="emerald" className="mb-3">
          ▸ Committed
        </Eyebrow>
        <p className="mb-2 text-sm text-zinc-300">
          {isEdit ? "Post updated at " : "Post created at "}
          <code className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-[11px] text-emerald-400">
            /posts/{result.slug}
          </code>
          {renamed && "previousSlug" in result ? (
            <>
              {" "}
              (renamed from{" "}
              <code className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-[11px] text-zinc-500">
                {result.previousSlug}
              </code>
              )
            </>
          ) : null}
          .
        </p>
        <p className="text-xs text-zinc-500">
          It&apos;ll be live once Vercel finishes the rebuild (usually under a minute).
        </p>
        <a
          href={result.commitUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-emerald-400 hover:text-emerald-300"
        >
          View commit on GitHub ↗
        </a>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/5 p-5">
      <Eyebrow tone="yellow" className="mb-2 !text-red-400">
        ▸ Failed
      </Eyebrow>
      <p className="text-sm text-red-300">{result.error}</p>
    </div>
  );
}
