import Link from "next/link";
import Image from "next/image";
import { getAllPosts } from "@/lib/posts";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/Reveal";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function PostsPage() {
  const posts = getAllPosts();
  const total = posts.length;
  const allTags = Array.from(
    new Set(posts.flatMap((p) => p.tags ?? [])),
  ).slice(0, 12);

  return (
    <section className="pt-20 pb-24 md:pt-28">
      <Container size="default">
        {/* ── Header ─────────────────────────────────────────── */}
        <header className="mb-14 border-b border-zinc-800/80 pb-10">
          <Eyebrow className="mb-4">
            <span>▸</span> Archive
          </Eyebrow>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-100 md:text-6xl">
            All <span className="gradient-text">Logs</span>
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] uppercase tracking-[0.15em] text-zinc-500">
            <span>
              <span className="text-yellow-400">{total}</span>{" "}
              {total === 1 ? "entry" : "entries"}
            </span>
            <span className="text-zinc-700">/</span>
            <span>newest first</span>
            {allTags.length > 0 && (
              <>
                <span className="text-zinc-700">/</span>
                <span>{allTags.length} tags</span>
              </>
            )}
          </div>

          {allTags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-1.5">
              {allTags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </header>

        {/* ── Posts ──────────────────────────────────────────── */}
        {total === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 py-20 text-center font-mono text-sm text-zinc-600">
            {"// archive empty"}
          </div>
        ) : (
          <ol className="flex flex-col">
            {posts.map((post, i) => (
              <Reveal key={post.slug} as="li" delay={Math.min(i * 60, 360)}>
                <Link
                  href={`/posts/${post.slug}`}
                  className="group relative flex flex-col gap-5 border-b border-zinc-800/70 py-8 transition-colors duration-150 hover:border-yellow-400/30 md:flex-row md:items-start md:gap-8 md:py-10"
                >
                  {/* Index number */}
                  <div className="hidden w-10 shrink-0 pt-1 md:block">
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-700 transition-colors group-hover:text-yellow-400/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Thumbnail */}
                  <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 md:h-[124px] md:w-[200px]">
                    {post.image ? (
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        sizes="(min-width: 768px) 200px, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950 font-mono text-xs text-zinc-700">
                        no cover
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">
                      <time>{formatDate(post.date)}</time>
                      {post.tags?.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-zinc-600">
                          · {tag}
                        </span>
                      ))}
                    </div>

                    <h2 className="text-xl font-semibold leading-snug tracking-tight text-zinc-100 transition-colors group-hover:text-yellow-400 md:text-2xl">
                      {post.title}
                    </h2>

                    {post.summary && (
                      <p className="line-clamp-2 text-sm leading-relaxed text-zinc-400 md:text-[15px]">
                        {post.summary}
                      </p>
                    )}

                    <div className="mt-2 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600 transition-colors group-hover:text-yellow-400">
                      read log
                      <span
                        aria-hidden
                        className="transition-transform group-hover:translate-x-0.5"
                      >
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ol>
        )}
      </Container>
    </section>
  );
}
