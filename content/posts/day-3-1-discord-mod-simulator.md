---
title: "Day 3.1 – Discord Mod Simulator"
date: "2026-04-23"
summary: "Three more effects landed — hit flash, camera shake, swing animation — and a visible 3D hammer showed up with them. The rule that held it all together: swings are feedback, shakes are impact, and the two never overlap."
tags: ["roblox", "luau", "devlog", "game-feel", "phase-2", "camera"]
---
Day 3 landed the ban aftermath — particles, popup, sound. Day 3.1 is the _moment of impact_. The three effects I promised yesterday all shipped, and a fourth one tagged along for the ride: the Ban Hammer is finally visible in your character's hand. 🔨

## ✅ What got done today

- **Hit flash 💥** — new `Effects.HitFlash(part)` on the enemy, fired _before_ the particle burst. Flips `IsEnemy` off, anchors the part, swaps Material to `Neon`, kills its `BodyVelocity`, `Debris:AddItem` at 0.15s. The frame sequence is now **flash → particles → popup → gone** — readable in exactly that order.
- **Camera shake 📷** — client-side in `BanHammerScript.client.lua`. `RunService.RenderStepped` drives `Humanoid.CameraOffset` with a 0.18s falloff, magnitude 0.35, debounced with a `shakeActive` flag so rapid bans don't stack. Only fires when a target is actually hit.
- **Swing animation 🔨** — `Humanoid:FindFirstChildOfClass("Animator"):LoadAnimation(anim)` on `Tool.Equipped`, destroyed on `Unequipped`, `AnimationPriority.Action`. Plays on _every_ `Activated`, including whiffs. Asset ID pulled from the Toolbox, speed tuned via `Config.BAN_SWING_SPEED = 1.5`.
- **Visible 3D hammer.** The one I aborted on Day 2.5 is here. `Handle.model.json` (wood shaft, dark brown) + `Head.model.json` (metal, red, `Massless = true`) + a `WeldConstraint` set up in `BanHammerSetup.server.lua`. `init.meta.json` flipped `RequiresHandle` to `true`. Total code: two Part definitions and a weld.
- **Rojo gotcha fixed.** Rojo 7.6 refuses `"BrickColor": "Really black"` in a Part's `.model.json` — `Wrong type of value for property Part.BrickColor. Expected BrickColor, got a string.` Switched to `"Color": [0.12, 0.08, 0.05]` (Color3 array, 0–1 floats). New rule: default to `Color` + Color3 in `.model.json`, skip BrickColor strings entirely.

## 🧠 Biggest Takeaway — the swing is feedback, the shake is impact

Three effects, three gating rules, all different. That's the thing worth writing down.

- The **swing** plays on every `Activated` — hit or miss. It's player-side feedback; your character did a thing. Gating it behind "hit a target" means whiffs feel dead and the tool stops _being_ a tool. The animation has to play whether or not you connect.
- The **shake** only fires on hits. It's impact feedback — the world reacting back at you. Shaking on whiffs would be a lie. You didn't hit anything; the camera shouldn't tell you otherwise.
- The **hit flash** is strictly enemy-side. It's telling you "_that_ part, right there, is the one you banned." Flashing the wrong part or not flashing at all breaks the readability of chained bans.

Same session, same tool, three different firing rules. Conflate them and every ban feels off by a half-second in some direction you can't name.

Two other small things that mattered more than they look:

1. **`Humanoid.CameraOffset` beats direct `camera.CFrame` writes.** First draft tweened the CFrame. That fights Roblox's built-in camera controller — follow cam, zoom, first/third-person toggles — and the shake either gets overwritten or accumulates depending on which branch wins the frame. `CameraOffset` is additive, the controller respects it, zero integration work. One property, no edge cases.
2. **Camera shake is client-local, not server-broadcast.** If I fired shake from the server, every client would shake on every _other_ player's ban. Shake belongs to the _banning_ player's camera, and that's exactly one camera. Multiplayer footgun avoided before it shipped.

## 🔥 Plan for Day 4

Enough polish. Back to systems — the Ban Hammer has had a monopoly on gameplay and that's about to end.

- **Mute Gun 🔇** — ranged, slows an enemy to 0.5× for a few seconds. New Tool, new `Effects.MuteEffect`, same module pattern as Day 3.
- **Timeout ⏱️** — freezes one enemy in place for ~3s. Pure crowd control.
- **Kick 👢** — pushback cone. AoE, shorter cooldown than Ban, no kill.

Real question for Day 4 is whether three new tools each get their own hotbar slot, or whether I build a "loadout" system first. Probably loadout — four Tools in a player's inventory is where hotkeys start mattering.

Phase 2 keeps shipping. The game finally _feels_ like something. ⚒️
