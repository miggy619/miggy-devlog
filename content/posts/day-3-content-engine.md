---
title: "Day 3 – Content Engine"
date: "2026-04-24"
summary: "Reddit's Responsible Builder Policy gates self-serve API access behind a manual review now. Pivoted in one session — dropped PRAW, swapped in public JSON endpoints, and kept the function signature identical so nothing downstream changed."
tags: ["python", "content-engine", "devlog", "reddit", "scraping", "day-3"]
---
Day 3 was supposed to be: paste the Reddit API creds into `.env`, run the scraper, watch rows land. Reddit had other plans. The OAuth path I'd designed against on Day 2 quietly stopped being self-serve sometime in the last few months — creating a new "script" app now triggers a developer-profile-and-scope-review flow that takes days-to-weeks for uncertain approval. I had a working scraper in 90 minutes that doesn't touch OAuth at all. 🚪

## ✅ What got done today

- **Rewrote `scrapers/reddit.py`** — PRAW + OAuth replaced with `httpx.get` against `https://www.reddit.com/r/<sub>/top.json`. Same function signature, same return shape, same caller. The DB layer and `main.py` didn't change a line.
- **Removed `praw`, `prawcore`, `update_checker`** from the venv and re-pinned `requirements.txt`. One fewer dependency cluster, no half-functional fallback path lying around.
- **Cleaned the env templates** — dropped `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET` from `.env` and `.env.example`. `REDDIT_USER_AGENT` got promoted to a comment block flagging it as load-bearing, not boilerplate.
- **Set `REDDIT_USER_AGENT = "content-engine/0.1 by u/miggydev"`.** Reddit blocks default `python-httpx/X.Y.Z` UAs within seconds of first request — the User-Agent string is the actual auth substitute on the public endpoint.
- **Live-verified end-to-end.** `python main.py scrape --source reddit --subreddit gamedev --limit 25` landed 25 rows in `content.db`. Re-ran immediately — 0 new rows. Dedup confirmed against the `UNIQUE(source, external_id)` constraint with real Reddit data, not just import tests.

## 🧠 Biggest Takeaway — Reddit closed the API door so I went through the window

Reddit's Responsible Builder Policy is the new bottleneck for personal-scale scrapers. Creating a self-serve "script" app the way the docs still describe? That route is gated behind a developer profile and a scope-review flow — days-to-weeks for uncertain approval. For a project that wants to read the top 25 posts off `/r/gamedev` once a day, that's a ridiculous amount of paperwork.

But Reddit's public JSON endpoints — the ones every browser hits when you scroll the site — are still wide open. Append `.json` to any subreddit URL and you get the same data, structured the same way, no auth headers required. There's a soft rate limit (~60 req/min unauth, plenty for daily personal scale) and one sharp edge: **the User-Agent header is doing real work.**

```python
# This will get blocked within seconds:
httpx.get("https://www.reddit.com/r/gamedev/top.json")

# This works indefinitely:
httpx.get(
    "https://www.reddit.com/r/gamedev/top.json",
    headers={"User-Agent": "content-engine/0.1 by u/miggydev"},
)
```

That's it. That's the whole "auth" story for read-only public Reddit data. Most devs treat `User-Agent` as cosmetic; on this endpoint it's the difference between "works forever" and "blocked in 30 seconds."

Three other quiet decisions worth naming:

1. **Function signature stayed identical.** `fetch_top_posts(subreddit, limit, time_filter) -> list[dict]` — same name, same args, same return shape, even down to the dict keys mapping straight into the `raw_posts` schema. The caller in `main.py` and the storage in `db/database.py` didn't change a line. Single-file pivot, zero blast radius. Rejected: introducing a `RedditClient` abstraction "to make swapping easier next time." It was already easy precisely because the original was small.
2. **Removed PRAW outright; no fallback path.** Two implementations of the same function diverge subtly over time and double the maintenance. If the JSON path breaks I'll know within a day and pivot then — same way I just pivoted off PRAW.
3. **`miggydev` is the canonical handle now.** Shows up in the User-Agent, will show up in blog frontmatter `author` fields and Reddit citations and the eventual auto-poster. Single canonical name across platforms simplifies attribution and audience search. Verified available on YouTube / TikTok / Apify; reserved variants for the few platforms where it isn't.

## 🔥 Plan for Day 4

Two things, both short:

- **Wire up `query`.** Currently a stub. Simple version: `query --source reddit --since 1d` prints recent rows as a table. I want to eyeball what landed before adding YouTube — the schema might need adjusting once I see real bodies and not just import tests.
- **Write the README.** Deferred from Day 2 because there was barely anything to document. Now there's a working scraper and a non-obvious User-Agent gotcha to flag.

YouTube slides to Day 5. One source live with real data was the milestone today; the next one waits for me to actually look at what Reddit gave me.

One source live, dedup confirmed, dependencies trimmed. Week 1, Day 3. 🧪
