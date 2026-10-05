import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { Article, ArticlePlatform } from "@/types/article";
import { parseMarkdown } from "./markdown";

const DEFAULT_DIR = path.join(process.cwd(), "content", "articles");
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// An article must live on the platform it claims, so a copy-paste slip
// cannot publish a link to somewhere else.
const PLATFORM_HOSTS: Record<ArticlePlatform, string> = {
  zenn: "zenn.dev",
  note: "note.com",
};

function requireString(data: Record<string, unknown>, field: string, source: string): string {
  const value = data[field];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${source}: missing or invalid "${field}"`);
  }
  return value;
}

// YAML turns an unquoted `2026-10-04` into a Date; accept both spellings.
function readDate(data: Record<string, unknown>, source: string): string {
  const value = data.date;
  const text = value instanceof Date && !Number.isNaN(value.getTime())
    ? value.toISOString().slice(0, 10)
    : value;
  if (typeof text !== "string" || !DATE_PATTERN.test(text)) {
    throw new Error(`${source}: missing or invalid "date" (expected YYYY-MM-DD)`);
  }
  return text;
}

function readPlatform(data: Record<string, unknown>, source: string): ArticlePlatform {
  const value = data.platform;
  if (value !== "zenn" && value !== "note") {
    throw new Error(`${source}: invalid "platform" (expected "zenn" or "note")`);
  }
  return value;
}

function readUrl(data: Record<string, unknown>, platform: ArticlePlatform, source: string): string {
  const url = requireString(data, "url", source);
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`${source}: invalid "url" (not a valid URL)`);
  }
  if (parsed.protocol !== "https:" || parsed.hostname !== PLATFORM_HOSTS[platform]) {
    throw new Error(`${source}: "url" must be an https URL on ${PLATFORM_HOSTS[platform]}`);
  }
  return url;
}

async function loadFile(dir: string, file: string): Promise<Article> {
  const source = file;
  const id = path.basename(file, ".md");
  if (!ID_PATTERN.test(id)) {
    throw new Error(`${source}: filename must be lowercase letters, digits and hyphens`);
  }

  const raw = await readFile(path.join(dir, file), "utf8");
  const { data } = parseMarkdown(raw, source);

  const platform = readPlatform(data, source);
  const relatedProject = data.relatedProject;
  if (relatedProject !== undefined && (typeof relatedProject !== "string" || relatedProject === "")) {
    throw new Error(`${source}: invalid "relatedProject" (expected a project slug)`);
  }

  return {
    id,
    title: requireString(data, "title", source),
    url: readUrl(data, platform, source),
    platform,
    date: readDate(data, source),
    relatedProject,
  };
}

export async function getAllArticles(dir = DEFAULT_DIR): Promise<Article[]> {
  let files: string[];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".md"));
  } catch (error) {
    throw new Error(`Cannot read articles directory ${dir}`, { cause: error });
  }

  const articles = await Promise.all(files.map((f) => loadFile(dir, f)));

  const seen = new Map<string, string>();
  for (const article of articles) {
    const other = seen.get(article.url);
    if (other) {
      throw new Error(`Duplicate url ${article.url} in "${other}" and "${article.id}"`);
    }
    seen.set(article.url, article.id);
  }

  // Newest first; id breaks ties so the order is stable across builds.
  return articles.sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}

export async function getArticlesByProject(projectSlug: string, dir = DEFAULT_DIR): Promise<Article[]> {
  return (await getAllArticles(dir)).filter((a) => a.relatedProject === projectSlug);
}
