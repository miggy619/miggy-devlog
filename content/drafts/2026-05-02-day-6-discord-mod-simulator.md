---
title: "Day 6 – Discord Mod Simulator"
date: "2026-05-02"
summary: "37 commits in one calendar day. Phases 3, 4, and 5 of a 30-day plan all closed in a single push — Days 13 through 27 shipped between breakfast and bedtime. The pattern that made it work: one Q&A session per phase up front, then continuous code with commits per day. The autonomous batch is the unlock; the close-out devlogs are what keep it from rotting."
tags: ["roblox", "luau", "devlog", "phase-3", "phase-4", "phase-5", "ai-workflow"]
---
Today is the day this project went from "30-day Roblox build" to "30-day Roblox build, almost shipped." 37 commits to `main` between morning and night. Phase 2 closed (bookkeeping). Phases 3, 4, and 5 closed (real code — Days 13 through 27 of the plan). Stabilization pass on top. First-ever push to `origin` — 47 commits ahead → 0 commits ahead in one motion. Game is live (privately) at the share URL. Phase 6 launch is the only thing left between the project and a Roblox listing. ⚒️

## ✅ What got done today

- **Phase 2 close** — bookkeeping entry. `plan.md` §2 was still saying "Day 5 / Phase 1." Rewrote to reflect actual state (Day 12 / Phase 2 closed). 30 minutes; cost paid back the first time anyone reads the plan top-down.
- **Phase 3 close** (Days 13–18 + a Day 14.5 detour). DataStore + schema-versioned saves. 4 cooldown upgrades. **Mute Gun reworked** mid-phase from a slow utility into a hitscan freeze gun (gun model with Handle + Barrel + Sight, mouse-cursor raycast, two-hit destroy, cyan tracer). `COMBO_MULTIPLIER = 2` doubles coin reward when destroying frozen enemies. Tool unlock system gates Mute / Timeout / Kick behind coin costs (100 / 150 / 200). 3 wave modifiers (Spam Storm, Toxic Wave, Splitter Surge). XP/level system. Restart flow with `GameOverPanel` + retry.
- **Phase 4 close** (Days 19–22). 3 gamepasses (Double Coins, Faster Cooldowns, Starter Pack) + 4 dev products (Instant Revive, Coin Pack S/L, XP Boost) + Shop UI. All built against `id = 0` placeholders so Roblox monetization API calls no-op gracefully — Creator Hub IDs paste in later. Tool unlock costs bumped 50% to make Starter Pack worth it.
- **Phase 5 close** (Days 23–27). Themed map via Studio command-bar script (12 polish parts auto-placed: server tower with LED bands, Wumpus statue, decorative pillars, lane stripe, Discord-blurple particles). Touch controls (UIScale 0.75 + virtual KICK button). Meme enemies — Karen ("I WANT TO SPEAK TO THE OWNER"), Furry, Discord Mod, with `speechPool` tables and chat-bubble speech on spawn. Roblox leaderstats. Server-bounced Mute Gun tracers (other clients see your shots).
- **Stabilization + first push.** Map polish iterated 3 times to fix Z-fighting + spawn placement + decor density. **5s visible start countdown** added (enemies were spawning before the player could check the shop). Two real bugs fixed (a Lua closure-scoping crash and a Rojo "didn't sync new instances" issue). Real Creator Hub IDs wired in (3 gamepasses + 4 dev products live). **47 commits → pushed to `origin/main` for the first time since Day 1.** Local-only single-point-of-failure removed.
- **Schema versions: v1 → v2 → v3 → v4 → v5 across the same calendar day.** Zero saves lost across four migrations. Each one was 4–6 lines.

## 🧠 Biggest Takeaway — the autonomous batch was the unlock

Phase 1 (Days 1–5) took 5 calendar days. Phase 2 (Days 6–12) took 7 calendar days. Phases 3 + 4 + 5 (Days 13–27) shipped in one calendar day.

That's not a typo. The whole second half of a 30-day plan compressed into a single push, with 37 commits to show for it.

The pattern is simple enough that I want to name it precisely so it generalizes:

**1. One Q&A session per phase, up front, all defaults locked.** Before each phase, I sat down with Claude and went through every design question the phase would surface — Phase 4 alone had ~12 of these (gamepass list, gamepass effects, dev product list, dev product effects, monetization-receipt semantics, balance pass scope, schema migration shape, etc.). Each got a default answer with a "this is the autonomous default; flag it now if you want to override." Took ~15 minutes per phase.

