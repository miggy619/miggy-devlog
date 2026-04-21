import Link from "next/link";
import { getAllPosts, getPostBySlug } from "@/lib/posts";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({
    slug: post.slug,
  }));
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-950 dark:to-zinc-900 px-6 py-16">
      <article className="mx-auto max-w-3xl">
        {/* Back Link */}
        <Link
          href="/posts"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium mb-8 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Posts
        </Link>

        {/* Post Header */}
        <header className="mb-12">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-500 mb-4">
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
          <h1 className="text-5xl sm:text-6xl font-bold text-zinc-950 dark:text-white mb-6 leading-tight">
            {post.title}
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {post.summary}
          </p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Content */}
        <div className="prose dark:prose-invert max-w-none">
          <div
            className="
              prose 
              dark:prose-invert
              prose-headings:text-zinc-900 dark:prose-headings:text-white
              prose-h1:text-4xl prose-h1:font-bold prose-h1:mt-8 prose-h1:mb-4
              prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4
              prose-h3:text-2xl prose-h3:font-bold prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-p:leading-relaxed
              prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-zinc-900 dark:prose-strong:text-white prose-strong:font-bold
              prose-code:text-zinc-800 dark:prose-code:text-zinc-200 prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800 prose-code:px-2 prose-code:py-1 prose-code:rounded
              prose-pre:bg-zinc-900 dark:prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800
              prose-blockquote:border-l-blue-600 dark:prose-blockquote:border-l-blue-400 prose-blockquote:pl-4 prose-blockquote:italic
              prose-ul:list-disc prose-ul:ml-6 prose-li:text-zinc-700 dark:prose-li:text-zinc-300
              prose-ol:list-decimal prose-ol:ml-6
              max-w-none
            "
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to All Posts
          </Link>
        </div>
      </article>
    </div>
  );
}
