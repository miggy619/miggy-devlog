import Link from "next/link";
import Image from "next/image";
import { getAllPosts } from "@/lib/posts";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SectionHeader } from "@/components/ui/section-header";
import { Reveal } from "@/components/Reveal";

const TECH = [
  "TypeScript",
  "Roblox · Luau",
  "Next.js",
  "Python",
  "AI workflows",
];

const PROJECT = {
  name: "Discord Mod Simulator",
  emoji: "🎮",
  tagline: "Wave-based survival on Roblox. Social commentary + humor.",
  platform: "ROBLOX",
  phase: "Phase 3 · Retention",
  milestones: [
    // Phase 1 — shipped Day 2
    { label: "Project + Rojo setup", done: true, phase: 1 },
    { label: "Core scripts + basic map", done: true, phase: 1 },
    { label: "Enemy spawn + Ban Hammer", done: true, phase: 1 },
    { label: "Wave system + 2nd enemy", done: true, phase: 1 },
    { label: "Currency + first upgrade", done: true, phase: 1 },
    { label: "Win condition + wave counter", done: true, phase: 1 },
    // Phase 2 — shipped Day 5
    { label: "Hit effects + feedback", done: true, phase: 2 },
    { label: "More moderation tools", done: true, phase: 2 },
    { label: "Path variation + new enemies", done: true, phase: 2 },
    { label: "Real UI pass", done: true, phase: 2 },
  ],
};

const SECONDARY_PROJECTS = [
  {
    name: "Content Engine",
    emoji: "🧪",
    tagline:
      "Cross-poster CLI — record a clip once, queue it to TikTok / Shorts / Reels / X with per-platform captions and metrics in one place.",
    platform: "PYTHON · SQLITE",
    phase: "Pivoted · Cross-poster",
    done: "Cross-poster scaffold + `clip add` E2E + 10 clips planned & audited",
    next: "Sunday batch recording → `caption draft` (Anthropic per platform)",
  },
  {
    name: "Bethesda",
    emoji: "✦",
    tagline:
      "Live multiplayer Bible study — host walks the room through scripture; players follow on their phones with quizzes, anonymous Q&A, per-player translation switching, and (soon) generated visual aids.",
    platform: "NEXT.JS · PUSHER",
    phase: "v5 · Multi-chapter + visuals",
    done: "John 1–5 authored, image rendering layer wired (kill-switched dark)",
    next: "Live session + first sample image generation",
  },
];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function daysSince(dateStr: string): number {
  // Calendar-day diff that's timezone-safe: Day 1 = the start date itself.
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return 1;
  const start = new Date(y, m - 1, d);
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - start.getTime()) / 86_400_000);
  return Math.max(1, diff + 1);
}

