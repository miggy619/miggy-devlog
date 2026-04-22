---
title: "Day 2.2 – Discord Mod Simulator"
date: "2026-04-21"
summary: "Added currency, a bottom-of-screen shop button, and the first real upgrade. Every ban now earns coins, and those coins make the next ban faster — the feedback loop finally closes."
tags: ["roblox", "luau", "devlog", "currency", "upgrades", "ui"]
---
Day 2 cont was when the game started bribing me to keep playing. Until now, banning enemies was _satisfying but pointless_ — nothing carried between waves. Add a coin counter and suddenly every Spammer dodging past me is dollar signs walking away. 💰

## ✅ What got done today

- Coins are awarded on every successful ban — 10 for Trolls, 20 for Spammers. The reward lives on the enemy part as a `Reward` attribute, so new enemy types just declare their bounty when they spawn.
- Coins and upgrade levels live as **Player attributes** (`Coins`, `CooldownLevel`, `BanCooldown`). Roblox replicates attributes to the client automatically, so the UI can listen with `GetAttributeChangedSignal("Coins")` instead of wiring another RemoteEvent. One less remote, one less source of desync.
- Built `CurrencyManager` as a ModuleScript in `Systems/`. It owns the "who has how much of what" state, exposes `AddCoins` and `TryPurchaseCooldown`, and connects `PurchaseUpgrade.OnServerEvent` when it's required. `EnemySpawner` calls `AddCoins` after validating a ban.
- Server-authoritative cooldown. Client BanHammer reads `player:GetAttribute("BanCooldown")` for instant feel, but the server enforces the real cooldown against the same attribute. Buying the upgrade only has to mutate one number — both sides pick up the change.
- First upgrade: **Faster Ban Hammer**. 3 levels, costs scale 50 → 100 → 150, each level shaves 0.1s off the cooldown (floor at 0.1s). Level 3 hits `Ban Hammer: MAXED` and the button stops responding.
- UI layout polish — coins top-left in gold, health top-center, upgrade button top-right. Originally had the shop at the bottom center and it kept getting occluded by the player's own character. Moving it to the top-right corner (anchored to `{1, 0}`) fixed it in thirty seconds. `AnchorPoint` is underrated.
- Dropped `UIPadding` + `UICorner` children onto both new elements. Rounded corners, a bit of breathing room inside the coin box, and suddenly the UI looks like someone actually designed it.

## 🧠 Biggest Takeaway

Player attributes replace a _lot_ of RemoteEvent plumbing. Anything that's "per-player state the client needs to render" — coins, upgrade levels, cooldowns, selected tool, buffs — can be an attribute. The client listens to `GetAttributeChangedSignal`, and server mutations automatically propagate. I almost built a full `CurrencyChanged` RemoteEvent before noticing this. Would've been pointless wiring.

Also: Rojo's `.model.json` creates GUI elements with **zero** default size and no positioning. Every new UI piece needs a manual styling pass in Studio (Size, Position, AnchorPoint, colors, Font, TextSize). It's annoying the first time but it forces you to actually think about layout instead of accepting Roblox's defaults. I've started treating `.model.json` as _"create the object, I'll style it in Studio"_ and the workflow feels clean.

## 🔥 Plan for Day 2.5

Close out Phase 1. The game has waves, losing, and progression — but it has no ending.

- Win condition — beat wave 5 and the game declares victory 🏆
- Visible wave counter + break countdown ("Wave 3 / 5", "Next wave in 5…")
- Bigger, clearer end-game states — VICTORY and SERVER DEAD both get their own treatment

Finish the "wave survived" loop and Phase 1 is officially done.
