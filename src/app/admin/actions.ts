"use server";

import { Octokit } from "@octokit/rest";
import { Buffer } from "node:buffer";
import matter from "gray-matter";
import { revalidatePath } from "next/cache";
import { passwordMatches } from "@/lib/admin-auth";

export type DeleteResult =
  | { ok: true; slug: string; commitUrl: string; commitSha: string }
  | { ok: false; error: string };

export async function deletePost(formData: FormData): Promise<DeleteResult> {
  try {
    const password = String(formData.get("password") ?? "");
    if (!passwordMatches(password, process.env.POST_PASSWORD)) {
      return { ok: false, error: "Wrong password." };
    }

    const slug = String(formData.get("slug") ?? "").trim();
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      return { ok: false, error: "Invalid slug." };
    }

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_REPO_OWNER;
    const repo = process.env.GITHUB_REPO_NAME;
    const branch = process.env.GITHUB_BRANCH ?? "main";
    if (!token || !owner || !repo) {
      return {
        ok: false,
        error:
          "Server misconfigured: missing GITHUB_TOKEN / GITHUB_REPO_OWNER / GITHUB_REPO_NAME.",
      };
    }

    const octokit = new Octokit({ auth: token });
    const markdownPath = `content/posts/${slug}.md`;

    // 1. Read the current markdown to find the cover image path (if any)
    let imagePath: string | null = null;
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: markdownPath,
        ref: branch,
      });
      if (Array.isArray(data) || !("content" in data)) {
        return { ok: false, error: "Unexpected content at post path." };
      }
      const md = Buffer.from(data.content, "base64").toString("utf-8");
      const parsed = matter(md);
      const image = (parsed.data as { image?: string }).image;
      if (image && image.startsWith("/")) {
        imagePath = `public${image}`;
      }
    } catch (err) {
      const status = (err as { status?: number })?.status;
      if (status === 404) return { ok: false, error: "Post not found." };
      throw err;
    }

    // 2. Atomic tree commit that deletes both files
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

    const tree: {
      path: string;
      mode: "100644";
      type: "blob";
      sha: string | null;
    }[] = [
      { path: markdownPath, mode: "100644", type: "blob", sha: null },
    ];
    if (imagePath) {
      tree.push({ path: imagePath, mode: "100644", type: "blob", sha: null });
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
      message: `chore: delete post ${slug}`,
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
    revalidatePath(`/posts/${slug}`);

    return {
      ok: true,
      slug,
      commitSha: newCommit.sha,
      commitUrl: `https://github.com/${owner}/${repo}/commit/${newCommit.sha}`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: `Delete failed: ${message}` };
  }
}
