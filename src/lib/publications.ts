import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { Publication, PublicationKind } from "@/types/publication";
import { requireString } from "./frontmatter";
import { parseMarkdown } from "./markdown";

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Requiring the canonical URL form keeps tracking parameters, coupon codes
// and other stores out of the published links. Kindle ASINs start with B0.
const KINDS: Record<PublicationKind, { dir: string; pattern: RegExp; hint: string }> = {
  kindle: {
    dir: path.join(process.cwd(), "content", "publications", "kindle"),
    pattern: /^https:\/\/www\.amazon\.co\.jp\/dp\/B0[A-Z0-9]{8}$/,
    hint: "https://www.amazon.co.jp/dp/<ASIN>",
  },
  udemy: {
    dir: path.join(process.cwd(), "content", "publications", "udemy"),
    pattern: /^https:\/\/www\.udemy\.com\/course\/[a-z0-9]+(?:-[a-z0-9]+)*\/$/,
    hint: "https://www.udemy.com/course/<slug>/",
  },
};

async function loadFile(dir: string, file: string, kind: PublicationKind): Promise<Publication> {
  const source = file;
  const id = path.basename(file, ".md");
  if (!ID_PATTERN.test(id)) {
    throw new Error(`${source}: filename must be lowercase letters, digits and hyphens`);
  }

  const raw = await readFile(path.join(dir, file), "utf8");
  const { data } = parseMarkdown(raw, source);

  const url = requireString(data, "url", source);
  if (!KINDS[kind].pattern.test(url)) {
    throw new Error(`${source}: "url" must look like ${KINDS[kind].hint}`);
  }

  const order = data.order;
  if (typeof order !== "number" || !Number.isFinite(order)) {
    throw new Error(`${source}: missing or invalid "order" (expected a number)`);
  }

  return { id, title: requireString(data, "title", source), url, order };
}

async function loadPublications(kind: PublicationKind, dir: string): Promise<Publication[]> {
  let files: string[];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".md"));
  } catch (error) {
    throw new Error(`Cannot read publications directory ${dir}`, { cause: error });
  }

  const items = await Promise.all(files.map((f) => loadFile(dir, f, kind)));

  const orders = new Map<number, string>();
  const urls = new Map<string, string>();
  for (const item of items) {
    const sameOrder = orders.get(item.order);
    if (sameOrder) {
      throw new Error(`Duplicate order ${item.order} in "${sameOrder}" and "${item.id}"`);
    }
    orders.set(item.order, item.id);

    const sameUrl = urls.get(item.url);
    if (sameUrl) {
      throw new Error(`Duplicate url ${item.url} in "${sameUrl}" and "${item.id}"`);
    }
    urls.set(item.url, item.id);
  }

  return items.sort((a, b) => a.order - b.order);
}

export function getKindleBooks(dir = KINDS.kindle.dir): Promise<Publication[]> {
  return loadPublications("kindle", dir);
}

export function getUdemyCourses(dir = KINDS.udemy.dir): Promise<Publication[]> {
  return loadPublications("udemy", dir);
}
