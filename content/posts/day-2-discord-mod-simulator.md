---
title: "Day 2 – Discord Mod Simulator"
date: "2026-04-21"
summary: "Core loop day: enemy spawning, server health, Ban Hammer, and a Rojo rabbit hole that ate an hour but made the whole setup bulletproof."
tags: ["roblox", "luau", "devlog", "rojo", "core-loop"]
image: "/images/posts/day-2-discord-mod-simulator.png"
---
Day 2 was supposed to be "add enemies and a ban hammer." It was that — plus a whole detour through how Rojo actually works. Came out the other side with a better setup than planned.

## ✅ What got done today

- Wrote all six Day 2 scripts from scratch: `Config`, `GameManager`, `EnemySpawner`, `RoundManager` (stub), `ClientMain`, and `BanHammerScript`
- Got enemies (red blocks, lovingly named `Troll`) spawning at `EnemyStart` every 3 seconds and walking toward `ServerZone`
- Server health ticks down when a Troll reaches the zone — `GameManager` owns all of that and fires events to the client
- Ban Hammer tool works — click near a Troll and it fires a server-validated event that destroys it. Server checks distance so you can't exploit it from across the map
- Health label on screen updates live as damage comes in, turns red on game over
- First successful full playtest: spawn → walk → damage → ban → game over 🎉

## 🔧 The Rojo Problem

Hit a wall early on: connected Rojo and my map was gone. Blank world.

Turns out `default.project.json` had `Workspace.Map` mapped to an empty folder in the repo. When Rojo connects, it forces Studio to match the filesystem — so an empty folder = empty map. Anything built by hand in Studio gets wiped.

The fix: pulled `Workspace` out of the Rojo tree entirely. Map geometry now lives in Studio only (two anchored parts, `EnemyStart` and `ServerZone`). Scripts, UI, and RemoteEvents all stay Rojo-managed so they can't be lost. Also had a script type mismatch — `GameManager` was named `.server.lua` (Script) but needed to be a plain `.lua` (ModuleScript) so `EnemySpawner` could `require()` it. Small thing, silent failure, took a minute to spot.

Net result: tighter Rojo setup than I would've had otherwise. Runtime objects like `Remotes` and the health UI now auto-generate from `.model.json` files — so if the place file ever disappears, reconnecting Rojo rebuilds almost everything automatically.

## 🧠 Biggest Takeaway

Rojo is powerful but it has opinions. If it "owns" a path and your filesystem is empty, it will clean up Studio to match. Know what Rojo controls and what stays in Studio — and keep them separate.

## 🔥 Plan for Day 2.1

- Add a second enemy type — fast but weak `Spammer` to go alongside the slow tanky `Troll` 👾
- Build out `RoundManager`: real wave system with difficulty scaling and a break between rounds
- Win condition — survive X waves

If Day 2 was "make it work," Day 2.1 is "make it actually feel like a game."
