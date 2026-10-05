import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { Project, ProjectDetail } from "@/types/project";
import { requireString } from "./frontmatter";
import { markdownToHtml, parseMarkdown } from "./markdown";

const DEFAULT_DIR = path.join(process.cwd(), "content", "projects");
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type Loaded = { project: Project; content: string };

async function loadFile(dir: string, file: string): Promise<Loaded> {
  const source = file;
  const raw = await readFile(path.join(dir, file), "utf8");
  const { data, content } = parseMarkdown(raw, source);

  const title = requireString(data, "title", source);
  const slug = requireString(data, "slug", source);
  const summary = requireString(data, "summary", source);

  const order = data.order;
  if (typeof order !== "number" || !Number.isFinite(order)) {
    throw new Error(`${source}: missing or invalid "order" (expected a number)`);
  }

  if (slug !== path.basename(file, ".md")) {
    throw new Error(`${source}: slug "${slug}" does not match the filename`);
  }

  const github = data.github;
  if (github !== undefined && typeof github !== "string") {
    throw new Error(`${source}: invalid "github" (expected a string)`);
  }

  const techStack = data.techStack ?? [];
  if (!Array.isArray(techStack) || !techStack.every((t) => typeof t === "string")) {
    throw new Error(`${source}: invalid "techStack" (expected a list of strings)`);
  }

  return { project: { title, slug, summary, order, github, techStack }, content };
}

async function loadAll(dir: string): Promise<Loaded[]> {
  let files: string[];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".md"));
  } catch (error) {
    throw new Error(`Cannot read projects directory ${dir}`, { cause: error });
  }

  const loaded = await Promise.all(files.map((f) => loadFile(dir, f)));

  const seen = new Map<number, string>();
  for (const { project } of loaded) {
    const other = seen.get(project.order);
    if (other) {
      throw new Error(`Duplicate order ${project.order} in "${other}" and "${project.slug}"`);
    }
    seen.set(project.order, project.slug);
  }

  return loaded.sort((a, b) => a.project.order - b.project.order);
}

export async function getAllProjects(dir = DEFAULT_DIR): Promise<Project[]> {
  return (await loadAll(dir)).map((l) => l.project);
}

export async function getProjectSlugs(dir = DEFAULT_DIR): Promise<string[]> {
  return (await getAllProjects(dir)).map((p) => p.slug);
}

export async function getProjectBySlug(
  slug: string,
  dir = DEFAULT_DIR,
): Promise<ProjectDetail | null> {
  if (!SLUG_PATTERN.test(slug)) return null;
  const found = (await loadAll(dir)).find((l) => l.project.slug === slug);
  if (!found) return null;
  return { ...found.project, html: await markdownToHtml(found.content) };
}
