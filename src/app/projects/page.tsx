import type { Metadata } from "next";
import ProjectCard from "@/components/sections/ProjectCard";
import SectionTitle from "@/components/ui/SectionTitle";
import { getAllProjects } from "@/lib/projects";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const projects = await getAllProjects();
  return (
    <>
      <SectionTitle
        as="h1"
        title="Projects"
        subtitle="業務課題 → Triage Agent → PoC → Production と段階的に高度化した実績。"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} headingLevel="h2" />
        ))}
      </div>
    </>
  );
}
