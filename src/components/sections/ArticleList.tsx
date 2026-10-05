import type { Article } from "@/types/article";

const platformLabels: Record<Article["platform"], string> = {
  zenn: "Zenn",
  note: "note",
};

type Props = {
  articles: Article[];
};

export default function ArticleList({ articles }: Props) {
  return (
    <ul className="divide-y divide-border border-y border-border">
      {articles.map((article) => (
        <li key={article.id}>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-1 py-4 transition-colors sm:flex-row sm:items-baseline sm:gap-4"
          >
            <span className="flex shrink-0 gap-3 font-mono text-xs text-muted sm:w-40">
              <time dateTime={article.date}>{article.date}</time>
              <span>{platformLabels[article.platform]}</span>
            </span>
            <span className="group-hover:underline">{article.title}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
