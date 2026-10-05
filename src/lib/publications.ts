import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { Publication } from "@/types/publication";
import { requireString } from "./frontmatter";
import { parseMarkdown } from "./markdown";

const DEFAULT_DIR = path.join(process.cwd(), "content", "publications", "kindle");
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
// Kindle ASINs start with B0; requiring the canonical /dp/<ASIN> form keeps
// tracking parameters and other stores out of the published links.
const KINDLE_URL_PATTERN = /^https:\/\/www\.amazon\.co\.jp\/dp\/B0[A-Z0-9]{8}$/;

async function loadFile(dir: string, file: string): Promise<Publication> {
  const source = file;
  const id = path.basename(file, ".md");
  if (!ID_PATTERN.test(id)) {
    throw new Error(`${source}: filename must be lowercase letters, digits and hyphens`);
  }

  const raw = await readFile(path.join(dir, file), "utf8");
  const { data } = parseMarkdown(raw, source);

  const url = requireString(data, "url", source);
  if (!KINDLE_URL_PATTERN.test(url)) {
    throw new Error(`${source}: "url" must look like https://www.amazon.co.jp/dp/<ASIN>`);
  }

  const order = data.order;
  if (typeof order !== "number" || !Number.isFinite(order)) {
    throw new Error(`${source}: missing or invalid "order" (expected a number)`);
  }

  return { id, title: requireString(data, "title", source), url, order };
}

export async function getKindleBooks(dir = DEFAULT_DIR): Promise<Publication[]> {
  let files: string[];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".md"));
  } catch (error) {
    throw new Error(`Cannot read publications directory ${dir}`, { cause: error });
  }

  const books = await Promise.all(files.map((f) => loadFile(dir, f)));

  const orders = new Map<number, string>();
  const urls = new Map<string, string>();
  for (const book of books) {
    const sameOrder = orders.get(book.order);
    if (sameOrder) {
      throw new Error(`Duplicate order ${book.order} in "${sameOrder}" and "${book.id}"`);
    }
    orders.set(book.order, book.id);

    const sameUrl = urls.get(book.url);
    if (sameUrl) {
      throw new Error(`Duplicate url ${book.url} in "${sameUrl}" and "${book.id}"`);
    }
    urls.set(book.url, book.id);
  }

  return books.sort((a, b) => a.order - b.order);
}
