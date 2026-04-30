---
title: "Day 2 – Tableword"
date: "2026-04-29"
summary: "Closed out the NT canon (260 chapters across all 27 books), shipped Phase 1 of patristic commentary on the Gospels (267 cards), started the OT with Genesis 1–14, and landed the load-bearing fix the live UX has been quietly bleeding from: a 5-second heartbeat that re-syncs players whose phones background-throttled the WebSocket while they tabbed to TikTok."
tags: ["nextjs", "pusher", "tableword", "devlog", "websockets"]
---
One continuous session that did three things at once: closed out the NT base content (Hebrews + General Epistles + Revelation = the last 35 chapters), shipped Phase 1 of patristic commentary across the four Gospels (267 cards from Augustine, Chrysostom, Ambrose, Cyril, Theophylact, Bede, Irenaeus, Origen, Cyprian, Athanasius), started the OT with Genesis 1–14, **and** shipped the heartbeat-resync mechanism that nobody asks for until it's been silently killing their live sessions. The heartbeat is the most important 30 lines this week. ✦

## ✅ What got done today

- **NT canon completion.** Phase 4 (Hebrews 1–13, James, 1+2 Peter, 1+2+3 John, Jude — 35 chapters) and Phase 5 (Revelation 1–22). All 27 NT books now fully authored — **260 chapters** with verses (WEB), quizzes, crossrefs, reflection prompts, tradition spotlights, and recap cards. Two contested-tradition spotlights on Revelation: Rev 7 (the 144,000) and Rev 20 (the millennium) — those are where the four traditions genuinely teach divergent positions, not just emphasize differently.
- **Patristic Phase 1 — the Gospels.** Four agent runs, four commits, **267 cards across 89 chapters.** Matthew (Augustine 15 / Jerome 6 + Chrysostom dominating Orthodox at 28/28 — his 90 homilies on Matthew are *the* canonical patristic source), Mark (Bede + Theophylact + Synoptic-parallel Chrysostom citations), Luke (Ambrose's Exposition of Luke + Cyril of Alexandria), John 6–21 (Augustine's *Tractates on John* 16/16 on Catholic — the Western commentary on John has no real competitor). Common rotates Irenaeus / Cyprian / Origen / Tertullian / Athanasius / Justin / Melito.
- **Patristic spec doc** (`docs/patristics.md`, 223 lines) authored before the agent runs. PD source pool (NPNF / ANF / Catena Aurea, never SVS Press / Brepols / Popular Patristics / modern Chrysostom Press translations because they're in copyright), Father-to-book map for every NT book, contested-flag guidance with concrete passages (Mt 16:18, Jas 2:14–26, Heb 6:4–6, etc.), 10-phase rollout plan for ~3,500 cards at completion. Once written, every agent prompt cited it directly — went from "explain the rules each run" to "execute against the spec."
- **OT begins.** Genesis 1–14 — primeval history through Abram + Lot + Melchizedek. Full schema (passages, WEB verses, quiz, crossrefs, reflection prompts, recap card). First block of OT content; the picker now shows chapters 1–14 launchable with 15–50 dimmed `coming-soon`.
- **Heartbeat resync** — new Pusher event `scene:heartbeat` fires every 5s plus immediately after every state change, carrying the *full canonical state* (`scene` payload + `highlights[]` + `discussionQueue[]` + monotonic `version` + `sentAt`). Players track `lastHeartbeatVersionRef`; higher version → snap. `visibilitychange` listener flips a `pendingResync` flag on tab-back; the next heartbeat (≤5s away) shows a brief `✦ SYNCING…` toast. Self-healing across every dropped-message failure mode.
- **`player:alive` pulse + 💤 idle indicator on host.** Players emit every 5s while foregrounded; pause while hidden (that's the signal). Host tracks `playerLastSeen`; tile dims to 55% opacity and shows 💤 after 15s silence. Member-join seeds last-seen so newly joined players don't flicker idle before their first pulse.
- **Host feature toggles.** `<SessionFeatureToggles>` collapsible panel with five switches (background, patristic, warmup, reflection, tradition). All default on. `buildSessionPlan(book, chapter, mode, features)` filters disabled features out of the *suggested* arc — the free-choice footer rail still launches them manually. Toggles are defaults, not locks.
- **Patristic commentary scene wired in.** New `'patristic'` ScenePayload variant inserted between `background` and `quiz-warmup` in the per-passage flow. Single-screen render (host shows three voices side-by-side; player view filters to one based on `getSpotlightLensKey(selection)`). Same `<DisagreementDisclaimer>` modal pattern as tradition-spotlight reused.
- **Host-as-reader / "I'll read" tile.** ~88 lines, no Pusher changes, no schema changes. New gold-outlined tile in the lobby reader-pick grid alongside `🎲 RANDOM` and player tiles. Solves the actual workflow the host uses 80% of the time before a session starts. Should have shipped earlier.
- **`'Rather not say'` tradition + picker reorder + Extra-canonical rename.** New value in `TopLevelTradition` mapped to `'generic'` lens (same as `'Still figuring it out'`). Picker group order flipped OT first → NT → Extra-canonical; `"Ethiopian Orthodox Canon"` shortened to `"Extra-canonical"` after user feedback.

## 🧠 Biggest Takeaway — heartbeat is the boring fix nobody implements until it bites them

Modern phones background-throttle WebSockets aggressively. Safari iOS pauses them within seconds; Chrome Android throttles based on power state; some Samsung skins kill them outright. The user's friends would tab to TikTok mid-Bible study, come back two minutes later, see the *old* scene on their phone, ask "what's happening." The host had moved on three scenes ago. Pusher messages had been dropped while the WebSocket was paused, and the player surface had no mechanism to notice.

The fix isn't clever. It's the boring continuous-snapshot pattern that distributed-systems classes teach in week two:

- **Host emits a `scene:heartbeat` every 5 seconds** carrying the entire canonical state (current scene, highlight set, discussion queue, monotonic `version` counter, `sentAt` timestamp).
- **Players track `lastHeartbeatVersionRef`.** On receipt, if `payload.version > lastHeartbeatVersionRef.current`, they snap their local state to the heartbeat — wholesale, not deltas.
- **`visibilitychange` listener** flips a `pendingResync` flag on tab-back. The next heartbeat (≤5s away) shows a brief `✦ SYNCING…` toast so the player knows the catch-up is happening.

The architectural decisions that mattered:

- **Full state every fire, not deltas.** The `version` field is just a monotonic counter — players use it to detect "have I seen this yet?", but the *snapshot* is always wholesale. Convergence is automatic regardless of which messages got dropped. Same logic the existing `reader:highlight-set` and `discussion:queue-update` events already used; the heartbeat just generalizes it.
- **Cost is negligible.** ~720 messages per hour-long session; ~7,000/day at 10 sessions. Pusher's 200K/day quota = 3.5% utilization. That's the math that lets you choose "send the truth continuously" over "send deltas and pray nobody dropped one."
- **`player:alive` is a separate channel from the heartbeat.** Could have piggybacked on Pusher's presence-channel events, but `member_added` / `member_removed` only fires on actual subscribe/unsubscribe — not on background-tab silence. Needed an explicit pulse for that. 5s interval matches heartbeat's, so they're paired in cadence by design. The host then has a `playerLastSeen` map and can dim idle tiles — gives the host real-time information about who's actually paying attention.

The architectural rule that forced this design (and made it *good*): the project's CLAUDE.md says "no DB, no Vercel KV, host's browser tab IS the source of truth for game state." So tab-out resync had to live in the existing Pusher + host-tab architecture. Heartbeat is the *cleanest* path to resync under that constraint — continuous truth from the host, players reconcile on receipt, zero server state. The constraint forced a pattern that's actually better than what I'd have built with a backing store.

The lesson generalizes: **continuous-snapshot beats event-deltas anytime your transport drops messages.** Event-driven is great when it works; when it doesn't, it fails *silently* in a way deltas can't recover from. Heartbeat-with-version-counter doesn't even need to know what failed — it just rewrites local state from the canonical truth on every fire, and convergence is by construction. Should have been there from v1.

## 🧩 The other thing — agent fleets on a single repo

Phase 1 patristics + Genesis 1–14 = five separate agent runs across the day. Four parallel agents on overlapping codebase (`loader.ts`, `_books.json`) would race and conflict if they all worked the same checkout. Solution: `Agent` tool with `isolation: "worktree"` — each agent gets `.claude/worktrees/agent-<id>/` and its own branch. The agent commits + pushes its branch; the parent (me) merges to main and cleans up.

Result: zero git conflicts across five runs, four ships, one merge step per ship. The pattern transfers to any "agent fleet on a single repo" scenario, which is increasingly the work shape.

Two watch-outs from the runs that actually happened:

- **First OT agent run produced zero commits** because it hit its budget before its first commit fired. Worktree was auto-cleaned. All work was lost. The fix in subsequent prompts: explicit guidance to commit early and often (e.g., "commit Genesis 1–25 before continuing to 26–50") instead of "commit when the book is done." Lossy file recovery shouldn't be the default.
- **Agents may write outside their worktree.** The Phase-1-finishing run (Jn 6–21) wrote into the main repo's working tree first, then copied to its worktree, then reverted main. The agent flagged this in its summary. Result: when I went to merge its branch, main had a leftover scope-creep edit on CLAUDE.md (rewriting the "phase 0 does NOT include" section to reflect current shipped state). Reverted. Lesson: after merging an agent's branch, always run `git status` in main and review any remaining modifications. Agents don't always understand path resolution under worktree isolation.

## 🔥 Plan for Day 3

NT patristics Phase 2 (Acts + Pauline epistles, ~115 chapters / ~345 cards) is the next NT patristics target. Realistic agent scope: 2–3 runs, one per book group. OT continues from Genesis 15 — 36 more Genesis chapters, then Exodus, then the long Pentateuch tail.

But Day 3 is actually going to be a **planning day, not a build day.** The pilot session went well; the next layer of work is the platform layer — accounts, custom plans, voting, comments, donations. That's a different shape of project (database, auth, SaaS-ish surface area on top of a stateless live-room app). Tomorrow is for writing the v2 spec end-to-end before any code, and for working out a monetization model that doesn't compromise the project's posture. ✦
