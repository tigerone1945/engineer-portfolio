import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { getAllProjects, getProjectBySlug, getProjectSlugs } from "./projects";

let dir: string;

function write(file: string, front: string, body = "# Body\n") {
  writeFileSync(path.join(dir, file), `---\n${front}\n---\n${body}`);
}

const valid = (slug: string, order: number, extra = "") =>
  `title: T-${slug}\nslug: ${slug}\nsummary: S-${slug}\norder: ${order}\n${extra}`;

beforeEach(() => {
  dir = mkdtempSync(path.join(tmpdir(), "projects-"));
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("getAllProjects", () => {
  it("sorts by order ascending", async () => {
    write("b.md", valid("b", 2));
    write("a.md", valid("a", 3));
    write("c.md", valid("c", 1));
    const projects = await getAllProjects(dir);
    expect(projects.map((p) => p.slug)).toEqual(["c", "b", "a"]);
  });

  it("ignores non-markdown files", async () => {
    write("a.md", valid("a", 1));
    writeFileSync(path.join(dir, "notes.txt"), "x");
    expect(await getAllProjects(dir)).toHaveLength(1);
  });

  it("defaults techStack to [] and github to undefined", async () => {
    write("a.md", valid("a", 1));
    const [p] = await getAllProjects(dir);
    expect(p.techStack).toEqual([]);
    expect(p.github).toBeUndefined();
  });

  it("reads github and techStack when present", async () => {
    write("a.md", valid("a", 1, "github: https://github.com/x/y\ntechStack: [Python, FastAPI]"));
    const [p] = await getAllProjects(dir);
    expect(p.github).toBe("https://github.com/x/y");
    expect(p.techStack).toEqual(["Python", "FastAPI"]);
  });

  it("throws when the directory does not exist", async () => {
    await expect(getAllProjects(path.join(dir, "missing"))).rejects.toThrow(/missing/);
  });

  it.each(["title", "slug", "summary", "order"])("throws when %s is missing", async (field) => {
    const lines = valid("a", 1)
      .split("\n")
      .filter((l) => !l.startsWith(`${field}:`))
      .join("\n");
    write("a.md", lines);
    await expect(getAllProjects(dir)).rejects.toThrow(new RegExp(`a\\.md.*${field}`));
  });

  it("throws when order is not a number", async () => {
    write("a.md", "title: T\nslug: a\nsummary: S\norder: first");
    await expect(getAllProjects(dir)).rejects.toThrow(/order/);
  });

  it("throws when slug does not match the filename", async () => {
    write("a.md", valid("other", 1));
    await expect(getAllProjects(dir)).rejects.toThrow(/slug/);
  });

  it("throws when two projects share an order", async () => {
    write("a.md", valid("a", 1));
    write("b.md", valid("b", 1));
    await expect(getAllProjects(dir)).rejects.toThrow(/order/);
  });
});

describe("getProjectSlugs", () => {
  it("returns slugs in order", async () => {
    write("b.md", valid("b", 2));
    write("a.md", valid("a", 1));
    expect(await getProjectSlugs(dir)).toEqual(["a", "b"]);
  });
});

describe("getProjectBySlug", () => {
  it("returns the project with rendered html", async () => {
    write("a.md", valid("a", 1), "## Overview\n\ntext\n");
    const p = await getProjectBySlug("a", dir);
    expect(p?.title).toBe("T-a");
    expect(p?.html).toContain("<h2>Overview</h2>");
  });

  it("returns null for an unknown slug", async () => {
    write("a.md", valid("a", 1));
    expect(await getProjectBySlug("nope", dir)).toBeNull();
  });

  it("rejects slugs that could escape the directory", async () => {
    expect(await getProjectBySlug("../etc/passwd", dir)).toBeNull();
  });
});
