---
title: "Day 1.5 – The blog was broken, so I fixed the blog"
date: "2026-04-21"
summary: "Small detour from the game. Turns out my \"modern\" dev blog was rendering with zero Tailwind utilities because of a v4/v3 mismatch. Rebuilt it on Tailwind v4 + shadcn and added a one-click posting flow so I stop editing markdown files by hand."
tags: ["devlog", "nextjs", "tailwind", "shadcn"]
image: "/images/posts/day-1-5-the-blog-was-broken-so-i-fixed-the-blog.png"
---
Plan for today was enemy spawning. Plan got hijacked.

  I kept shipping "polish" passes on the blog and the screenshots kept looking like WordPress in 2007. I blamed myself. Turns out the build was the saboteur.

  ## 🕵️  The bug

  The project is on Tailwind CSS **v4**, but `globals.css` was using **v3 syntax**:

  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  v4 silently ignores those. Zero utility classes were generated. Every flex, grid, bg-zinc-950, rounded-xl in the entire app did nothing. The only things that were actually styling anything were my custom CSS classes (.gradient-text, .card-glow) and inline style={{ }} props. That's why
  "Miggy" looked gradient-y but the layout looked like 2007 WordPress.

  The fix is one line:

  @import "tailwindcss";

  One line. Half a day of confusion.

  ✅ What got done today

  - Ripped out the broken v3 config, migrated everything to v4
  - Dropped next-themes + the typography plugin → committed to dark-only
  - Installed shadcn/ui primitives (Button, Card, Badge, Container, etc.) so future pages don't get invented from scratch each time
  - Rebuilt the homepage as a "Dev HUD" — cursor-follow glow, animated gradient-border feature card with corner brackets, stats strip, progress bar
  - Shipped /admin/new — password-protected form that commits markdown straight to the repo via the GitHub API. Vercel picks up the push and redeploys.

  🧠 Biggest takeaway

  Silent pipeline failures are the worst kind. Lint passed. Build passed. Deployment succeeded. Nothing on the surface said "your styles are dead on arrival." I had to notice the output didn't match my intent and go spelunking. Lesson: when a tool updates a major version, re-read the migration
   docs before assuming muscle memory works.

  Also: build a design system first. I was piling on gradient-text and glow effects trying to compensate for a foundation that wasn't rendering. Fancy doesn't fix broken.

  🔥 Back to Day 2 tomorrow

  - Enemy spawning 👾
  - Ban Hammer tool 🔨
  - Server health + win/lose ❤️ 

  This post itself is the first one made via the new /admin/new endpoint. If you're reading this, it worked.
