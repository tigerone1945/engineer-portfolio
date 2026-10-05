import { Fragment } from "react";
import ProjectCard from "@/components/sections/ProjectCard";
import Button from "@/components/ui/Button";
import SectionTitle from "@/components/ui/SectionTitle";
import type { Project } from "@/types/project";

const FEATURED_COUNT = 4;
const STAGES = ["Build", "PoC", "Production", "AgentCore"];

export default function FeaturedProjects({ projects }: { projects: Project[] }) {
  const featured = projects.slice(0, FEATURED_COUNT);
  return (
    <section className="mt-16">
      <SectionTitle
        title="Featured Projects"
        subtitle="1つの業務システムを、段階的に本番運用まで育てた記録。"
      />
      <ol className="flex flex-col gap-3 md:flex-row md:items-stretch">
        {featured.map((project, i) => (
          <Fragment key={project.slug}>
            {i > 0 ? (
              <li aria-hidden="true" className="self-center text-muted">
                <span className="md:hidden">↓</span>
                <span className="hidden md:inline">→</span>
              </li>
            ) : null}
            <li className="flex-1">
              {STAGES[i] ? (
                <p className="mb-2 font-mono text-xs tracking-wide text-muted">
                  {STAGES[i]}
                </p>
              ) : null}
              <ProjectCard project={project} />
            </li>
          </Fragment>
        ))}
      </ol>
      <div className="mt-8">
        <Button href="/projects" variant="secondary">
          すべてのProjects
        </Button>
      </div>
    </section>
  );
}
