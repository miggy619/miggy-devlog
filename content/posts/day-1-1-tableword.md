---
title: "Day 1.1 – Tableword"
date: "2026-04-28"
summary: "v4 (multi-chapter John 1–5) and v5 (visual aids) shipped on a single branch. The image rendering layer ships before any image exists — and that's the architectural point. When `getHeroImage` returns null, `<HeroImage>` returns null, the scene renders without it, and tomorrow the user runs the generation script to fill in."
tags: ["nextjs", "tableword", "devlog", "architecture", "kill-switch"]
---
Day 1.1 of the Tableword series (still going by `bethesda` at this point — the rebrand is a few days out) and tonight's ship was big — v4 (multi-chapter foundation, John 1–5 authored end to end, ~165 verses + four chapters of background cards / quizzes / spotlights / reflection prompts) and v5 (image schema, generation pipeline, rendering primitives, hide-images toggle, kill switch) on a single branch in one PR. The interesting architectural decision wasn't the new chapter authoring or the AVIF/WebP/JPG fallback chain. It was that the image-rendering layer shipped to production tonight even though no images exist yet. 🌑

## ✅ What got done today

- **Multi-chapter foundation.** `lib/content/john-5.json` moved to `lib/content/john/chapter-5.json`. Four new chapter files authored: chapter-1 (Prologue → Philip and Nathanael, 51 verses, 20 quiz, 3 spotlights × 4 lenses, 16 background cards), chapter-2 (Cana + Temple, 25v / 15q / 2 sp / 8 bg), chapter-3 (Nicodemus + Baptist's Final Witness, 36v / 16q / 2 sp / 7 bg), chapter-4 (Samaritan Woman + Officer's Son, 54v / 20q / 3 sp / 11 bg). Recap cards on every chapter.
- **Loader generalization.** Every public function in `loader.ts` takes `chapter: number` first. All five chapter JSONs are statically imported and indexed by number; per-chapter overlay cache replaces the v3 single-chapter cache. `_index.json` is the chapter-availability registry — loader, picker, future surfaces all consume from one source.
- **Per-section content keys are derived, not mapped.** v3 had `CROSSREF_ANCHORS = { bethesda: '5:8', ... }` hardcoded in `sections.ts`. v4 derives the same map at runtime by matching ref-verse against the section's range. Adding a section or anchor is a JSON edit, full stop. No more sympathy-edit between content and code.
- **Chapter picker UI** + `room:chapter-set` Pusher event. Switching mid-room clears `activeSectionIndex`, in-flight quiz round, auto-advance state. Players' Pusher presence and tradition selection persist — they stay in the room, the context just changes around them.
- **Recap scene** — new `'recap'` variant `{ cardIndex }`. Walks one card per prior chapter; last card's NEXT becomes BEGIN STUDY. Same scene-set-per-advance pattern as background cards. Hidden when `activeChapter == 1`.
- **v5 image schema** — `passages[*].heroImage?: ImageAsset` and `traditionSpotlights[*].lensImages?: Record<LensKey | 'generic', ImageAsset>` added on every chapter file (empty until generated).
- **v5 generation pipeline** — `scripts/generate-visuals.ts` reads chapter JSON, derives prompts from versioned style templates (`tissot-19c-v1`, `caravaggio-bellini-v1`, etc.), calls Pollinations.ai (default) or Hugging Face (`--service=hf`), pipes through sharp for AVIF/WebP/JPG at responsive sizes, writes to `/public/images/john/chapter-N/`, updates the chapter JSON's `src/fallback/seed/model/generatedAt` fields.
- **`<HeroImage>` and `<LensImage>` primitives** — `<picture>` chain (AVIF → WebP → JPG), lazy-loaded, render nothing when asset is null. Reader and tradition spotlight scenes call `getHeroImage` / `getLensImage` and pass results through.
- **Hide-images toggle** — `🌕 IMG ON` / `🌑 IMG OFF` pill in player header, persisted in `localStorage` at `bethesda:hideImages:CODE`. No Pusher event — pure player-side preference.
- **`VISUALS_ENABLED` kill switch** — server reads `VISUALS_ENABLED`; client mirrors via `NEXT_PUBLIC_VISUALS_ENABLED`. When false, every helper returns null; app runs as v4-end-state.

