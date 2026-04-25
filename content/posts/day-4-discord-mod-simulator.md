---
title: "Day 4 – Discord Mod Simulator"
date: "2026-04-24"
summary: "Three new moderation tools shipped end-to-end: Mute Gun (slow), Timeout Card (freeze), and Kick Boot (AOE pushback). The interesting part isn't any single one — it's how they coexist on the same enemy in one heartbeat without a status-effect manager class."
tags: ["roblox", "luau", "devlog", "phase-2", "tools", "status-effects"]
---
The Ban Hammer isn't lonely anymore. Day 4 ships the rest of the moderator's loadout — Mute Gun, Timeout Card, Kick Boot — plus the four custom hotbar icons that finally make the toolbar look like one cohesive set. But the architectural decision worth writing down is invisible: how three different status effects coexist on the same enemy without a single line of "manager" code. ⚖️

## ✅ What got done today

- **Mute Gun 🔇** — ranged slow effect. New `Effects.MuteEffect` (blue burst), new `MuteHandler.server.lua`, new `StarterPack/MuteGun/` Tool. Tags `MutedUntil` (number) + `OriginalColor` (Color3) on the hit enemy and recolors it blue. `EnemySpawner` heartbeat reads the timer and applies `MUTE_SLOW_FACTOR = 0.25` while active, restores color on expiry.
- **Timeout Card ⏱️** — full freeze, same pattern as Mute. Yellow burst, `FrozenUntil` attribute, `speed = 0`. Stalls zone damage too, so enemies frozen at the goal don't tick the server while paused. Tuned to 4.0s @ 100% hold (saves more distance per cast than Mute's 5.0s @ 75%).
- **Kick Boot 👢** — AOE forward cone, instant impulse. Filters enemies by `dir:Dot(LookVector) >= cos(30°)`, pushes each one radially away from the player so off-center hits fan out instead of bunching. `KickedUntil` (number) + `KickVelocity` (Vector3), 120 studs/s for 0.6s ≈ 72 studs of flight.
- **Hotbar icons.** Replaced the default cube placeholders with custom 1024×1024 PNGs across all four tools. Generated via image gen, iterated to fix three failure modes — baked backgrounds, text on the icon (turns to red mush at 64px), and all-purple-on-dark for Mute Gun. Final prompt enforces transparent canvas, subject touches two opposite edges, one accent color contrasting the body, no fine details. Photopea trim before upload to kill the always-padded export borders.
- **Empty-payload Kick.** Server reads `HumanoidRootPart.CFrame.LookVector` directly; client just calls `KickEnemies:FireServer()` with no args. No way for a malicious client to spoof a 360° cone.

## 🧠 Biggest Takeaway — Kick > Timeout > Mute, in 30 lines of heartbeat

Three status effects, three handlers, three Tools. **Zero `StatusEffects` module.**

Each handler writes one timer attribute and (optionally) one snapshot attribute on the enemy:

| Effect | Timer attr | Snapshot attr |
|---|---|---|
| Mute | `MutedUntil` | `OriginalColor` |
| Timeout | `FrozenUntil` | `OriginalColor` |
| Kick | `KickedUntil` | `KickVelocity` |

`EnemySpawner`'s per-frame heartbeat is the **only** reader. It runs a priority ladder:

```
Kick > Timeout > Mute > seek
```

- **Kick wins everything** because it's an impulse — gating it behind status checks would defeat "knock them flying."
- **Timeout dominates Mute** because freeze strictly contains slow.
- When Timeout expires while Mute is still ticking, the enemy's color drops to mute blue, _not_ OriginalColor — preserves the "still affected" visual without a third state machine.

One writer per attribute. One reader for all of them. Adding a fourth status (Stun? DoT?) means writing one new attribute and adding one branch in the priority ladder. There's no central registry to keep in sync, no event bus to debug, no manager class that becomes the bottleneck.

The tradeoff worth naming: **EnemySpawner has to know all the precedence rules.** That's fine at three statuses. If the count grows past five, the priority logic starts to creak and a real state machine starts to earn its keep. Until then, three branches in a heartbeat beat 200 lines of architecture.

Two other small things from the day:

1. **Whiff fix: Kick effect only fires on hit.** Original behavior fired sound + particles on every cast regardless of contact. Felt off — whiffs made noise but accomplished nothing, and inconsistent with Ban / Mute / Timeout (all gated on validation success). One-line gate: `if hitCount > 0 then Effects.KickEffect(...) end`. Open question filed: should whiffs get a _visual_-only burst (no sound) for cast confirmation? Polish, not shipped.
2. **Tool icon prompt: explicit constraints beat aesthetic guidance.** "Make it look cool" produces beautiful 1024×1024 art that's unreadable at 64×64. The constraints that actually mattered: no text, subject touches two opposite edges, one accent color contrasting the body, transparent background. Style continuity is its own rule — a 4-icon set with mismatched outline weights reads as four random tools, not "the moderator's loadout."

## 🔥 Plan for Day 5

Phase 2's tool side is done. Time for enemy variety.

- **Teleporter enemy** — warps forward 10 studs every few seconds. Disrupts cone targeting; rewards Timeout.
- **Splitter enemy** — banning it spawns two smaller, faster Spammers at the same spot. Punishes greedy chains.
- **Path variation** — a second lane or a branching path so enemies don't all come from the same vector. Forces actual positioning.

The toolkit is wide enough now that variety on the enemy side has somewhere to land. Three tools and four icons later, the loadout finally looks like a moderator's, not a placeholder grid. ⚒️
