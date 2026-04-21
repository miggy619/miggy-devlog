import { remark } from "remark";
import html from "remark-html";

export async function renderMarkdown(md: string): Promise<string> {
  const result = await remark().use(html).process(md);
  return result.toString();
}
