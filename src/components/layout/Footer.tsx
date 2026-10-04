import { getLinkEntries } from "@/data/links";

export default function Footer() {
  const entries = getLinkEntries();
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <ul className="flex flex-wrap gap-x-5 gap-y-1">
          {entries.map((entry) => (
            <li key={entry.key}>
              {entry.href ? (
                <a
                  href={entry.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-foreground"
                >
                  {entry.label}
                </a>
              ) : (
                <span>{entry.label}</span>
              )}
            </li>
          ))}
        </ul>
        <p>© {new Date().getFullYear()} Yozo Maeda / Zero-One-Tech</p>
      </div>
    </footer>
  );
}
