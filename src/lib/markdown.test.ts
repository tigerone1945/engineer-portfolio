import { describe, expect, it } from "vitest";
import { markdownToHtml, parseMarkdown } from "./markdown";

describe("parseMarkdown", () => {
  it("splits frontmatter and body", () => {
    const { data, content } = parseMarkdown("---\ntitle: A\n---\n# Hello\n", "a.md");
    expect(data).toEqual({ title: "A" });
    expect(content.trim()).toBe("# Hello");
  });

  it("returns empty data when there is no frontmatter", () => {
    const { data } = parseMarkdown("# Hello\n", "a.md");
    expect(data).toEqual({});
  });

  it("throws an error naming the source on malformed frontmatter", () => {
    expect(() => parseMarkdown("---\ntitle: [unclosed\n---\nbody", "broken.md")).toThrow(
      /broken\.md/,
    );
  });
});

describe("markdownToHtml", () => {
  it("converts headings and lists to HTML", async () => {
    const html = await markdownToHtml("## Title\n\n- one\n- two\n");
    expect(html).toContain("<h2>Title</h2>");
    expect(html).toContain("<li>one</li>");
  });

  it("sanitizes raw HTML by default", async () => {
    const html = await markdownToHtml("<script>alert(1)</script>\n\ntext");
    expect(html).not.toContain("<script>");
  });
});
