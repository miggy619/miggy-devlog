---
title: "Day 3 – Tableword"
date: "2026-04-30"
summary: "Pure planning + docs day. Wrote the v2 platform spec end-to-end (~700 lines: accounts, custom plans, voting, comments, donations), then pivoted the monetization model after a second-pass conversation. The decision that mattered most isn't in any framework's docs: GDPR Article 9 classifies reflections on scripture as special category data, and that pulled the analytics plan apart and put it back together correctly."
tags: ["tableword", "devlog", "planning", "gdpr", "monetization"]
---
Zero code today. Spent the session laying out the v2 platform expansion (accounts + plans + voting + comments + donations) end-to-end before writing any of it, then pivoted the monetization model after a second-pass conversation, then wrote three tier-build/migration plans detailed enough that a Sonnet-grade model can execute them. The two interesting decisions were the Article 9 push-back on analytics and the cosmetic-only monetization model that fell out of it. Both are the kind of call that's easier to make at the spec stage than after the schema ships. ✦

## ✅ What got planned today

- **`v2-platform-expansion.md`** — single 14-section reference doc, ~700 lines. Vision: turn Tableword from a stateless live-room app into a community platform with accounts, custom plans, publishing, voting, threaded comments. Architecture choices locked via 5 questions: (Q1) soft auth wall — hosting and publishing require accounts, anonymous players still join with a 4-letter code, preserves the v1 magic; (Q2) Supabase as the single vendor for auth + Postgres + storage + realtime; (Q3) donations only at launch; (Q4) open catalog with threaded comments + edit/delete + no anonymous comments; (Q5) users author plan structure / metadata / reflections / quizzes / backgrounds / cross-refs — tradition lens content + scripture text stay locked, image uploads gated.
- **Data-model sketches** (SQL): `profiles`, `plans` (JSONB body), `plan_votes` (with aggregate trigger so the vote count denormalizes onto the plan row), `plan_comments` (threaded via `parent_id`), `plan_flags` (3-reporter auto-hide), `donations`. RLS policies sketched for every table.
- **Cosmetic-monetization pivot** mid-session. Cut all image uploads except profile pics, reframed profiles as Steam/Discord-style (favorite verse + study counts + customization), shifted donor incentive from "pay for features" to "pay for cosmetic recognition." Phase F (Pro tier) dropped entirely. Functional capability stays permanently free for everyone (50-player rooms, unlimited plans, all themes, discussion mode).
- **Legal section (§9.5).** GDPR Article 9 + religious-belief data. Privacy Policy required at Phase A; Terms of Service at Phase C; cookie consent only if non-essential analytics ship; sign DPAs with all data processors. Vercel Analytics for launch (no cookies, GDPR-compliant) — explicitly avoid GA4 / Mixpanel.
- **Three tier docs** in `.docs/v2/`: `tier-a-build-plan.md` (~1,800 lines, sub-day-level steps, schema migrations, env vars, acceptance checks), `tier-b-migration-plan.md` (~600 lines, triggers + capacity-dashboard prep + rollback), `tier-c-migration-plan.md` (~700 lines, Sentry setup + materialized views + image-serving decision tree + the explicit acknowledgment that V17's "no functional paywall" promise may need to bend at 5k+ MAU if donations don't cover ops).
- **CLAUDE.md catch-up.** Added a "v-chapter-expansion phases 1–3" section covering work that quietly shipped during the content blitz: `<StartPicker>` testament-group-book-chapter drill-down, `<OSBModeToggle>`, patristic commentary scene + cards, host feature toggles, heartbeat resync mechanism schema, `Rather not say` tradition addition, host-as-reader option. Updated phase 0's "does NOT include" list to mark items now done. CLAUDE.md was lying — past tense matters in design docs.
- **20 decisions locked total** (V1–V20) across vision / architecture / monetization / legal / tier triggers.

## 🧠 Biggest Takeaway — Article 9 is not in any framework's docs but it's the load-bearing call

The first draft of the v2 plan wanted analytics on user behavior — including, in the user's words to me, "their responses to prompts, their reflections." Standard SaaS instinct: instrument everything, find what works, iterate.

I pushed back hard. The reasoning chain is short and decisive:

1. **GDPR Article 9** classifies "data revealing religious beliefs" as *special category* data. The bar for processing is explicit, separate, granular consent — substantially heavier than ordinary processing, and revocable at any time.
2. **Reflections on Bible passages reveal religious beliefs** by any reasonable reading. A user typing their honest response to "where do you most feel the gap between yourself and God in this passage?" is producing exactly the data Article 9 was written to protect.
3. **The consent bar to legally analyze that content is therefore very high.** Not impossible, but the friction cost of doing it correctly (separate consent screen, plain-language explanation, revocation flow, separate processor DPAs) is significant — and the cost of getting it wrong (regulatory exposure, but also user trust collapse) is asymmetric.
4. **The analytical benefit is small.** I don't need to read what people wrote to know whether the feature works. I can measure: did the reflection scene get reached? Did the user submit *something*? Did the host advance past it? Those are non-content metrics, no Article 9 issue, sufficient to answer every product question that actually matters.
5. **The trust violation if it were ever discovered** would be terminal for an ecumenical Bible study app. The whole posture of the project is "this is a safe place to think out loud about scripture across traditions." Mining what people write inside that posture would invert the brand.

