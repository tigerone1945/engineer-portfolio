import { describe, expect, it } from "vitest";
import { links, getLinkEntries } from "./links";

describe("links", () => {
  it("leaves publication URLs empty in v1.0", () => {
    expect(links.zenn).toBe("");
    expect(links.note).toBe("");
    expect(links.udemy).toBe("");
    expect(links.kindle).toBe("");
  });

  it("marks entries without a URL as non-linkable but still lists them", () => {
    const entries = getLinkEntries({ github: "https://github.com/x", zenn: "", note: "", udemy: "", kindle: "" });
    const zenn = entries.find((e) => e.key === "zenn");
    expect(zenn).toEqual({ key: "zenn", label: "Zenn", href: undefined });
    expect(entries.find((e) => e.key === "github")?.href).toBe("https://github.com/x");
  });
});
