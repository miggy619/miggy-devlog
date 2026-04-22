---
title: "Day 2.1 – Discord Mod Simulator"
date: "2026-04-21"
summary: "Added a second enemy type, built the wave system with difficulty scaling, and hit the first 'it actually feels like a game' moment when wave 3 got scary."
tags: ["roblox", "luau", "devlog", "waves", "gameplay"]
image: "/images/posts/day-3-discord-mod-simulator.png"
---
Day 2 cont. wasn't a big flashy change, but it was the tipping point. The game stopped feeling like a tech demo.

## ✅ What got done today

- Added a second enemy type — `Spammer`. Orange, smaller, twice the speed of a Troll but glass-cannon health. They sprint at the server. Forces you to prioritize.
- Built the real wave system in `RoundManager`. Wave 1 is 5 enemies. Every wave adds 3 more and multiplies enemy speed by 1.15× (compounding). 8-second break between waves.
- Spammers only start appearing from wave 2 with a 30% chance per slot. Wave 1 is pure Trolls — a warmup so you can learn the Ban Hammer before things get chaotic.
- Refactored enemy detection everywhere to use a `IsEnemy` attribute instead of hardcoded `Name == "Troll"`. The Ban Hammer works on every enemy type automatically — including ones I haven't built yet.
- `RoundManager` and `EnemySpawner` talk through two narrow `BindableFunction`s. RoundManager says "spawn one Spammer at 1.3× base speed," EnemySpawner builds it. Then RoundManager polls `GetActiveCount` until the wave clears before starting the break timer.
- Fixed the invisible health label. Rojo creates `TextLabel`s with `Size = {0,0},{0,0}` by default, so it was drawing as a zero-pixel rectangle. One properties edit later: visible, top-center.
- First real death: wave 4 got me. Watched the health tick to 0, label flipped to `SERVER DEAD`, spawning stopped. 💀 Actually felt like losing a game.

## 🧠 Biggest Takeaway

Separation of concerns pays off immediately. `RoundManager` decides **when** and **what**. `EnemySpawner` decides **how** to build an enemy and move it. They only communicate through two small function calls. Adding a third enemy type or retuning wave pacing is now a sub-minute change.

Also worth remembering: Rojo does not give you Studio's friendly defaults. A TextLabel from a `.model.json` starts at zero size. If something's invisible, check Size first.

## 🔥 Plan for Day 2.2

Time to give the player a reason to come back for wave 2.

- Currency — earn coins per enemy banned 💰
- A basic shop UI that shows up between waves 🛒
- First upgrade — probably faster Ban Hammer cooldown, or bigger range

Once money's in the game, every ban _means_ something. That's the hook.
