---
title: "Day 2.5 – Discord Mod Simulator"
date: "2026-04-21"
summary: "Wrapped Phase 1 with a real win condition, visible wave counter, and break countdown. The game now has a start, a middle, and an end — two days in, it's officially a game."
tags: ["roblox", "luau", "devlog", "milestone", "phase-1", "game-loop"]
---
End of day 2 is the day Phase 1 ends. Yesterday this was an empty Roblox project. Today it's a playable loop: enemies attack, I ban them, I earn coins, I upgrade, I survive, I win — or I don't. 🏆

## ✅ What got done today

- **Win condition.** `Config.WAVES_TO_WIN = 5`. Clear the fifth wave and `GameManager.Win()` fires a new `GameWon` RemoteEvent. The client shows `VICTORY` in green and spawning stops. Parallels the existing `GameOver` / `SERVER DEAD` path — same shape, opposite outcome.
- **Wave banner.** New `WaveLabel` under MainUI shows `Wave 2 / 5` during a wave, `Wave 3 / 5 in 7s` during a break, `VICTORY` on win, `Run ended` on loss. One label, four states, driven by the server.
- **Break countdown.** `RoundManager` now ticks `WaveBreak:FireAllClients(nextWave, total, secondsLeft)` every second between waves. The dead air between waves turned into a micro-tension moment — "next wave in 3…2…1…" is a surprisingly good hook.
- **GameManager got a second end-state.** `IsGameOver()` now covers both loss _and_ win, so every downstream `if IsGameOver() then return end` check (there are a few — spawning, damage, ban validation) stops cleanly in both cases without a separate flag.
- **UI polish for the Ban Hammer hotbar slot.** Uploaded a proper gavel icon and wired it to the Tool's `TextureId`. Went from "blank gray square with 'BanHamm er' wrapping awkwardly" to a hotbar slot that actually looks intentional. Tiny change, big vibes.
- **One aborted detour.** I tried to give the hammer a visible 3D handle (shaft + head + weld) before realizing the user just wanted the hotbar icon fixed. Reverted in two minutes. Lesson: when someone says "fix the small square," don't rewrite the tool. 😅

## 🧠 Biggest Takeaway

**Phase 1 is done in two days (six milestone posts) and it's _smaller_ than I expected it to be.**

The whole thing is maybe ~350 lines of Lua across six scripts and a handful of config values. `Config` owns every tunable number. `GameManager` owns the run state. `EnemySpawner` owns enemies. `RoundManager` owns waves. `CurrencyManager` owns coins and upgrades. Client scripts are thin — they render what the server tells them.

What made the run actually work:

1. **Vertical slices, not horizontal layers.** Each day added one complete mechanic end-to-end (spawn → move → ban → reward → upgrade → win) instead of building all server logic first then all client logic. Every day ended with something testable.
2. **Player attributes replace half the RemoteEvents.** Any "per-player state the client needs to render" — coins, upgrade levels, cooldowns — is an attribute. Roblox replicates automatically. I was about to wire three RemoteEvents for currency before realizing this; killed them all.
3. **Rojo owns structure, Studio owns feel.** `.model.json` creates the instance with Name/Text only. Size, Position, colors, Font, materials — all tweaked in Studio so I can iterate visually without a redeploy. Workspace isn't Rojo-owned at all (learned that one the hard way when map geometry got nuked).
4. **Testing every 5-10 minutes is the actual unlock.** The bugs I caught were almost always 5 minutes old. The bugs that hurt were the ones that hid for 45 minutes before I ran the game.

Two days in, the repo has a file for every system, a devlog for every milestone, and a working core loop. That's a better foundation than most "hackathon" Roblox projects end up with — and it was all incremental.

## 🎯 Phase 1 — Retrospective

Two calendar days, six milestone posts:

| Milestone | Feature | Outcome |
|---|---|---|
| Day 1 | Project + Rojo setup | Project runs |
| Day 1.5 | Blog rebuild + `/admin/new` | Posting flow shipped |
| Day 2 | Enemy spawn/move, server health, Ban Hammer | Playable loop exists |
| Day 2.1 | Second enemy type, wave scaling, health UI | You can *lose* |
| Day 2.2 | Currency, shop button, first upgrade | Reason to keep playing |
| Day 2.5 | Wave counter, break countdown, win condition | ✅ Phase 1 closed |

**Where it ships now:** a 5-wave survival mini-game where you ban Trolls and Spammers, earn coins, and buy upgrades between waves to make the next waves survivable. Not fun _yet_. Functional — absolutely.

## 🔥 What Phase 2 looks like

Phase 2 is "game feel" — calendar Days 3 through 9. The code barely grows. The game transforms.

- **Days 3–4: Hit effects + enemy feedback.** Right now, banning an enemy just silently deletes the part. That needs to feel like something. Planned additions:
  - Red particle burst + "poof" when an enemy is banned
  - A solid ban sound effect (that banished-gavel thump)
  - Enemy flashes white for one frame on hit
  - Floating `+10` coins text that rises and fades from the ban location
  - Swing animation on the character + tiny camera shake
- **Day 5: More moderation tools.** Mute Gun (slows enemies), Timeout (freezes one in place), Kick (pushback cone). The Ban Hammer is one button; a real mod has a toolkit.
- **Days 6–7: Path variation + annoying enemy types.** Teleporter that skips part of the path. Splitter that becomes two Spammers on ban. Maybe a VIP troll that takes two bans.
- **Days 8–9: Real UI pass.** Proper health bar (not just text), enemy counter, round number, nicer currency display, shop panel instead of a single button.

The Phase 2 milestone per the plan: **"Looks like a real game."** That's the bar.

## 🔥 Plan for Day 3

Keep it tight — three changes, one session:

1. Particle burst on ban 💥
2. Ban sound effect 🔊
3. Floating "+10" coin popup at the ban location

Swing animation and camera shake slip to Day 4. Build the ban moment first; everything else is polish around it.

Phase 1 done. Most people quit before here. On to the fun part. ⚒️
