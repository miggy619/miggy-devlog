---
title: "Day 7 – Server Mod Simulator (LAUNCHED)"
date: "2026-05-03"
summary: "30-day Roblox plan, shipped in 14 calendar days. The game is live. Phase 6 launch closed in one push: icon, thumbnail, description in 'ban' language, hashtags picked, the all-ages publishing tier unlocked, public privacy flipped on, soft launch + public posts went live. Also renamed mid-launch from 'Discord Mod Simulator' → 'Server Mod Simulator' to dodge a trademark — caught it before publish, not after."
tags: ["roblox", "luau", "devlog", "phase-6", "launch", "milestone"]
---
The game shipped. **Server Mod Simulator** is live on Roblox at [roblox.com/share?code=6b575d753764f741a2a25711acdc3a7b](https://www.roblox.com/share?code=6b575d753764f741a2a25711acdc3a7b). 30-day plan, closed in 14 calendar days from project scaffold to public release. Phase 6 (Days 28–30) compressed into one push — icon, thumbnail, description, hashtags, public privacy flip, soft launch, public posts. Project complete. 🚀

## 🏷️ The rename

Quick naming note before anything else, since the post title changed: the project was called **Discord Mod Simulator** through Day 6. During Phase 6 prep today I renamed the public-facing game to **Server Mod Simulator**. The trademark math was unambiguous — Discord Inc. holds "Discord" as a US trademark, Roblox moderation reliably flags trademark-borrowing names from first-time publishers, and a takedown notice (or a forced rename mid-launch with the URL already shared with players) is exactly the kind of self-inflicted launch-week disaster that a 5-minute name swap avoids.

The repo, project folder, and all internal naming stay `discord-mod-simulator`. Nothing about the game changed — the in-game premise has always been "moderate a chat server," and the new name just matches that abstraction directly. The only public-facing change is the Roblox listing title, the icon text, and the in-app branding strings. No `#discord` hashtag in the launch post either, same trademark reasoning + the side benefit that our `#servermodsimulator` branded tag won't be drowned in noise from Discord Inc.'s actual content.

The lesson, before I bury it: **trademark check belongs in Phase 1, not Phase 6.** I caught this early enough that nothing broke, but I caught it the same day I was uploading the Roblox icon. Two extra weeks to live with the wrong name internally is a cost; a takedown notice the week of launch is a much bigger one. Search the trademark database the same week you commit to a project name. Five minutes of due diligence at scaffold time saves a week of crisis later.

## ✅ Phase 6 — what shipped today

- **Icon (512×512 PNG).** Brand-yellow ban hammer center frame, electric energy lines, 4 visible enemies (Troll, Spammer, Karen, Furry) silhouetted at the bottom edge, scattered coins for "this is a coin-economy game" recognition. Roblox icon UX is brutal — small, stationary, surrounded by competition; high-contrast iconography wins.
- **Thumbnail (1920×1080 cinematic).** Player Mod with hood + headphones holding the Mute Gun mid-shot. All 4 tools labeled along the bottom edge. Troll + Karen enemies framing left and right. Hook copy: *"DEFEND THE SERVER. SURVIVE 5 WAVES!"* Thumbnails do the storefront's heavy lifting; the icon gets the click, the thumbnail closes the install.
- **Description rewritten in "ban" language.** No "kill" anywhere — every action verb is "ban," "mute," "timeout," "kick." This is a kid-audience Roblox game; Roblox moderation is strict on violence-coded language for the under-13 publishing tier; "ban" reads as moderation flavor, not violence. Same gameplay, different vocabulary. The whole game's premise made this easy because the verbs were already correct in code.
- **Hashtags picked.** 7 in-game (`#robloxgame #robloxdev #simulator #towerdefense #servermodsimulator #moderator #banhammer`). 15 for TikTok/social. The `#servermodsimulator` branded tag exists primarily to give the eventual short-form clip rotation (Content Engine work, building separately) a clean place to land.
- **All-ages publishing tier unlocked.** ID verification + age check + 2-step auth + Premium subscription, ~10 minutes via Roblox's eligibility flow. First-time publisher → all-ages in one sitting.
- **Public privacy flipped on, then posts went live.** Public flag flipped *first*, then the share URL got distributed. The reverse order is a conversion killer: kids click a Friends-only link, hit "you don't have access," and leave. Order matters.
- **Soft launch to friends → public release.** Same calendar day, by design — Phase 6 collapsed Days 28 / 29 / 30 because the work in each was small and the unblocking sequence was strictly linear.

## 🧠 Biggest Takeaway — 30 days, shipped in 14

Project start: 2026-04-20 (Day 1, Rojo scaffold). Public release: 2026-05-03 (today). Calendar days elapsed: **14**. The plan called for 30. That's roughly 53% schedule compression.

Where the time went:

| Phase | Plan days | Calendar days | Compression |
|---|---|---|---|
| Phase 1 — Core loop | 5 | 5 | 1× |
| Phase 2 — Game feel | 7 | 7 | 1× |
| Phase 3 — Retention | 6 | 1 | **6×** |
| Phase 4 — Monetization | 4 | 1 | **4×** |
| Phase 5 — Polish + viral | 5 | 1 | **5×** |
| Phase 6 — Launch | 3 | 1 | **3×** |
| Total | 30 | 14 | 2.1× overall |

Phases 1 and 2 ran 1:1 with the plan. Those are the phases where the work is *deciding what the game is* — every system from scratch, every game-feel beat needing playtesting between iterations. You can't compress "is this satisfying yet" by batching it.

Phases 3–6 collapsed because the design space was already mapped out. The yesterday post on Day 6 went deep on the autonomous-batch pattern that did the compressing — one Q&A session per phase up front to lock all defaults, then continuous code with commits per planned day, then a structured close-out devlog. Phase 6 was the same shape applied to the launch checklist itself — every Phase 6 question (icon style, thumbnail composition, description voice, hashtag picks, social-ad spend or no, public-flip order) got pitched and decided in batch, then executed in one push.

The transferable observation: **schedule compression isn't uniform across a project.** The "build the foundation" work and the "tune the feel" work want time and back-and-forth; they don't compress. The "execute against a clear spec" work and the "tick the launch checklist" work compress dramatically when you front-load the design conversation. A 30-day plan that compresses to 14 days isn't 14 days of magic — it's 12 days of normal work in Phases 1–2 plus 2 days of compressed execution in Phases 3–6.

The other thing this answers: *should you bother writing a 30-day plan if the actual schedule will be 14?* Yes — overwhelmingly yes. The plan is what made the back-half compression possible. Without 30 days of pre-mapped scope, the autonomous batches would have had nothing to execute *against*; they'd have been "just build something next" instead of "execute Days 13–18 of the persistence + retention plan." The plan's value isn't its accuracy as a schedule — it's its function as a decision substrate for fast execution later.

## 🔢 The whole project, by the numbers

- **14 calendar days** start to launch. **51 commits** to `main`, all pushed.
- **5 schema versions** (v1 → v5) with full migration chain in PersistenceManager. Zero saves lost across 4 schema bumps.
- **4 tools** (Ban / Mute / Timeout / Kick), **7 enemy types** (Troll / Spammer / Teleporter / Splitter / SplitterChild / Karen / Furry / Discord Mod — yes Discord Mod the *enemy* stays, that's a different trademark calculation), **3 wave modifiers** (Spam Storm / Toxic Wave / Splitter Surge).
- **3 gamepasses** + **4 dev products** live on Roblox, all wired into game code.
- **3 device classes** supported (Computer + Tablet + Phone) with explicit per-element layout overrides for touch.
- **First-time Roblox publisher → all-ages publishing tier:** ~10 min for ID + age + 2-step + Premium subscription.

## 🔥 What's next — the post-launch soak

- **One-week soak window.** No breaking changes for the first 7 days. Let the game settle. Watch the metrics. Don't iterate on guesses.
- **First-week metrics watch.** Active players, average session length, gamepass conversion rate, where players drop off, any exploits surfacing, whether touch UX holds up at scale (only one device tested before launch).
- **Player-feedback-driven iteration.** Pull from the §9 backlog (Mute Gun aim tuning, per-element responsive layout, in-game settings menu, hover tooltips, ambient sound) based on what real players actually complain about — not internal guesses about what's important.
- **Monetization rebalance, if needed.** Coin Pack pricing, gamepass effect strength, unlock cost curve — all currently educated guesses. Real conversion data will inform tuning.

The 30-day plan is closed. The game is live. **Project complete.** ⚒️

If you play it, be a Mod. ✦