export default function HomePage() {
  const posts = getAllPosts();
  const firstPost = posts[posts.length - 1];
  const daysBuilding = firstPost ? daysSince(firstPost.date) : 1;
  const completed = PROJECT.milestones.filter((m) => m.done).length;
  const total = PROJECT.milestones.length;
  const progressPct = Math.round((completed / total) * 100);

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="pt-20 pb-20 md:pt-28 md:pb-24">
        <Container size="wide">
          <div className="grid items-center gap-12 md:grid-cols-[1.3fr_1fr] md:gap-16">
            {/* Left column */}
            <div className="animate-fade-up order-2 md:order-1">
              <Eyebrow pulse tone="yellow" className="mb-6">
                Status: Building
              </Eyebrow>

              <h1 className="mb-5 text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
                Hey, I&apos;m <span className="gradient-text">MiggyDev</span>
              </h1>

              <p className="mb-3 max-w-lg text-lg leading-relaxed text-zinc-400 md:text-xl">
                Software engineer building games, tools &amp; experiments.
              </p>

              <p className="mb-8 font-mono text-sm text-zinc-500">
                Build fast
                <span className="mx-2 text-yellow-400/60">·</span>
                Ship often
                <span className="mx-2 text-yellow-400/60">·</span>
                Learn in public
              </p>

              <div className="mb-10 flex flex-wrap gap-2">
                {TECH.map((t) => (
                  <Badge key={t} className="rounded-md px-2.5 py-1 text-[11px] normal-case tracking-normal font-sans">
                    {t}
                  </Badge>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/posts">
                    View Latest Log
                    <span aria-hidden>→</span>
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <a
                    href="https://github.com/MiggyDev619/miggy-devlog"
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub <span className="text-zinc-500" aria-hidden>↗</span>
                  </a>
                </Button>
              </div>
            </div>

            {/* Right column — avatar */}
            <div className="animate-fade-up order-1 flex flex-col items-center md:order-2 md:items-end">
              <div className="relative">
                {/* Outer glow */}
                <div
                  aria-hidden
                  className="animate-float absolute inset-0 scale-110 rounded-full bg-gradient-to-br from-yellow-400/40 via-yellow-300/30 to-yellow-400/20 blur-3xl"
                />
                {/* Ring wrapper */}
                <div className="relative h-44 w-44 rounded-full ring-2 ring-yellow-400/50 ring-offset-[6px] ring-offset-zinc-950 md:h-52 md:w-52">
                  <div className="relative h-full w-full overflow-hidden rounded-full">
                    <Image
                      src="/images/avatar.gif"
                      alt="MiggyDev"
                      fill
                      unoptimized
                      priority
                      sizes="(min-width: 768px) 208px, 176px"
                      className="object-cover"
                    />
                  </div>
                  {/* Live dot */}
                  <span
                    aria-hidden
                    className="absolute bottom-2 right-2 flex h-5 w-5 items-center justify-center rounded-full border-4 border-zinc-950 bg-emerald-400"
                  >
                    <span className="absolute h-2 w-2 animate-ping rounded-full bg-emerald-300 opacity-75" />
                  </span>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 font-mono text-xs">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  online
                </span>
                <span className="text-zinc-700">/</span>
                <span className="text-zinc-500">day {daysBuilding}</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ═══ STATS STRIP ═══ */}
      <section className="pb-20">
        <Container size="wide">
          <Reveal>
            <div className="grid grid-cols-3 divide-x divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60 backdrop-blur-sm">
              <StatCell label="Logs" value={posts.length} />
              <StatCell label="Projects" value="3" accent />
              <StatCell label="Day" value={daysBuilding} />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ═══ NOW BUILDING ═══ */}
      <section className="pb-20">
        <Container size="wide">
          <Reveal className="gradient-border-wrap">
            <div className="relative overflow-hidden rounded-[calc(1rem-1px)] bg-zinc-950/90 p-6 md:p-10 corner-brackets">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-20 -top-20 h-[500px] w-[500px] rounded-full bg-yellow-400/[0.05] blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -left-10 -bottom-20 h-[400px] w-[400px] rounded-full bg-yellow-300/[0.04] blur-3xl"
              />

              <div className="relative grid gap-10 md:grid-cols-[1fr_1.1fr]">
                {/* Left: project info */}
                <div>
                  <Eyebrow pulse tone="yellow" className="mb-5">
                    Now Building · {PROJECT.phase}
                  </Eyebrow>

                  <div className="mb-3 flex items-center gap-3">
                    <span className="text-4xl">{PROJECT.emoji}</span>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-100 md:text-3xl">
                      {PROJECT.name}
                    </h2>
                  </div>

                  <p className="mb-8 max-w-md text-sm leading-relaxed text-zinc-400 md:text-base">
                    {PROJECT.tagline}
                  </p>

                  <div className="mb-6">
                    <div className="mb-2 flex items-center justify-between font-mono text-xs">
                      <span className="uppercase tracking-[0.2em] text-zinc-500">
                        Progress
                      </span>
                      <span className="text-yellow-400 tabular-nums">
                        {completed}/{total}{" "}
                        <span className="text-zinc-700">· {progressPct}%</span>
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full border border-zinc-800 bg-zinc-900">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 shadow-[0_0_12px_rgba(250,204,21,0.6)] transition-[width] duration-700 ease-out"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="outline">{PROJECT.platform}</Badge>
                    <Link
                      href="/posts"
                      className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.15em] text-yellow-400 transition-colors hover:text-yellow-300"
                    >
                      Read dev log
                      <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
                    </Link>
                  </div>
                </div>

                {/* Right: milestones */}
                <div>
                  <div className="mb-5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                    <span>Milestones</span>
                    <span className="text-emerald-400">Phase 2 ✓ shipped</span>
                  </div>
                  <ul className="space-y-2.5">
                    {PROJECT.milestones.map((m, i) => {
                      const prev = PROJECT.milestones[i - 1];
                      const isPhaseBreak = prev && prev.phase !== m.phase;
                      return (
                        <li
                          key={m.label}
                          className={
                            "flex items-center gap-3 font-mono text-sm" +
                            (isPhaseBreak ? " mt-4 border-t border-zinc-800/70 pt-4" : "")
                          }
                        >
                          <span
                            className={
                              m.done
                                ? "flex h-5 w-5 shrink-0 items-center justify-center rounded border border-yellow-400/50 bg-yellow-400/15 text-[11px] font-bold text-yellow-400"
                                : "flex h-5 w-5 shrink-0 items-center justify-center rounded border border-zinc-800 bg-zinc-900 text-zinc-700"
                            }
                            aria-hidden
                          >
                            {m.done ? "✓" : ""}
                          </span>
                          <span className={m.done ? "text-zinc-200" : "text-zinc-500"}>
                            {m.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ═══ ALSO BUILDING ═══ */}
      <section className="pb-20">
        <Container size="wide">
          <div className="space-y-4">
            {SECONDARY_PROJECTS.map((p) => (
              <Reveal key={p.name}>
                <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60 p-6 backdrop-blur-sm md:p-8">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-10 -top-10 h-[300px] w-[300px] rounded-full bg-emerald-400/[0.04] blur-3xl"
                  />
                  <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-10">
                    <div className="flex-1">
                      <Eyebrow tone="emerald" className="mb-4">
                        Also Building · {p.phase}
                      </Eyebrow>
                      <div className="mb-2 flex items-center gap-3">
                        <span className="text-3xl">{p.emoji}</span>
                        <h2 className="text-xl font-bold tracking-tight text-zinc-100 md:text-2xl">
                          {p.name}
                        </h2>
                      </div>
                      <p className="mb-5 max-w-xl text-sm leading-relaxed text-zinc-400 md:text-base">
                        {p.tagline}
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="outline">{p.platform}</Badge>
                        <Link
                          href="/posts"
                          className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.15em] text-emerald-400 transition-colors hover:text-emerald-300"
                        >
                          Read dev log
                          <span aria-hidden>→</span>
                        </Link>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 font-mono text-xs md:min-w-[280px] md:max-w-sm md:border-l md:border-zinc-800 md:pl-8">
                      <div>
                        <div className="mb-1.5 uppercase tracking-[0.2em] text-zinc-500">
                          Shipped
                        </div>
                        <div className="flex gap-2 text-zinc-300">
                          <span className="text-emerald-400" aria-hidden>✓</span>
                          <span>{p.done}</span>
                        </div>
                      </div>
                      <div>
                        <div className="mb-1.5 uppercase tracking-[0.2em] text-zinc-500">
                          Next
                        </div>
                        <div className="flex gap-2 text-zinc-300">
                          <span className="text-yellow-400" aria-hidden>→</span>
                          <span>{p.next}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ═══ LATEST LOGS ═══ */}
      <section className="pb-24">
        <Container size="wide">
          <SectionHeader
            eyebrow="Latest Logs"
            action={{ label: "view all", href: "/posts" }}
          />

          {posts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 py-16 text-center font-mono text-sm text-zinc-600">
              {"// archive empty"}
            </div>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {posts.slice(0, 4).map((post, i) => (
                <Reveal key={post.slug} as="li" delay={i * 80}>
                  <Link
                    href={`/posts/${post.slug}`}
                    className="group relative block h-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-yellow-400/30 hover:bg-zinc-900/60 card-glow"
                  >
                    {post.image && (
                      <div className="relative aspect-[16/7] w-full overflow-hidden border-b border-zinc-800">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          sizes="(min-width: 768px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
                      </div>
                    )}

                    <div className="flex flex-col gap-3 p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <time className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">
                          {formatDate(post.date)}
                        </time>
                        {post.tags?.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="default">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <h3 className="text-lg font-semibold leading-snug tracking-tight text-zinc-100 transition-colors group-hover:text-yellow-400">
                        {post.title}
                      </h3>
                      {post.summary && (
                        <p className="line-clamp-2 text-sm leading-relaxed text-zinc-500">
                          {post.summary}
                        </p>
                      )}
                      <div className="mt-1 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-yellow-400 opacity-0 transition-opacity group-hover:opacity-100">
                        Read <span aria-hidden>→</span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </ul>
          )}
        </Container>
      </section>
    </>
  );
}

function StatCell({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="relative px-2 py-5 text-center sm:px-4 md:px-6 md:py-7">
      <div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-500 sm:text-[10px] sm:tracking-[0.2em]">
        {label}
      </div>
      <div
        className={
          accent
            ? "font-mono text-xl font-bold tabular-nums text-yellow-400 sm:text-2xl md:text-3xl"
            : "font-mono text-xl font-bold tabular-nums text-zinc-100 sm:text-2xl md:text-3xl"
        }
      >
        {value}
      </div>
      {accent && (
        <div
          aria-hidden
          className="absolute bottom-0 left-1/2 h-px w-12 -translate-x-1/2 bg-gradient-to-r from-transparent via-yellow-400 to-transparent sm:w-16"
        />
      )}
    </div>
  );
}
