"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { PostMeta } from "@/lib/posts";

type Props = {
  post: PostMeta;
  isPending: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteConfirm({
  post,
  isPending,
  error,
  onConfirm,
  onCancel,
}: Props) {
  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPending, onCancel]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={isPending ? undefined : onCancel}
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md rounded-xl border border-red-500/30 bg-zinc-950 p-6 shadow-2xl">
        <h3
          id="delete-title"
          className="mb-2 text-lg font-semibold text-zinc-100"
        >
          Delete this log?
        </h3>
        <p className="mb-4 text-sm leading-relaxed text-zinc-400">
          Commits a deletion of{" "}
          <code className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-xs text-red-300">
            content/posts/{post.slug}.md
          </code>{" "}
          and any cover image. Git keeps the history, but the live site will
          lose it after the rebuild.
        </p>

        {error && (
          <p className="mb-4 rounded-md border border-red-500/30 bg-red-500/5 p-3 font-mono text-xs text-red-300">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onConfirm}
            disabled={isPending}
            className="border-red-500/40 text-red-300 hover:bg-red-500/10 hover:text-red-200"
          >
            {isPending ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
