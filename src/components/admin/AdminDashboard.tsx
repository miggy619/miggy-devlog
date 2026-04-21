"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DeleteConfirm } from "./DeleteConfirm";
import { deletePost, type DeleteResult } from "@/app/admin/actions";
import type { PostMeta } from "@/lib/posts";

export function AdminDashboard({ posts }: { posts: PostMeta[] }) {
  const [password, setPassword] = useState("");

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5">
        <Label htmlFor="admin-pw" hint="required for delete">
          Password
        </Label>
        <Input
          id="admin-pw"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••••"
          autoComplete="current-password"
        />
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600">
          Stored in memory only — clears on tab close.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 py-16 text-center font-mono text-sm text-zinc-600">
          {"// no posts yet"}
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {posts.map((post) => (
            <li key={post.slug}>
              <PostRow post={post} password={password} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PostRow({
  post,
  password,
}: {
  post: PostMeta;
  password: string;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<DeleteResult | null>(null);

  const onConfirm = () => {
    const fd = new FormData();
    fd.set("password", password);
    fd.set("slug", post.slug);
    startTransition(async () => {
      const res = await deletePost(fd);
      setResult(res);
      if (res.ok) {
        setConfirmOpen(false);
        router.refresh();
      }
    });
  };

  const onCancel = () => {
    setConfirmOpen(false);
    setResult(null);
  };

  if (result?.ok) {
    return (
      <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-4">
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-emerald-400">
          ▸ Deleted {post.slug} — rebuilding
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-stretch gap-3 rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 transition-colors hover:border-zinc-700 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
        {post.image ? (
          <div className="relative h-20 w-full shrink-0 overflow-hidden rounded border border-zinc-800 sm:h-16 sm:w-24">
            <Image
              src={post.image}
              alt=""
              fill
              sizes="(min-width: 640px) 96px, 100vw"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="h-20 w-full shrink-0 rounded border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 sm:h-16 sm:w-24" />
        )}

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-zinc-100 md:text-base">
            {post.title}
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">
            <time>{post.date}</time>
            <span className="text-zinc-700">·</span>
            <code className="truncate text-zinc-600">{post.slug}</code>
            {post.tags?.slice(0, 3).map((tag) => (
              <span key={tag} className="text-zinc-600">
                · {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/posts/${post.slug}`} target="_blank">
              View ↗
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            className="border-red-500/30 text-red-300 hover:bg-red-500/10 hover:text-red-200"
          >
            Delete
          </Button>
        </div>
      </div>

      {confirmOpen && (
        <DeleteConfirm
          post={post}
          isPending={isPending}
          error={result && !result.ok ? result.error : null}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      )}
    </>
  );
}
