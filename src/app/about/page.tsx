import type { Metadata } from "next";
import Prose from "@/components/ui/Prose";
import SectionTitle from "@/components/ui/SectionTitle";
import { getAboutHtml } from "@/lib/profile";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const html = await getAboutHtml();
  return (
    <>
      <SectionTitle as="h1" title="About" />
      <Prose html={html} />
    </>
  );
}
