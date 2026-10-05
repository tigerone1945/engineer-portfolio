import type { Publication } from "@/types/publication";

type Props = {
  publications: Publication[];
  /** Where the links go, shown beside each title (e.g. "Amazon"). */
  source: string;
};

export default function PublicationList({ publications, source }: Props) {
  return (
    <ul className="divide-y divide-border border-y border-border">
      {publications.map((publication) => (
        <li key={publication.id}>
          <a
            href={publication.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:gap-4"
          >
            <span className="shrink-0 font-mono text-xs text-muted sm:w-24">{source}</span>
            <span className="group-hover:underline">{publication.title}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
