import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

const planPath = path.join(process.cwd(), "content/plan.md");

export type PlanMeta = {
  title: string;
  lastUpdated: string;
  nextReview: string;
  quitTrigger: string;
  runwayTarget: string;
  bet?: string;
};

export type HorizonSection = {
  slug: string;
  title: string;
  total: number;
  done: number;
  contentHtml: string;
};

export type PlanData = {
  meta: PlanMeta;
  sections: HorizonSection[];
  activeHorizon: string | null;
  reviewWarning: "overdue" | "due" | null;
};

type MdNode = {
  type: string;
  depth?: number;
  checked?: boolean | null;
  children?: MdNode[];
  value?: string;
};

function nodeToText(node: MdNode): string {
  if (typeof node.value === "string") return node.value;
  if (node.children) return node.children.map(nodeToText).join("");
  return "";
}

function slugFromHorizonTitle(title: string): string {
  const m = title.match(/(\d+)-Month/i);
  if (m) return m[1];
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function countTasksByHorizon(nodes: MdNode[]): { total: number; done: number } {
  let total = 0;
  let done = 0;
  const walk = (n: MdNode) => {
    if (n.type === "listItem" && typeof n.checked === "boolean") {
      total++;
      if (n.checked) done++;
    }
    if (n.children) n.children.forEach(walk);
  };
  nodes.forEach(walk);
  return { total, done };
}

function monthsBetween(from: Date, to: Date): number {
  return (
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth())
  );
}

function getActiveHorizon(lastUpdated: string, today: Date): string | null {
  const start = new Date(lastUpdated);
  const months = monthsBetween(start, today);
  if (months < 0) return "3";
  if (months < 3) return "3";
  if (months < 6) return "6";
  if (months < 12) return "12";
  return null;
}

function getReviewWarning(
  nextReview: string,
  lastUpdated: string,
  today: Date,
): "overdue" | "due" | null {
  const lastUpdatedDate = new Date(lastUpdated);
  const twelveMonthMark = new Date(lastUpdatedDate);
  twelveMonthMark.setMonth(twelveMonthMark.getMonth() + 12);
  if (today > twelveMonthMark) return "overdue";

  const nextReviewDate = new Date(nextReview);
  if (today > nextReviewDate) return "due";

  return null;
}

export async function getPlan(): Promise<PlanData> {
  const file = fs.readFileSync(planPath, "utf8");
  const { data, content } = matter(file);
  const meta = data as PlanMeta;

  const processor = remark().use(remarkGfm).use(remarkHtml);
  const tree = processor.parse(content) as unknown as { children: MdNode[] };

  type Group = { title: string; slug: string; nodes: MdNode[] };
  const groups: Group[] = [];
  let current: Group | null = null;

  for (const node of tree.children) {
    if (node.type === "heading" && node.depth === 2) {
      const title = nodeToText(node);
      const slug = slugFromHorizonTitle(title);
      current = { title, slug, nodes: [] };
      groups.push(current);
    } else if (current) {
      current.nodes.push(node);
    }
  }

  const sections: HorizonSection[] = [];
  for (const g of groups) {
    const counts = countTasksByHorizon(g.nodes);
    const subTree = { type: "root", children: g.nodes };
    // unified's runtime types are looser than its declared types here;
    // run() actually returns the same Root shape stringify() expects.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformed = (await processor.run(subTree as any)) as any;
    const contentHtml = String(processor.stringify(transformed));
    sections.push({
      slug: g.slug,
      title: g.title,
      total: counts.total,
      done: counts.done,
      contentHtml,
    });
  }

  const today = new Date();
  return {
    meta,
    sections,
    activeHorizon: getActiveHorizon(meta.lastUpdated, today),
    reviewWarning: getReviewWarning(meta.nextReview, meta.lastUpdated, today),
  };
}
