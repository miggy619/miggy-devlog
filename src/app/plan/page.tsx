import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { getPlan } from "@/lib/plan";

// TODO: extend /admin/edit/[slug] to also handle the plan file. For now,
// content/plan.md is edited by direct commit.

export const metadata: Metadata = {
  title: "Build Plan · miggydev.log",
  description:
    "What I'm working toward over the next 3, 6, and 12 months. Updated quarterly.",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function PlanPage() {
  const { meta, sections, activeHorizon, reviewWarning } = await getPlan();

  return (
    <Container size="reader" className="pt-14 pb-24 md:pt-20">
      {reviewWarning && (
        <div
          className={
            reviewWarning === "overdue"
              ? "mb-8 inline-flex items-center gap-2 rounded-md border border-red-400/30 bg-red-400/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-red-400"
              : "mb-8 inline-flex items-center gap-2 rounded-md border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-amber-400"
          }
        >
          <span aria-hidden>▸</span>
          {reviewWarning === "overdue"
            ? "Plan overdue for review"
            : "Quarterly review due"}
        </div>
      )}

      <header className="mb-12">
        <Eyebrow className="mb-5">
          <span>▸</span> Build Plan
        </Eyebrow>

        <h1 className="mb-5 text-3xl font-bold leading-[1.08] tracking-tight text-zinc-100 md:text-5xl">
          Build <span className="gradient-text">Plan</span>
        </h1>

        {meta.bet && (
          <p className="mb-7 text-lg leading-relaxed text-zinc-400">
            {meta.bet}
          </p>
        )}

        {/* Meta row */}
        <div className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] uppercase tracking-[0.15em] text-zinc-500">
          <span>
            Last updated{" "}
            <span className="text-zinc-300">{formatDate(meta.lastUpdated)}</span>
          </span>
          <span className="text-zinc-700">·</span>
          <span>
            Next review{" "}
            <span className="text-zinc-300">{formatDate(meta.nextReview)}</span>
          </span>
          <span className="text-zinc-700">·</span>
          <span>
            Quit trigger{" "}
            <span className="normal-case tracking-normal text-zinc-300">
              {meta.quitTrigger}
            </span>
          </span>
          <span className="text-zinc-700">·</span>
          <span>
            Runway <span className="text-zinc-300">{meta.runwayTarget}</span>
          </span>
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-3 divide-x divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60 backdrop-blur-sm">
          {sections.map((s) => (
            <PlanStatCell
              key={s.slug}
              label={`${s.slug} Month`}
              done={s.done}
              total={s.total}
              active={activeHorizon === s.slug}
            />
          ))}
        </div>
      </header>

      <div className="space-y-4">
        {sections.map((s, i) => {
          const summaryCount = s.total > 0 ? `${s.done}/${s.total}` : `${s.done}/N`;
          return (
            <details
              key={s.slug}
              open={i === 0}
              className="plan-details overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60 backdrop-blur-sm"
            >
              <summary className="flex items-center justify-between gap-4 p-6 md:p-8">
                <div className="flex items-center gap-3">
                  <span aria-hidden className="chevron text-lg text-yellow-400">
                    ▸
                  </span>
                  <h2 className="text-xl font-bold tracking-tight text-zinc-100 md:text-2xl">
                    {s.title}
                  </h2>
                </div>
                <span
                  className={
                    "shrink-0 font-mono text-xs tabular-nums " +
                    (activeHorizon === s.slug ? "text-yellow-400" : "text-zinc-500")
                  }
                >
                  {summaryCount}
                </span>
              </summary>
              <div className="border-t border-zinc-800 p-6 md:p-8">
                <div
                  className="prose-content"
                  dangerouslySetInnerHTML={{ __html: s.contentHtml }}
                />
              </div>
            </details>
          );
        })}
      </div>

      <div className="mt-16 flex items-center justify-between border-t border-zinc-800 pt-8">
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
          Latest logs
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
  );
}

function PlanStatCell({
  label,
  done,
  total,
  active,
}: {
  label: string;
  done: number;
  total: number;
  active: boolean;
}) {
  const display = total > 0 ? `${done}/${total}` : `${done}/N`;
  return (
    <div className="relative px-3 py-5 text-center md:px-6 md:py-6">
      <div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-500 sm:text-[10px] sm:tracking-[0.2em]">
        {label}
      </div>
      <div
        className={
          active
            ? "font-mono text-xl font-bold tabular-nums text-yellow-400 sm:text-2xl md:text-3xl"
            : "font-mono text-xl font-bold tabular-nums text-zinc-100 sm:text-2xl md:text-3xl"
        }
      >
        {display}
      </div>
      {active && (
        <div
          aria-hidden
          className="absolute bottom-0 left-1/2 h-px w-12 -translate-x-1/2 bg-gradient-to-r from-transparent via-yellow-400 to-transparent sm:w-16"
        />
      )}
    </div>
  );
}
