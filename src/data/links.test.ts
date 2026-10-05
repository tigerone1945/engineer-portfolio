import { describe, expect, it } from "vitest";
import { links, getLinkEntries } from "./links";

describe("links", () => {
  it("publishes the Zenn and note profiles (v1.1)", () => {
    expect(links.zenn).toBe("https://zenn.dev/tigerone1945");
    expect(links.note).toBe("https://note.com/loyal_hyssop7944");
  });

  it("leaves Udemy and Kindle URLs empty until v1.2", () => {
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