## 🧠 Biggest Takeaway — shipping the rendering layer before the assets exist

Most "we're adding images to the app" rollouts are scary. You usually have to either:

1. **Generate every image before merging** — slow, expensive, blocks the merge for days while you tone-check the output.
2. **Generate post-merge but feature-flag the rendering** — works but requires real flag infrastructure plus a re-deploy when the assets land.
3. **Ship piecemeal** — generate batch 1, deploy, generate batch 2, deploy. Long tail of partial state in production.

v5 ships none of those. The rendering layer went to production tonight with **zero images committed.** The app runs exactly as it did yesterday. When the user runs `npm run generate-visuals` tomorrow, the assets land in `/public/images/`, the loader returns them, and the scenes light up — no code change at deploy time.

The architecture that makes this safe:

- **Loader returns null when an asset is unset.** `getHeroImage(chapter, passageId)` walks the chapter JSON and returns `null` if the `heroImage` field is missing or empty. Doesn't throw. Doesn't degrade. Just returns null.
- **Image components return null when their asset prop is null.** `<HeroImage asset={null} />` renders nothing — no placeholder, no broken-image icon, no skeleton. The scene above it doesn't even know an image was supposed to be there.
- **Scenes call the helpers unconditionally.** No `if (asset) <HeroImage ...>` branching. The reader scene calls `getHeroImage` for the active passage and passes whatever it gets to `<HeroImage>`. Both ends of the chain know how to handle null.
- **Kill switch on top of all that.** `VISUALS_ENABLED=false` makes every helper return null regardless of what the chapter JSON says. Local dev, production rollback, tone-test runs — three different use cases, one mechanism.

The result: every layer in the rendering chain is **tolerant of null by default.** Each layer's "no image" path is the same as its "image hidden by toggle" path is the same as its "image not yet generated" path is the same as its "kill switch flipped off" path. **One degradation contract, four scenarios it covers.**

This is the same shape as the `INSERT OR IGNORE` lesson from content-engine: when the schema enforces what you want by construction, the calling code stays simple and consistent. Here the *types* enforce it — `ImageAsset | null` with null tolerated all the way down, no `!` non-null assertions anywhere in the rendering chain.

Two other small things worth naming:

1. **The kill switch did double duty.** `VISUALS_ENABLED=false` started as a production-safety toggle. Mid-build it turned out to also be the simplest local-dev mode for text-only work — flip it false in `.env.local`, work without a layer of indirection in mental models. Same pattern as feature flags that earn their keep: introduced for one reason, stayed because they solved a different one.
2. **Style prompts are versioned.** `styleKey: 'tissot-19c-v1'` per template. Bumping `v1 → v2` lets me regenerate at scale and identify which assets are out of date. Stored in code (not JSON) so they're reviewable in PRs alongside the rendering changes.

## 🔥 Plan for Day 2

Live test tomorrow night. Eight-scenario dry-run (compliant + adversarial passes) is the gating signal. Tone review on the 12 background cards from v3 plus the four new chapters' worth of authored content from v4 — all of it shipped without per-phase review since I collapsed the review gates. Whatever the dry-run surfaces becomes Day 2's work.

Then, the v5 image generation step: one sample run (one passage hero + four tradition lenses + the generic fallback) for tone check, then bulk generation across all five chapters if the sample passes. ~75–95 images total.

Five chapters live, image rendering wired but dark. Live in 24 hours. ✦

> **Postscript from Day 3.** The sample run did not pass tone check — Pollinations' Flux output gave the Bethesda paralytic six fingers and a torso that didn't make anatomical sense. v5.0's "ship rendering before assets" still held up architecturally, but the *assets* failed quality. v5.5 replaced the AI-first sourcing with public-domain classical paintings (Verrocchio, Veronese, El Greco, Tanner, Siemiradzki, Murillo) imported from Wikimedia Commons via a separate `import-public-domain.ts` pipeline — same `<HeroImage>` primitive, different supply chain. The kill switch never had to flip. Posted as a footnote here because the lesson is exactly the inverse: a clean degradation contract protects you when assets fail, but it doesn't *replace* the asset-quality conversation. AI was the wrong default for canonical religious art.
