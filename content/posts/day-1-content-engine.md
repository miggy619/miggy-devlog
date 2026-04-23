---
title: "Day 1 – Content Engine"
date: "2026-04-23"
summary: "New project, new stack, new rule: three repos, three languages, zero imports between them. Day 1 of the content engine — Python, SQLite, a Click CLI, and a hard line drawn in the sand about how these projects are allowed to talk to each other."
tags: ["python", "content-engine", "devlog", "architecture", "multi-project", "day-1"]
---
New repo, day one. This one's not a game — it's the pipeline that'll eventually scrape sources, cluster what's worth writing about, and hand me drafts I can ship here. But before any of that matters, I had to answer a different question: how do three projects share a brain without turning into a tangled monorepo? 🧠

## ✅ What got done today

- **Repo scaffold.** New directory at `E:/Web Development/content-engine/`, git initialized, Python 3.13 virtualenv. Installed `praw`, `anthropic`, `click`, `sqlite-utils`, `httpx`, `python-dotenv`, `apscheduler`, `tweepy` — the whole "might need by Week 4" list, pinned upfront so future-me doesn't have to re-litigate dependencies mid-session.
- **Click CLI with four stubs.** `main.py` exposes `scrape`, `analyze`, `generate`, `query`. No implementations yet. The stubs reserve the command surface before I commit to the interface — easier to change a stub than to rename a command someone's already typing.
- **SQLite schema.** `db/schema.sql` with three tables: `raw_posts`, `patterns`, `generated_content`. One file of DDL, one SQLite database, zero ORMs. At 100k rows and one user, SQLite is the right answer and anything fancier is just a chore tax.
- **Token tracking, baked in on day one.** `patterns` and `generated_content` each carry `model_used`, `input_tokens`, `output_tokens`. Adding those columns to an empty table is free; backfilling them across thousands of rows later is a weekend I'd rather not spend.
- **Docs + env template.** `ROADMAP.md` (6-week plan), `CLAUDE.md` (session context so future Claude sessions don't regress on decisions), `.env.example` checked in, real `.env` gitignored. Three commits on `master`, all small.

Day 1 is load-bearing in exactly one way: the folder shape is locked before I write any real code.

## 🧠 Biggest Takeaway — three projects, one brain, and nothing imports each other

The thing I actually decided on Day 1 isn't in any of the files above. It's **the rule for how these three projects are allowed to talk to each other.**

Here's what's in flight right now:

| Project | Stack | What it does |
|---|---|---|
| `discord-mod-simulator` | Luau / Roblox | The wave-survival game currently in Phase 2 |
| `miggy-devlog` | Next.js 16 / React 19 | This blog — the public surface |
| `content-engine` | Python 3.13 / SQLite | Scrape, cluster, draft — feeds the blog |

There was a real temptation to reach for a monorepo here. One git root, shared tooling, a clean cross-package import when the engine wants to push a draft into the devlog. I killed that impulse in the first hour.

**The rule: integration is file-based, not import-based.**

- Engine → devlog is a **markdown file dropped into `content/drafts/`**. That's the entire interface. The devlog doesn't know Python exists.
- Game → devlog is **frontmatter references and screenshots** I drag in manually. The devlog doesn't know Luau exists either.
- Game → engine is **a string in a prompt** — "write about Discord Mod Simulator Day 4." The engine doesn't read the game's source or poke at its build.

The acid test I keep coming back to: **delete any one project's folder, and the other two still run.** That rules out shared packages, shared databases, shared deploy pipelines. Every cross-project handoff has to be a file on disk or a string in a prompt — which, conveniently, is the easiest thing to debug at 11pm.

A couple of second-order things falling out of this rule:

1. **Each project gets its own `DEVLOG-NOTES.md`.** Raw session notes, newest entry at the top, a "hooks for the post" list at the bottom. The devlog session reads that file as the source of truth. The projects don't import each other — they just _write the same shape of file_. (This post was drafted from exactly that file. The pipeline is already running, manually, on day one.)
2. **Three stacks is a feature, not a bug.** Luau is right for Roblox. Next.js is right for the public site. Python is right for scraping and the eventual ML work. Unifying those under one language would cost more than the integration ever will. Pick the right tool three times; connect them with filesystems.
3. **Claude Code sessions stay per-project.** One session per repo, each with its own `CLAUDE.md`. Context doesn't bleed. When I switch projects the model's working memory switches too, and the disk is the only place state lives between switches.

The whole architecture is one long bet that _the filesystem is a good enough message bus for a team of one_. Day 1 is me writing that bet down.

## 🔥 Plan for Day 2

One job: the Reddit scraper.

- Wire `scrape` (currently a stub) to pull from a hard-coded list of subreddits via `praw`.
- Insert into `raw_posts` with `source_platform = 'reddit'`, dedupe on external ID.
- No AI, no pattern analysis, no formatting. Just: "posts arrive on disk, clean, queryable via `query`."
- Need Reddit API creds first — `reddit.com/prefs/apps`, "script" app type, five minutes.

After Reddit, one scraper per source until the raw table is fed. The fun stuff — pattern clustering, draft generation — is Week 3. First I need something to cluster.

Three projects, one brain, zero tangled imports. Week 1 of six. 🧪
