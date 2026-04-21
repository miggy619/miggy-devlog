"use client";

import { useDeferredValue, useEffect, useState } from "react";
import Image from "next/image";
import { renderMarkdown } from "@/lib/render-markdown";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";

type Props = {
  title: string;
  date: string;
  summary: string;
  tags: string[];
  body: string;
  imageUrl: string | null;
};

function formatDate(d: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return d || "—";
  return new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function MarkdownPreview({
  title,
  date,
  summary,
  tags,
  body,
  imageUrl,
}: Props) {
  const deferredBody = useDeferredValue(body);
  const [contentHtml, setContentHtml] = useState("");

  useEffect(() => {
    let cancelled = false;
    renderMarkdown(deferredBody).then((html) => {
      if (!cancelled) setContentHtml(html);
    });
    return () => {
      cancelled = true;
    };
  }, [deferredBody]);

  const hasAnything =
    title || summary || body || imageUrl || tags.length > 0;

  if (!hasAnything) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 py-16 text-center font-mono text-sm text-zinc-600">
        {"// nothing to preview yet"}
      </div>
    );
  }

  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-6 md:p-10">
      <header className="mb-10">
        <Eyebrow className="mb-5">
          <span>▸</span> Devlog Entry
        </Eyebrow>

        <h1 className="mb-5 text-3xl font-bold leading-[1.08] tracking-tight text-zinc-100 md:text-4xl">
          {title || <span className="text-zinc-600">Untitled</span>}
        </h1>

        {summary && (
          <p className="mb-6 text-lg leading-relaxed text-zinc-400">
            {summary}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] uppercase tracking-[0.15em] text-zinc-500">
          <span>{formatDate(date)}</span>
          <span className="text-zinc-700">·</span>
          <span className="text-zinc-600">preview</span>
          <span className="text-zinc-700">·</span>
          <span className="text-zinc-600">miggy</span>
        </div>

        {tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge key={tag} variant="accent">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </header>

      {imageUrl && (
        <div className="relative mb-10 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
          <Image
            src={imageUrl}
            alt={title || "cover"}
            fill
            unoptimized
            sizes="(min-width: 768px) 672px, 100vw"
            className="object-contain"
          />
        </div>
      )}

      <div className="mb-8 border-t border-zinc-800/80" />

      {body ? (
        <div
          className="prose-content"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      ) : (
        <p className="font-mono text-sm text-zinc-600">
          {"// body is empty"}
        </p>
      )}
    </article>
  );
}
