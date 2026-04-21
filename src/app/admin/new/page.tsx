"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Eyebrow } from "@/components/ui/eyebrow";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import { cn } from "@/lib/utils";
import { createPost, type PostResult } from "./actions";

const TODAY = new Date().toISOString().slice(0, 10);

const BODY_PLACEHOLDER = `## What got done today

- item
- item

## Plan for tomorrow

...`;

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);
}

export default function NewPostPage() {
  const passwordRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<PostResult | null>(null);

  const [mode, setMode] = useState<"write" | "preview">("write");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(TODAY);
  const [tagsRaw, setTagsRaw] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const imageUrl = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : null),
    [imageFile],
  );

  // Revoke the blob URL when it changes or on unmount
  useEffect(() => {
    if (!imageUrl) return;
    return () => URL.revokeObjectURL(imageUrl);
  }, [imageUrl]);

  const resetForm = () => {
    setTitle("");
    setDate(TODAY);
    setTagsRaw("");
    setSummary("");
    setBody("");
    setImageFile(null);
    if (passwordRef.current) passwordRef.current.value = "";
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

    setResult(null);
    startTransition(async () => {
      const res = await createPost(fd);
      setResult(res);
      if (res.ok) {
        resetForm();
        setMode("write");
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
          New <span className="gradient-text">Log</span>
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Submitting commits a new markdown file to{" "}
          <code className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-[11px] text-cyan-400">
            content/posts/
          </code>
          . Vercel redeploys automatically on push (usually ~60s).
        </p>
      </header>

      {/* Mode toggle */}
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
              ? "bg-cyan-400/10 text-cyan-400"
              : "text-zinc-500 hover:text-zinc-300",
          )}
        >
          Write
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "preview"}
          onClick={() => setMode("preview")}
          className={cn(
            "rounded-md px-3.5 py-1.5 transition-colors",
            mode === "preview"
              ? "bg-cyan-400/10 text-cyan-400"
              : "text-zinc-500 hover:text-zinc-300",
          )}
        >
          Preview
        </button>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        {/* Password stays visible in both modes so user can submit from either */}
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

        {mode === "write" ? (
          <>
            {/* Title */}
            <div>
              <Label htmlFor="title" hint="→ slug">
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

            {/* Date + Tags */}
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

            {/* Summary */}
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

            {/* Image */}
            <div>
              <Label htmlFor="image" hint="png / jpg / webp / gif · max 5 MB">
                Cover image
              </Label>
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
              {imageFile && (
                <p className="mt-1.5 font-mono text-[10px] text-zinc-600">
                  {imageFile.name} ·{" "}
                  {(imageFile.size / 1024).toFixed(1)} KB
                </p>
              )}
            </div>

            {/* Body */}
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
        ) : (
          <MarkdownPreview
            title={title}
            date={date}
            summary={summary}
            tags={tags}
            body={body}
            imageUrl={imageUrl}
          />
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button type="submit" disabled={isPending} size="lg">
            {isPending ? "Publishing…" : "Publish Log"}
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
          <p className="font-mono text-[11px] text-zinc-600">
            Commits to{" "}
            <span className="text-zinc-400">
              {process.env.NEXT_PUBLIC_GITHUB_REPO ?? "your repo"}
            </span>{" "}
            and triggers rebuild.
          </p>
        </div>
      </form>

      {result && <ResultPanel result={result} />}
    </Container>
  );
}

function ResultPanel({ result }: { result: PostResult }) {
  if (result.ok) {
    return (
      <div className="mt-8 rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-5">
        <Eyebrow tone="emerald" className="mb-3">
          ▸ Committed
        </Eyebrow>
        <p className="mb-2 text-sm text-zinc-300">
          Post created at{" "}
          <code className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-[11px] text-emerald-400">
            /posts/{result.slug}
          </code>
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
      <Eyebrow tone="cyan" className="mb-2 !text-red-400">
        ▸ Failed
      </Eyebrow>
      <p className="text-sm text-red-300">{result.error}</p>
    </div>
  );
}
