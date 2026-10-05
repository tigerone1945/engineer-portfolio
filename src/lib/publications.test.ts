import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { getKindleBooks } from "./publications";

let dir: string;

function write(file: string, front: string) {
  writeFileSync(path.join(dir, file), `---\n${front}\n---\n`);
}

const valid = (id: string, order: number, asin = "B0AAAAAAA1") =>
  `title: T-${id}\nurl: https://www.amazon.co.jp/dp/${asin}\norder: ${order}`;

beforeEach(() => {
  dir = mkdtempSync(path.join(tmpdir(), "publications-"));
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("getKindleBooks", () => {
  it("sorts by order ascending", async () => {
    write("b.md", valid("b", 2, "B0BBBBBBB2"));
    write("a.md", valid("a", 3, "B0AAAAAAA3"));
    write("c.md", valid("c", 1, "B0CCCCCCC1"));
    expect((await getKindleBooks(dir)).map((b) => b.id)).toEqual(["c", "b", "a"]);
  });

  it("ignores non-markdown files", async () => {
    write("a.md", valid("a", 1));
    writeFileSync(path.join(dir, "notes.txt"), "x");
    expect(await getKindleBooks(dir)).toHaveLength(1);
  });

  it.each([
    ["title", "url: https://www.amazon.co.jp/dp/B0AAAAAAA1\norder: 1", '"title"'],
    ["url", "title: a\norder: 1", '"url"'],
    ["order", "title: a\nurl: https://www.amazon.co.jp/dp/B0AAAAAAA1", '"order"'],
  ])("throws when %s is missing", async (_name, front, message) => {
    write("a.md", front);
    await expect(getKindleBooks(dir)).rejects.toThrow(message);
  });

  it.each([
    ["a non-amazon host", "https://example.com/dp/B0AAAAAAA1"],
    ["http", "http://www.amazon.co.jp/dp/B0AAAAAAA1"],
    ["tracking parameters", "https://www.amazon.co.jp/dp/B0AAAAAAA1?tag=x"],
    ["a look-alike host", "https://www.amazon.co.jp.evil.example/dp/B0AAAAAAA1"],
    ["a malformed ASIN", "https://www.amazon.co.jp/dp/B0SHORT"],
  ])("rejects %s", async (_name, url) => {
    write("a.md", `title: a\nurl: ${url}\norder: 1`);
    await expect(getKindleBooks(dir)).rejects.toThrow("amazon.co.jp/dp/<ASIN>");
  });

  it("throws on a non-numeric order", async () => {
    write("a.md", "title: a\nurl: https://www.amazon.co.jp/dp/B0AAAAAAA1\norder: first");
    await expect(getKindleBooks(dir)).rejects.toThrow('invalid "order"');
  });

  it("throws on a duplicate order", async () => {
    write("a.md", valid("a", 1, "B0AAAAAAA1"));
    write("b.md", valid("b", 1, "B0BBBBBBB2"));
    await expect(getKindleBooks(dir)).rejects.toThrow("Duplicate order");
  });

  it("throws on a duplicate url", async () => {
    write("a.md", valid("a", 1));
    write("b.md", valid("b", 2));
    await expect(getKindleBooks(dir)).rejects.toThrow("Duplicate url");
  });

  it("throws on an invalid filename", async () => {
    write("Bad Name.md", valid("a", 1));
    await expect(getKindleBooks(dir)).rejects.toThrow("filename");
  });

  it("throws on invalid frontmatter syntax", async () => {
    writeFileSync(path.join(dir, "a.md"), "---\ntitle: [unclosed\n---\n");
    await expect(getKindleBooks(dir)).rejects.toThrow("invalid frontmatter");
  });

  it("throws a clear error when the directory is missing", async () => {
    await expect(getKindleBooks(path.join(dir, "missing"))).rejects.toThrow(
      "Cannot read publications directory",
    );
  });
});

describe("published content", () => {
  it("lists the four Kindle books", async () => {
    const books = await getKindleBooks();
    expect(books).toHaveLength(4);
  });
});
