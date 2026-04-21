"use client";

import { FormEvent, useRef, useState, useTransition } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Eyebrow } from "@/components/ui/eyebrow";
import { createPost, type PostResult } from "./actions";

const TODAY = new Date().toISOString().slice(0, 10);

export default function NewPostPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<PostResult | null>(null);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setResult(null);
    startTransition(async () => {
      const res = await createPost(formData);
      setResult(res);
      if (res.ok) {
        form.reset();
        // Restore today's date after reset.
        const dateInput = form.querySelector<HTMLInputElement>('input[name="date"]');
        if (dateInput) dateInput.value = TODAY;
      }
    });
  };

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

      <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-6">
        {/* Password */}
        <div>
          <Label htmlFor="password" hint="server-verified">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••••••"
          />
        </div>

        <div className="h-px bg-zinc-900" />

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
              defaultValue={TODAY}
            />
          </div>
          <div>
            <Label htmlFor="tags" hint="comma-separated">
              Tags
            </Label>
            <Input
              id="tags"
              name="tags"
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
          />
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
            placeholder={"## What got done today\n\n- item\n- item\n\n## Plan for tomorrow\n\n..."}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button type="submit" disabled={isPending} size="lg">
            {isPending ? "Publishing…" : "Publish Log"}
          </Button>
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
