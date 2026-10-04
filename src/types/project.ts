export type Project = {
  title: string;
  slug: string;
  summary: string;
  order: number;
  github?: string;
  techStack: string[];
};

export type ProjectDetail = Project & {
  html: string;
};
