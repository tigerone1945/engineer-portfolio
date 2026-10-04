import { readFile } from "node:fs/promises";
import path from "node:path";
import { markdownToHtml, parseMarkdown } from "./markdown";

const DEFAULT_FILE = path.join(process.cwd(), "content", "profile", "about.md");

export async function getAboutHtml(file = DEFAULT_FILE): Promise<string> {
  let raw: string;
  try {
    raw = await readFile(file, "utf8");
  } catch (error) {
    throw new Error(`Cannot read profile file ${file}`, { cause: error });
  }
  return markdownToHtml(parseMarkdown(raw, path.basename(file)).content);
}
