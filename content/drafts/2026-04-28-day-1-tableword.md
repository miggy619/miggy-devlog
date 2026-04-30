---
title: "Day 1 – Tableword"
date: "2026-04-28"
summary: "Tableword (started life as `bethesda` — a John 5 prototype that kept its codename until the v8 rebrand) is a live multiplayer Bible study app I've been building on the side. Today's marathon shipped section navigation, a three-feature translation switcher, and anonymous Q&A. The interesting part is what the inventory script told me about the project's actual constraint."
tags: ["nextjs", "pusher", "tableword", "devlog", "bible-study"]
---
Tableword is a live multiplayer Bible study app I've been building on the side. Host opens a room, players join with a code, host walks the group through scripture scene by scene — quiz rounds, background cards, tradition spotlights, anonymous Q&A — and players follow on their phones in lockstep. (Quick naming note: the project started as `bethesda` because the first prototype was John 5 and the pool of Bethesda was the test passage. The user-facing rename to Tableword landed a few days in, after `logos.com` turned out to belong to Faithlife's Logos Bible Software. The repo, the folder, and the production domain are all `tableword` now; the React component that fetches John 5 still says `bethesda` because the *pool* is still the pool.) Today shipped v3, which sounds like a small version bump but was actually the marathon: section navigation across the whole chapter, full Bible translation switching with three different override scopes, and a brand-new anonymous Q&A scene. The technical decisions were interesting; the story they told me about the project was more interesting. ✦

## ✅ What got done today

- **Section navigator** — `lib/game/sections.ts` is the new spine. Holds the section list (derived from passages JSON), per-section content keys (firstQuizId / crossrefAnchor / reflectionPromptId / traditionSpotlightId), and `resolveSectionFromScene(scene)` so player surfaces can derive the "SECTION X of N" caption from the current scene without a separate Pusher event.
- **Translation switcher (the three-feature one)** — room default dropdown next to the room code, scene-scoped reader override via a new `reader:translation-pick` event, and a personal-mode pill in the player's reader scene that toggles between follow-reader and per-player local. Each has its own state machine. `loader.resolveTranslation({ scene, player, room })` is the canonical chain for follow-mode; personal mode bypasses it intentionally.
- **Anonymous Q&A scene** — new `'qa'` ScenePayload variant. `qa:question` event carries `{ questionId, text, askedAt }` — no playerId, strict anonymity. Host wall sorts open newest-first; "💬 Discussion" + "✓ Answered" mark buttons publish `qa:answered`. Players can ask multiple questions per session.
- **Background card scene** — new `'background'` variant carrying `{ passageId, cardIndex }`. Host walks card-by-card; final card's NEXT becomes BACK TO LOBBY. Player view paged in lockstep at host's pace via `scene:set` per advance. 16 cards across 4 sections (4 per section, one per kind: historical / cultural / textual / theological).
- **Quiz round summaries** — `'round-summary'` scene variant with per-player rows + an optional "most surprising" callout when an option had <25% pick rate AND was correct. Shipped instead of the originally-planned `quiz:round-end` event — `scene:set` is the channel players already follow; dropping a parallel event narrows the contract.
- **Inline crossref pills on the player surface** — small ✦ pill next to each verse whose start matches a crossref anchor. Tap expands inline. Player-local state, no Pusher event, single-open at a time.

## 🧠 Biggest Takeaway — the content was already there; I just needed to stop hardcoding

Plan-v3 was framed as "the app only covers John 5:1–9; we need to fill in 5:10–47." That framing implied a content gap — most of v3's effort would be authoring more quiz questions, more crossref anchors, more tradition spotlights, more reflection prompts.

The inventory script I ran in Phase 1 said something different.

The `john-5.json` content file already had **20 quiz questions across all 4 sections, 4 crossref anchors (one per section), 6 reflection prompts spanning the chapter, and 3 of 4 tradition spotlights authored.** The content was already there. What was missing wasn't authoring — it was *navigation.* The app surfaced hardcoded `CROSSREF_ANCHORS = { bethesda: '5:8' }` style maps in `sections.ts`, and the launch buttons all routed to those constants. The host had no way to switch which section was active, so even though the JSON had quiz `q5` for section 2 and reflection `r3` for section 3, no UI surface exposed them.

Phase 1 was a pure code change: add the section navigator, route launches through the active section's keys instead of the hardcoded constants. **That single phase unlocked ~75% of the perceived "missing content" with zero new authoring.**

The lesson generalizes past this app: **content-shaped problems and navigation-shaped problems look identical from the outside.** When the user (me, in this case) says "this section is missing," the work might be writing the section, or it might be wiring the section that's already written but unsurfaced. The cheap diagnostic is an inventory script: walk the data files, count what's there per category, compare against what the UI exposes. If the data outnumbers the UI, you have a navigation problem; if the data is sparse, you have a content problem. Two different fixes; one looks like the other from far away.

Two other quiet decisions worth naming:

1. **Round summary is a scene variant, not a `quiz:round-end` event.** Plan-v3 specified a parallel event for delivering the summary. Mid-build it became obvious that `scene:set` is already the channel players follow for every transition — adding another event channel just to deliver round-end data doubles the contract for no functional gain. Dropped the event; the summary lives in the scene payload. One less bind in `useRoomChannel`, one less demux branch.
2. **Personal-mode translation bypasses the resolution chain.** The clean-looking `resolveTranslation({ scene, player, room })` helper is for follow-mode. Personal mode is a separate path: the player surface uses `preferredTranslation` directly *and* separately checks `scene.translation` against `preferredTranslation` to decide whether to fire the sync prompt. Two checks, intentionally — pulling personal-mode awareness into the helper would force every consumer to know whether to suppress the prompt. Keeping the helper as a pure resolution chain and letting personal-mode logic live alongside is cleaner.

## 🔥 Plan for Day 1.1

The marathon shipped v3. Tonight's session shipped v4 + v5 in the same PR — multi-chapter foundation (John 1–5, four new chapters of authored content), image schema, and a generation pipeline that ships dark behind a kill switch. That's the next post.

Live test target: tomorrow night. Eight-scenario dry-run plus tone review on 12 unreviewed background cards before then. ✦
