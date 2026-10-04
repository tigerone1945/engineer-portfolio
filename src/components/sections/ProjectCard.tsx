import Link from "next/link";
import Card from "@/components/ui/Card";
import type { Project } from "@/types/project";

type Props = { project: Project; headingLevel?: "h2" | "h3" };

export default function ProjectCard({ project, headingLevel: Heading = "h3" }: Props) {
  return (
    <Link href={`/projects/${project.slug}`} className="block h-full">
      <Card className="h-full transition-colors hover:border-muted">
        <Heading className="font-semibold">{project.title}</Heading>
        <p className="mt-2 text-sm text-muted">{project.summary}</p>
        {project.techStack.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <li key={tech} className="rounded border border-border px-2 py-0.5 font-mono text-xs text-muted">
                {tech}
              </li>
            ))}
          </ul>
        ) : null}
      </Card>
    </Link>
  );
}
