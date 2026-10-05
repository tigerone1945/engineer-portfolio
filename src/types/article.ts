export type ArticlePlatform = "zenn" | "note";

export type Article = {
  /** Filename without extension. */
  id: string;
  title: string;
  url: string;
  platform: ArticlePlatform;
  /** Publication date, YYYY-MM-DD. */
  date: string;
  /** Slug of a project in content/projects, if the article belongs to one. */
  relatedProject?: string;
};
