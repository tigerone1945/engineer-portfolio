import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

export type ParsedMarkdown = {
  data: Record<string, unknown>;
  content: string;
};

export function parseMarkdown(raw: string, source: string): ParsedMarkdown {
  try {
    const { data, content } = matter(raw);
    return { data, content };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`${source}: invalid frontmatter (${reason})`);
  }
}

export async function markdownToHtml(markdown: string): Promise<string> {
  const file = await remark().use(html).process(markdown);
  return String(file);
}
