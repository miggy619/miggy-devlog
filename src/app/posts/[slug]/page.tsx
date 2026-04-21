import Link from "next/link";
import Image from "next/image";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { ScrollProgress } from "@/components/ScrollProgress";
import { calculateReadingTime } from "@/lib/reading-time";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({
    slug: post.slug,
  }));
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const readingMinutes = calculateReadingTime(post.contentHtml);

  return (
    <>
      <ScrollProgress />

      <div className="mx-auto max-w-2xl px-4 md:px-6 pt-10 pb-24">

        {/* Back */}
        <Link
          href="/posts"
          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500 hover:text-cyan-400 transition-colors duration-150 mb-12"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          All Logs
        </Link>

        <article>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 font-mono text-[10px] rounded bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 uppercase tracking-[0.15em]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold text-zinc-100 leading-[1.1] mb-5 tracking-tight">
            {post.title}
          </h1>

          {/* Summary */}
          {post.summary && (
            <p className="text-lg text-zinc-400 leading-relaxed mb-7">
              {post.summary}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.15em] text-zinc-600 mb-10">
            <time>{formatDate(post.date)}</time>
            <span className="text-zinc-800">/</span>
            <span>{readingMinutes} min read</span>
            <span className="text-zinc-800">/</span>
            <span>miggy</span>
          </div>

          {/* Cover image */}
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

          {/* Divider */}
          <div className="border-t border-zinc-800 mb-10" />

          {/* Content */}
          <div
            className="prose-content"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />

          {/* Footer nav */}
          <div className="mt-20 pt-8 border-t border-zinc-800 flex items-center justify-between">
            <Link
              href="/posts"
              className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500 hover:text-cyan-400 transition-colors duration-150"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              Back to logs
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500 hover:text-cyan-400 transition-colors duration-150"
            >
              Home
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

        </article>
      </div>
    </>
  );
}
