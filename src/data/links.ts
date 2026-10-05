// External links live here. An empty string means "not published yet":
// the UI shows the name as plain text instead of a link.
export const links = {
  github: "https://github.com/tigerone1945",
  zenn: "https://zenn.dev/tigerone1945",
  note: "https://note.com/loyal_hyssop7944",
  udemy: "",
  kindle: "",
};

export type LinkKey = keyof typeof links;

export type LinkEntry = {
  key: LinkKey;
  label: string;
  href: string | undefined;
};

const labels: Record<LinkKey, string> = {
  github: "GitHub",
  zenn: "Zenn",
  note: "note",
  udemy: "Udemy",
  kindle: "Kindle",
};

export function getLinkEntries(source: Record<LinkKey, string> = links): LinkEntry[] {
  return (Object.keys(labels) as LinkKey[]).map((key) => ({
    key,
    label: labels[key],
    href: source[key] || undefined,
  }));
}
