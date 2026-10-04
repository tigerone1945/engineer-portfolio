import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Button from "@/components/ui/Button";
import Prose from "@/components/ui/Prose";
import { getProjectBySlug, getProjectSlugs } from "@/lib/projects";

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return { title: project.title, description: project.summary };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <article>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{project.title}</h1>
      <p className="mt-3 text-muted">{project.summary}</p>
      {project.github ? (
        <div className="mt-6">
          <Button href={project.github} variant="secondary" external>
            GitHub
          </Button>
        </div>
      ) : null}
      <div className="mt-8">
        <Prose html={project.html} />
      </div>
    </article>
  );
}
