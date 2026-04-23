---
title: "Day 2 – Content Engine"
date: "2026-04-23"
summary: "Reddit scraper plus a ~50-line SQLite layer. The interesting part isn't the scraper — it's that dedup is one SQL keyword, not a loop."
tags: ["python", "content-engine", "devlog", "sqlite", "scraping", "day-2"]
---
Day 2 and the pipeline has its first real data path: a Reddit scraper writing into a SQLite table. No AI yet. No analysis. Just posts arriving on disk, indexed, deduped, queryable. The only genuinely _interesting_ line of code I wrote today is one that isn't there. 🗃️

## ✅ What got done today

- **`db/database.py`** — raw `sqlite3`, ~50 lines. `init_db()`, `insert_post()`, `get_posts()`. `sqlite3.Row` factory so results come back dict-shaped. One module, one concern, zero abstractions between the code and the SQL.
- **`scrapers/reddit.py`** — `fetch_top_posts(subreddit, limit=25, time_filter="day")` using PRAW in read-only mode. Returns `list[dict]` pre-shaped to the `raw_posts` schema — no transformation layer between scraper output and DB input.
- **`scrape` command wired.** `main.py` calls `init_db()` first, then dispatches per `--source`. Imports for each scraper live inside the command body (more on that below). Prints `scraped N, M new rows` so dedup behavior is visible in stdout on every run.
- **DB auto-initializes on first scrape.** `content.db` (24 KB) appears at repo root, all three tables match the schema I committed on Day 1. Zero manual migration step for a fresh clone.
- **End-to-end smoke test works without creds.** `python main.py scrape --source all --limit 5` runs clean — skips Reddit with a clear message, echoes stubs for YouTube/TikTok, initializes the DB. A broken scraper doesn't take down the CLI.

## 🧠 Biggest Takeaway — `INSERT OR IGNORE` is a dedup strategy

Every scraper writes to a table that _will_ see the same row twice. The same post surfaces on today's top and tomorrow's hot. The same video ID comes back on the next poll. Dedup isn't optional.

The naive version is a three-step dance:

```python
row = db.execute(
    "SELECT id FROM raw_posts WHERE source=? AND external_id=?",
    (source, external_id),
).fetchone()
if not row:
    db.execute("INSERT INTO raw_posts ...", ...)
```

Two round-trips. One race condition. A bunch of Python flow control that exists only to say "skip the duplicate."

The real version is one line:

```python
db.execute("INSERT OR IGNORE INTO raw_posts ...", ...)
```

…combined with `UNIQUE(source, external_id)` in the schema. SQLite silently discards the second insert when the constraint would fail. One round-trip, no race, no `if`. **The dedup logic lives in the schema where it belongs**, not scattered across every caller that happens to be writing to that table.

Three other quiet decisions worth naming:

1. **Raw `sqlite3`, not an ORM or `sqlite-utils`.** `sqlite-utils` is installed — I'll probably use it from the CLI for ad-hoc queries — but the whole DB module fits in 50 lines of stdlib. Pulling in a library so I can write `db.table("raw_posts").insert(...)` instead of the SQL is abstraction for its own sake. The SQL _is_ the point; the SQL should be on the page.
2. **Late-binding scraper imports.** `from scrapers.reddit import fetch_top_posts` lives _inside_ the `scrape` command function, not at module top. So `python main.py --help` doesn't pay the PRAW import cost, and a broken Reddit client doesn't take down `query` or `generate`. The CLI's blast radius is one command at a time, not one module.
3. **Two meanings for the same missing flag.** `--source reddit` without `--subreddit` is an error; `--source all` without `--subreddit` is a skip. Same missing input, two branches. Asking for Reddit specifically without saying where is user error — fail loud. Asking for everything that's configured is best-effort — skip what isn't wired up and echo what happened. The CLI tells you which branch fired so you know which kind of "nothing happened" you got.

## 🔥 Plan for Day 3

Two things, both short:

- **Reddit creds + first real run.** `reddit.com/prefs/apps` → script app → paste into `.env`. Then `python main.py scrape --source reddit --subreddit gamedev --limit 25` and confirm rows actually land.
- **Wire up `query`.** It's a stub right now. Simple version: `query --source reddit --since 1d` prints the last day's rows as a table. Enough for me to eyeball what the scraper caught and decide if the schema needs adjusting before I add YouTube.

YouTube slides to Days 4–5. First I want one platform feeding real rows into the DB so I can see the shape of "raw content" before committing to a second shape.

Day 2 and the pipeline has data. Not _useful_ data yet. But data. 🧪
