import FeaturedProjects from "@/components/sections/FeaturedProjects";
import Hero from "@/components/sections/Hero";
import { getAllProjects } from "@/lib/projects";

export default async function Home() {
  const projects = await getAllProjects();
  return (
    <>
      <Hero />
      <FeaturedProjects projects={projects} />
    </>
  );
}
