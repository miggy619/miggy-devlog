"use server";

import { Octokit } from "@octokit/rest";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/slugify";
import { passwordMatches } from "@/lib/admin-auth";

export type PostResult =
  | {
      ok: true;
      slug: string;
      commitUrl: string;
      commitSha: string;
    }
  | {
      ok: false;
      error: string;
    };

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_BODY_BYTES = 200 * 1024; // 200 KB

const MIME_TO_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

function buildFrontmatter(args: {
  title: string;
  date: string;
  summary: string;
  tags: string[];
  image?: string;
}): string {
  const lines = [
    "---",
    `title: ${JSON.stringify(args.title)}`,
    `date: ${JSON.stringify(args.date)}`,
    `summary: ${JSON.stringify(args.summary)}`,
  ];
  if (args.tags.length > 0) {
    lines.push(`tags: [${args.tags.map((t) => JSON.stringify(t)).join(", ")}]`);
  }
  if (args.image) {
    lines.push(`image: ${JSON.stringify(args.image)}`);
  }
  lines.push("---", "");
  return lines.join("\n");
}

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);
}

function isValidDate(d: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
  const parsed = new Date(`${d}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime());
}

export async function createPost(formData: FormData): Promise<PostResult> {
  try {
    // ── 1. Authenticate ──────────────────────────────────────────
    const password = String(formData.get("password") ?? "");
    if (!passwordMatches(password, process.env.POST_PASSWORD)) {
      return { ok: false, error: "Wrong password." };
    }

    // ── 2. Read required env ─────────────────────────────────────
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_REPO_OWNER;
    const repo = process.env.GITHUB_REPO_NAME;
    const branch = process.env.GITHUB_BRANCH ?? "main";

    if (!token || !owner || !repo) {
      return {
        ok: false,
        error: "Server misconfigured: missing GITHUB_TOKEN / GITHUB_REPO_OWNER / GITHUB_REPO_NAME.",
      };
    }

    // ── 3. Validate fields ───────────────────────────────────────
    const title = String(formData.get("title") ?? "").trim();
    const date = String(formData.get("date") ?? "").trim();
    const summary = String(formData.get("summary") ?? "").trim();
    const tagsRaw = String(formData.get("tags") ?? "");
    const body = String(formData.get("body") ?? "").trim();
    const image = formData.get("image");

    if (!title || title.length > 120) {
      return { ok: false, error: "Title required (max 120 chars)." };
    }
    if (!isValidDate(date)) {
      return { ok: false, error: "Date must be YYYY-MM-DD." };
    }
    if (!summary || summary.length > 400) {
      return { ok: false, error: "Summary required (max 400 chars)." };
    }
    if (!body) {
      return { ok: false, error: "Body required." };
    }
    if (body.length > MAX_BODY_BYTES) {
      return { ok: false, error: "Body too large (max 200 KB)." };
    }

    const tags = parseTags(tagsRaw);
    const slug = slugify(title);
    if (!slug) {
      return { ok: false, error: "Title produced an empty slug — use more letters/numbers." };
    }

    // ── 4. Prepare optional image ────────────────────────────────
    let imageBlob: { path: string; base64: string; webPath: string } | null = null;
    if (image instanceof File && image.size > 0) {
      if (image.size > MAX_IMAGE_BYTES) {
        return { ok: false, error: "Image too large (max 5 MB)." };
      }
      const ext = MIME_TO_EXT[image.type];
      if (!ext) {
        return { ok: false, error: `Unsupported image type: ${image.type}. Use png, jpg, webp, or gif.` };
      }
      const buf = Buffer.from(await image.arrayBuffer());
      imageBlob = {
        path: `public/images/posts/${slug}.${ext}`,
        base64: buf.toString("base64"),
        webPath: `/images/posts/${slug}.${ext}`,
      };
    }

    // ── 5. Build markdown ────────────────────────────────────────
    const frontmatter = buildFrontmatter({
      title,
      date,
      summary,
      tags,
      image: imageBlob?.webPath,
    });
    const markdown = frontmatter + body + "\n";
    const markdownPath = `content/posts/${slug}.md`;

    // ── 6. Commit via Octokit tree API (one atomic commit) ───────
    const octokit = new Octokit({ auth: token });

    // Check for slug collision
    try {
      await octokit.rest.repos.getContent({
        owner,
        repo,
        path: markdownPath,
        ref: branch,
      });
      return {
        ok: false,
        error: `A post already exists at ${markdownPath}. Change the title.`,
      };
    } catch (err) {
      const status = (err as { status?: number })?.status;
      if (status !== 404) throw err;
    }

    const { data: refData } = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`,
    });
    const baseSha = refData.object.sha;

    const { data: baseCommit } = await octokit.rest.git.getCommit({
      owner,
      repo,
      commit_sha: baseSha,
    });
    const baseTreeSha = baseCommit.tree.sha;

    const blobCalls = [
      octokit.rest.git.createBlob({
        owner,
        repo,
        content: markdown,
        encoding: "utf-8",
      }),
    ];
    if (imageBlob) {
      blobCalls.push(
        octokit.rest.git.createBlob({
          owner,
          repo,
          content: imageBlob.base64,
          encoding: "base64",
        }),
      );
    }
    const blobs = await Promise.all(blobCalls);

    const tree: {
      path: string;
      mode: "100644";
      type: "blob";
      sha: string;
    }[] = [
      {
        path: markdownPath,
        mode: "100644",
        type: "blob",
        sha: blobs[0].data.sha,
      },
    ];
    if (imageBlob) {
      tree.push({
        path: imageBlob.path,
        mode: "100644",
        type: "blob",
        sha: blobs[1].data.sha,
      });
    }

    const { data: newTree } = await octokit.rest.git.createTree({
      owner,
      repo,
      base_tree: baseTreeSha,
      tree,
    });

    const { data: newCommit } = await octokit.rest.git.createCommit({
      owner,
      repo,
      message: `post: ${title}`,
      tree: newTree.sha,
      parents: [baseSha],
    });

    await octokit.rest.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: newCommit.sha,
    });

    revalidatePath("/admin");
    revalidatePath("/posts");
    revalidatePath("/");

    return {
      ok: true,
      slug,
      commitSha: newCommit.sha,
      commitUrl: `https://github.com/${owner}/${repo}/commit/${newCommit.sha}`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: `Commit failed: ${message}` };
  }
}
