import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { ScrollProgress } from "@/components/ScrollProgress";
import { calculateReadingTime } from "@/lib/reading-time";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPostBySlug(slug);
    return {
      title: `${post.title} · miggydev.log`,
      description: post.summary,
      openGraph: {
        title: post.title,
        description: post.summary,
        type: "article",
        publishedTime: post.date,
        images: post.image ? [{ url: post.image }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.summary,
        images: post.image ? [post.image] : undefined,
      },
    };
  } catch {
    return { title: "Not found · miggydev.log" };
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function relativeTime(d: string): string {
  const diffDays = Math.floor(
    (Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays < 1) return "today";
  if (diffDays < 2) return "yesterday";
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} mo ago`;
  return `${Math.floor(diffDays / 365)} yr ago`;
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;

  const allPosts = getAllPosts();
  const current = allPosts.findIndex((p) => p.slug === slug);
  if (current === -1) notFound();

  const post = await getPostBySlug(slug);
  const readingMinutes = calculateReadingTime(post.contentHtml);
  const newer = current > 0 ? allPosts[current - 1] : null;
  const older =
    current < allPosts.length - 1 ? allPosts[current + 1] : null;

  return (
    <>
      <ScrollProgress />

      <Container size="reader" as="article" className="pt-14 pb-24 md:pt-20">
        {/* ── Back ─────────────────────────────────────────────── */}
        <Link
          href="/posts"
          className="group mb-12 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:text-yellow-400"
        >
          <span
            aria-hidden
            className="transition-transform group-hover:-translate-x-0.5"
          >
            ←
          </span>
          All Logs
        </Link>

        {/* ── Header ───────────────────────────────────────────── */}
        <header className="mb-10">
          <Eyebrow className="mb-5">
            <span>▸</span> Devlog Entry
          </Eyebrow>

          <h1 className="mb-5 text-3xl font-bold leading-[1.08] tracking-tight text-zinc-100 md:text-5xl">
            {post.title}
          </h1>

          {post.summary && (
            <p className="mb-7 text-lg leading-relaxed text-zinc-400">
              {post.summary}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] uppercase tracking-[0.15em] text-zinc-500">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span className="text-zinc-700">·</span>
            <span className="text-zinc-600">{relativeTime(post.date)}</span>
            <span className="text-zinc-700">·</span>
            <span>{readingMinutes} min read</span>
            <span className="text-zinc-700">·</span>
            <span className="text-zinc-600">miggydev</span>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="accent">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </header>

        {/* ── Cover ────────────────────────────────────────────── */}
        {post.image && (
          <div className="relative mb-12 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
            <Image
              src={post.image}
              alt={post.title}
              fill
              sizes="(min-width: 768px) 672px, 100vw"
              className="object-contain"
              priority
            />
          </div>
        )}

        <div className="mb-10 border-t border-zinc-800/80" />

        {/* ── Content ──────────────────────────────────────────── */}
        <div
          className="prose-content"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        {/* ── Prev / Next nav ──────────────────────────────────── */}
        {(newer || older) && (
          <nav
            aria-label="Post navigation"
            className="mt-20 grid gap-3 border-t border-zinc-800 pt-8 sm:grid-cols-2"
          >
            {newer ? (
              <PostNavCard post={newer} direction="newer" />
            ) : (
              <div className="hidden sm:block" />
            )}
            {older ? (
              <PostNavCard post={older} direction="older" />
            ) : (
              <div className="hidden sm:block" />
            )}
          </nav>
        )}

        {/* ── Footer actions ───────────────────────────────────── */}
        <div className="mt-10 flex items-center justify-between border-t border-zinc-800 pt-8">
          <Link
            href="/posts"
            className="group inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:text-yellow-400"
          >
            <span
              aria-hidden
              className="transition-transform group-hover:-translate-x-0.5"
            >
              ←
            </span>
            Back to logs
          </Link>
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:text-yellow-400"
          >
            Home
            <span
              aria-hidden
              className="transition-transform group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        </div>
      </Container>
    </>
  );
}

function PostNavCard({
  post,
  direction,
}: {
  post: { slug: string; title: string };
  direction: "newer" | "older";
}) {
  const isNewer = direction === "newer";
  return (
    <Link
      href={`/posts/${post.slug}`}
      className={`group flex flex-col gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-yellow-400/30 hover:bg-zinc-900/60 ${
        isNewer ? "" : "sm:text-right"
      }`}
    >
      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600 transition-colors group-hover:text-yellow-400">
        {isNewer && (
          <span
            aria-hidden
            className="transition-transform group-hover:-translate-x-0.5"
          >
            ←
          </span>
        )}
        {isNewer ? "Newer" : "Older"}
        {!isNewer && (
          <span
            aria-hidden
            className="transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        )}
      </span>
      <span className="line-clamp-2 text-sm font-medium leading-snug text-zinc-200 transition-colors group-hover:text-yellow-400">
        {post.title}
      </span>
    </Link>
  );
}