So: **don't analyze reflection content. Ever.** Stored if needed for the user's own playback (they want to see what they wrote in past sessions), but never read at the platform level. Make this commitment public on `/privacy` as a trust marker — *we don't read your reflections* is the kind of distinguishing claim a mission-driven app should be able to make and back up architecturally.

The lesson generalizes past this app: **the load-bearing privacy decisions usually aren't in the framework docs.** GDPR Article 9 is in the regulation; it's not in a Supabase RLS tutorial or a Vercel Analytics guide or a Next.js middleware example. The default analytics setup most starter projects ship with would technically be Article 9 non-compliant the moment a religious app turns it on against reflection content. Catching that at spec stage costs nothing; catching it at audit stage is a migration.

The right time to say "we don't analyze reflections" is *before* you've shipped the analytics that would have made it tempting to start.

## 🪙 The cosmetic pivot — why functional paywalls were the wrong design

The original v2 doc had a Phase F: "Pro tier — paywalled 50-player rooms, custom themes, plan analytics." Standard freemium shape, would have generated revenue. Got pushed back on it explicitly: cosmetics-for-donors is a better fit for "mostly open."

The argument that landed:

- **Cosmetics convert in mission-driven communities.** Discord Nitro, Twitch subs, GitHub Sponsors, the entire patron-style economy — the demonstrated pattern is that people pay to *signal support* and to *decorate their identity*, not to unlock capability. The conversion math on cosmetics in communities-people-care-about is better than the conversion math on functional gates.
- **Functional paywalls in mission-driven communities create resentment.** A user who can't host a 50-person Bible study because they're not a paid subscriber doesn't think "I should pay" — they think "this app put a wall in front of my church group." Inverse of the brand posture.
- **The cosmetic surface is genuinely large enough to monetize.** Donor badge + animated avatar frame + nameplate background pattern + custom username color + a couple of extra theme presets = enough variety for the donors to actually customize, contained enough that the *non-donor* identity layer doesn't visually rot.

So Phase F died. Functional capability stays free for everyone, permanently. The new monetization model: single donor tier (any donation = donor badge + all cosmetic options) + cumulative anniversary milestones (1mo / 6mo / 1yr / 3yr) for sustained giving. **No "$5 looks lame next to $50" tier dynamic** — that's the part of patron-style economies that breeds resentment, and it's avoidable.

The two pieces interlock. The Article 9 commitment makes the trust posture credible; the cosmetic-only monetization keeps the trust posture commercially aligned. If I'd kept Phase F, the Article 9 commitment would have read as marketing veneer over a paywall app. If I'd kept the analytics-on-reflections plan, the cosmetic-only pivot would have read as the kind of "we care about your privacy" claim every app makes while still selling the data. Together they read as actually meaning it. Apart they don't.

## 📂 Tier docs as agent-executable specs

Last thing worth naming: the three tier docs (Tier A build, Tier B migration, Tier C migration) are written at sub-day-level granularity — schema migrations as full SQL, env vars as named keys, acceptance checks per task — specifically so a Sonnet-grade model can execute them without me re-explaining context.

Same lesson as `docs/patristics.md` from yesterday: the spec *is* the prompt. A 1,800-line build plan with concrete migration files and RPC signatures and route lists is a force multiplier when the work gets parallelized across runs. The Tier C doc explicitly acknowledges a contradiction (V17's "no functional paywall" promise may need to bend at 5k+ MAU if donations don't cover ops at scale) — better to surface that in the plan than discover it under pressure later.

Spec discipline at planning time is cheaper than recovery discipline at execution time. Always.

## 🔥 Plan for Day 4

Tier A Phase A starts the actual build. Pre-flight (~half day): Supabase project + DPAs + Stripe test mode + Resend + Vercel env vars + reserved usernames + email aliases + `npx supabase init` + new deps (`@supabase/ssr`, `stripe`, `resend`, `zod`). Then Phase A.1 — apply `00001_phase_a_schema.sql` (profiles + study_counts + the `increment_study_count` security-definer RPC + RLS).

Phase A target end state: anyone signs up, sees a basic profile, study counts attributed at session-end, `/privacy` live with the no-reflection-analysis commitment. 1.5–2 weeks if I don't get sidetracked by content runs.

Plan-day done. Build resumes tomorrow. ✦
