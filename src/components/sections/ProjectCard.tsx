import Link from "next/link";
import Card from "@/components/ui/Card";
import type { Project } from "@/types/project";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.slug}`} className="block h-full">
      <Card className="h-full transition-colors hover:border-muted">
        <h3 className="font-semibold">{project.title}</h3>
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
