import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { getAllArticles, getArticlesByProject } from "./articles";
import { getProjectSlugs } from "./projects";

let dir: string;

function write(file: string, front: string) {
  writeFileSync(path.join(dir, file), `---\n${front}\n---\n`);
}

const valid = (title: string, date: string, extra = "") =>
  `title: ${title}\nurl: https://zenn.dev/u/articles/${title}\nplatform: zenn\ndate: "${date}"\n${extra}`;

beforeEach(() => {
  dir = mkdtempSync(path.join(tmpdir(), "articles-"));
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("getAllArticles", () => {
  it("sorts newest first", async () => {
    write("a.md", valid("a", "2026-01-01"));
    write("b.md", valid("b", "2026-03-01"));
    write("c.md", valid("c", "2026-02-01"));
    expect((await getAllArticles(dir)).map((a) => a.id)).toEqual(["b", "c", "a"]);
  });

  it("breaks date ties by id so the order is stable", async () => {
    write("b.md", valid("b", "2026-01-01"));
    write("a.md", valid("a", "2026-01-01"));
    expect((await getAllArticles(dir)).map((a) => a.id)).toEqual(["a", "b"]);
  });

  it("ignores non-markdown files", async () => {
    write("a.md", valid("a", "2026-01-01"));
    writeFileSync(path.join(dir, "notes.txt"), "x");
    expect(await getAllArticles(dir)).toHaveLength(1);
  });

  it("accepts an unquoted YAML date", async () => {
    write("a.md", "title: a\nurl: https://zenn.dev/u/articles/a\nplatform: zenn\ndate: 2026-10-04");
    const [article] = await getAllArticles(dir);
    expect(article.date).toBe("2026-10-04");
  });

  it("reads relatedProject when present and leaves it undefined otherwise", async () => {
    write("a.md", valid("a", "2026-01-01", "relatedProject: triage-agent"));
    write("b.md", valid("b", "2026-01-02"));
    const articles = await getAllArticles(dir);
    expect(articles.find((a) => a.id === "a")?.relatedProject).toBe("triage-agent");
    expect(articles.find((a) => a.id === "b")?.relatedProject).toBeUndefined();
  });

  it("accepts note.com URLs for the note platform", async () => {
    write("n.md", 'title: n\nurl: https://note.com/u/n/abc\nplatform: note\ndate: "2026-01-01"');
    expect((await getAllArticles(dir))[0].platform).toBe("note");
  });

  it.each([
    ["title", "url: https://zenn.dev/u/articles/a\nplatform: zenn\ndate: \"2026-01-01\"", '"title"'],
    ["url", 'title: a\nplatform: zenn\ndate: "2026-01-01"', '"url"'],
    ["platform", 'title: a\nurl: https://zenn.dev/u/articles/a\ndate: "2026-01-01"', '"platform"'],
    ["date", "title: a\nurl: https://zenn.dev/u/articles/a\nplatform: zenn", '"date"'],
  ])("throws when %s is missing", async (_name, front, message) => {
    write("a.md", front);
    await expect(getAllArticles(dir)).rejects.toThrow(message);
  });

  it("throws on an unknown platform", async () => {
    write("a.md", 'title: a\nurl: https://zenn.dev/u/articles/a\nplatform: qiita\ndate: "2026-01-01"');
    await expect(getAllArticles(dir)).rejects.toThrow('invalid "platform"');
  });

  it("throws on a malformed date", async () => {
    write("a.md", valid("a", "2026/01/01"));
    await expect(getAllArticles(dir)).rejects.toThrow('invalid "date"');
  });

  it("throws on a URL that is not a URL", async () => {
    write("a.md", 'title: a\nurl: not-a-url\nplatform: zenn\ndate: "2026-01-01"');
    await expect(getAllArticles(dir)).rejects.toThrow('invalid "url"');
  });

  it("throws on a non-https URL", async () => {
    write("a.md", 'title: a\nurl: http://zenn.dev/u/articles/a\nplatform: zenn\ndate: "2026-01-01"');
    await expect(getAllArticles(dir)).rejects.toThrow("https URL on zenn.dev");
  });

  it("throws when the URL host does not match the platform", async () => {
    write("a.md", 'title: a\nurl: https://note.com/u/n/abc\nplatform: zenn\ndate: "2026-01-01"');
    await expect(getAllArticles(dir)).rejects.toThrow("https URL on zenn.dev");
  });

  it("rejects a look-alike host", async () => {
    write("a.md", 'title: a\nurl: https://zenn.dev.evil.example/a\nplatform: zenn\ndate: "2026-01-01"');
    await expect(getAllArticles(dir)).rejects.toThrow("https URL on zenn.dev");
  });

  it("throws on a duplicate URL", async () => {
    const same = 'title: t\nurl: https://zenn.dev/u/articles/same\nplatform: zenn\ndate: "2026-01-01"';
    write("a.md", same);
    write("b.md", same);
    await expect(getAllArticles(dir)).rejects.toThrow("Duplicate url");
  });

  it("throws on an invalid filename", async () => {
    write("Bad Name.md", valid("a", "2026-01-01"));
    await expect(getAllArticles(dir)).rejects.toThrow("filename");
  });

  it("throws on invalid frontmatter syntax", async () => {
    writeFileSync(path.join(dir, "a.md"), "---\ntitle: [unclosed\n---\n");
    await expect(getAllArticles(dir)).rejects.toThrow("invalid frontmatter");
  });

  it("throws a clear error when the directory is missing", async () => {
    await expect(getAllArticles(path.join(dir, "missing"))).rejects.toThrow(
      "Cannot read articles directory",
    );
  });
});

describe("getArticlesByProject", () => {
  it("returns only the articles of that project, newest first", async () => {
    write("a.md", valid("a", "2026-01-01", "relatedProject: triage-agent"));
    write("b.md", valid("b", "2026-02-01", "relatedProject: triage-agent"));
    write("c.md", valid("c", "2026-03-01", "relatedProject: poc-agent"));
    write("d.md", valid("d", "2026-04-01"));
    expect((await getArticlesByProject("triage-agent", dir)).map((a) => a.id)).toEqual(["b", "a"]);
  });

  it("returns an empty list when nothing is related", async () => {
    write("a.md", valid("a", "2026-01-01"));
    expect(await getArticlesByProject("triage-agent", dir)).toEqual([]);
  });
});

describe("published content", () => {
  it("is valid and only references projects that exist", async () => {
    const articles = await getAllArticles();
    const slugs = new Set(await getProjectSlugs());
    for (const article of articles) {
      if (article.relatedProject) {
        expect(slugs, `${article.id} -> ${article.relatedProject}`).toContain(article.relatedProject);
      }
    }
  });
});