**2. Then continuous code, commits per planned day.** No mid-phase pauses to ask "should the Coin Pack Large grant 500 or 800?" — that question already had a default. The code session became "execute the phase," not "execute and clarify the phase." Phase 3's six commits map cleanly to Days 13 / 14 / 14.5 / 15 / 16-17 / 18 of the original plan.

**3. Phase close-out devlog as a hard checkpoint.** Each phase ends with a structured close: scope-vs-actual table, "decisions made (and why)," "what's intentionally not built yet," by-the-numbers ledger, hooks for the post. **This is the part that keeps the autonomous batches from rotting.** Without it, Phase 4 would start while `plan.md` still claimed Phase 2 was the current state — and any future-me (or AI assistant) reading the project top-down would onboard from a lie. The close-out is 30 minutes per phase and makes the docs into a current map of the build instead of a historical one.

What this is not: it's not "let the AI build the game." Every default in step 1 was a real design decision I made and would defend. The compression isn't from skipping decisions — it's from making them in batched bursts instead of staccato interrupts. Three days' worth of "wait, what should this enemy speed be" gets compressed into "here are the seven enemy speeds, go."

What it also isn't: a substitute for the phases that genuinely needed fresh-eyes work. Phase 1 (Days 1–5) was the foundation pass — every system from scratch, every architectural choice load-bearing. Phase 2 (Days 6–12) was the game-feel pass where you can only really judge "is this satisfying" after you press the button and watch. Neither of those compresses well; they want playtesting between each step. Phase 3-5 were execution-heavy phases where the design space had already been mapped out, and that's where the pattern shines.

The transferable bit, past Roblox: **AI execution collapses time on tasks where the design is already decided. It doesn't shortcut the deciding.** The work that batches well is the work that has a spec; the work that doesn't batch is the work that needs a person sitting in front of the result going "no, more orange." Most projects have both kinds in different ratios. This game's ratio favored the batchable work in the back half — so the back half compressed.

## 🪛 Two bugs worth naming, because they'll happen again

**Lua closures don't see locals declared later.** In `ClientMain`, the `gameOver` and `gameWon` handlers were defined at line 128, referencing `waveState`. `waveState` was declared at line 178. Lua closures bind upvalues at function-*definition* time, not call time — so the handler captured `waveState` as a global, found nothing under that name, resolved it as `nil`, and crashed at `.wave`. The fix is one line (hoist the declaration). The lesson is forever: in Lua, "declared later in the same file" means "doesn't exist" from the closure's perspective.

**Rojo can fail to sync new instances if your Studio session predates the file.** `GameOverPanel.model.json` had been on disk for days. The `GameOverPanel` instance never appeared in Studio's Explorer. The reason: Studio session was opened before the file existed, and `rojo serve` doesn't always backfill instances added mid-session. Fix: `rojo build` + reopen the `.rbxlx`. Reset hammer. Now in the troubleshooting guide.

A small piece of infrastructure fell out of the GameOverPanel hunt: a `strictChild` wrapper that fails loudly when a `WaitForChild` resolves nil, with an error message naming the missing child *and* pointing at the likely Rojo cause. Five lines, infinite-times-better debugging UX. Should be the default WaitForChild wrapper in any non-trivial Rojo project.

## 📊 By the numbers

| | |
|---|---|
| Phase 1 duration | 5 calendar days (Days 1–5) |
| Phase 2 duration | 7 calendar days (Days 6–12) |
| Phases 3 + 4 + 5 duration | **1 calendar day (Days 13–27 of plan)** |
| Commits today | 37 |
| Schema versions shipped today | 4 (v2 → v3 → v4 → v5) |
| Saves lost across migrations | 0 |
| First push to `origin/main` | Today (47 ahead → 0 ahead) |
| Status | Code-complete. Phase 6 launch tomorrow. |

## 🔥 Plan for Day 7

Phase 6 launch — icon, thumbnail, description, hashtags, public release. The shortest phase by design: most of the work is creative-asset decisions plus the Roblox publishing flow (ID + age + 2-step + Premium for the all-ages publishing tier). If it goes the way the back half just went, the game is live tomorrow. ⚒️
