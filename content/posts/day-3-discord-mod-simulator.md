---
title: "Day 3 – Discord Mod Simulator"
date: "2026-04-23"
summary: "First day of Phase 2 — 'game feel.' Added a particle burst, a floating coin popup, and a bonk sound on every ban. The gameplay didn't change at all. The game got 10x better."
tags: ["roblox", "luau", "devlog", "game-feel", "effects", "phase-2"]
image: "/images/posts/day-3-discord-mod-simulator.png"
---
Phase 2 starts and the whole point is "make it feel good." Day 6 delivered the single most satisfying change I've made to the project: banning an enemy now has **feedback**. Red sparks, a golden `+10` floating up, and a hard bonk when the hammer connects. Nothing about the rules changed. Every swing suddenly feels like it matters. 💥

## ✅ What got done today

- Built `ReplicatedStorage/Shared/Effects.lua` as the one place all visual/audio feedback lives. Single public function: `Effects.BanEffect(position, reward)`. Fires a particle burst, plays a sound, and spawns a floating text popup — all self-cleaning via `Debris:AddItem`.
- **Particle burst**: 25 red sparks spraying out in a full sphere from the ban point. Lifetime 0.4–0.8s, fades from full size to zero, shrinks while it travels. Reads as "banished" instantly.
- **Floating `+N` coin popup**: golden `GothamBold` text tweens up 3 studs and fades over ~0.9s. Uses a `BillboardGui` on an invisible anchor part so it always faces the camera. You see the reward _where it was earned_, which makes chains feel explosive.
- **Ban sound**: plugged in a proper bonk SFX from the Toolbox. `Config.BAN_SOUND_ID` holds the asset ID string; effects code checks for empty string and plays silently if none is set. One-line change to swap sounds later. Volume lives in Config too (`BAN_SOUND_VOLUME = 0.8`).
- **Wired into `EnemySpawner`**: captured `enemy.Position` _before_ `:Destroy()` (because a destroyed part's Position is meaningless), then called `Effects.BanEffect(banPos, reward)` after the coin award. Four new lines of code in the ban handler.
- Everything runs server-side, so all players see and hear the ban — that matters once the game goes multiplayer. Effects replicate automatically because they're instance creations in workspace.

## 🧠 Biggest Takeaway

**Game feel is a force multiplier on work you've already done.** The particle burst, the popup, the sound — none of them changed a rule. I didn't balance anything. I didn't add a mechanic. But swinging the Ban Hammer suddenly carries _weight_, and the game I'd been playing for five days felt fresh again in one session.

There's a trap in solo gamedev where you keep adding _systems_ because systems are measurable — lines of code, new features on the checklist. Polish isn't measurable that way. It's invisible in the diff. But a 20-minute particle tweak can do more for the player's experience than a whole new enemy type.

Other small wins worth writing down:

1. **Single-entrypoint effect modules scale well.** `Effects.BanEffect(pos, reward)` is one call. When I add Mute Gun effects next week, it'll be `Effects.MuteEffect(...)` — same pattern, same cleanup model. The module grows linearly with features, not quadratically.
2. **`Debris:AddItem` is the right tool for ephemeral effects.** I wrote `task.delay(1, function() origin:Destroy() end)` in the first draft. Replaced it with `Debris:AddItem(origin, 1.5)` — fewer closures, reliable cleanup even if the script errors mid-effect, built-in.
3. **Config-driven asset IDs are cleaner than hardcoded ones.** The sound ID is one string in Config, not buried in Effects.lua. Swapping the ban sound is a one-line diff with no code changes — which means future-me can do it in 10 seconds.

## 🔥 Plan for Day 3.1

Stay in game feel. Three more changes, all about the _moment_ of the ban:

- **Hit flash** 💥 — banned enemy flashes bright white for one frame before the particles spawn. Adds impact. Easy — tween `BrickColor` / `Transparency` on a clone before `:Destroy()`.
- **Camera shake** 📷 — subtle 0.1-intensity bump on the banning player's camera. Client-side only (shake should be player-specific, not global). Fired by a new lightweight RemoteEvent or piggybacked on the existing flow.
- **Swing animation** 🔨 — character visibly swings when the Ban Hammer is Activated. Even without a `Handle`, a simple `Humanoid:LoadAnimation(anim)` on an upper-body swing animation sells the action. If this gets complex, push to Day 8.

Goal for Day 3.1: the ban should feel like a physical _thwack_. Sparks, sound, and text nailed the aftermath. Day 7 nails the moment of impact.

Phase 2, day 2. Game's getting real. ⚒️
