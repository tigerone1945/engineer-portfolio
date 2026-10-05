import type { Metadata } from "next";
import PublicationList from "@/components/sections/PublicationList";
import SectionTitle from "@/components/ui/SectionTitle";
import { getKindleBooks, getUdemyCourses } from "@/lib/publications";

export const metadata: Metadata = { title: "Publications" };

export default async function PublicationsPage() {
  const [books, courses] = await Promise.all([getKindleBooks(), getUdemyCourses()]);
  return (
    <>
      <SectionTitle
        as="h1"
        title="Publications"
        subtitle="Kindle の書籍と Udemy の講座として、体系的にまとめた内容です。"
      />
      <div className="space-y-12">
        <section aria-labelledby="kindle">
          <h2 id="kindle" className="mb-4 text-xl font-semibold">
            Kindle
          </h2>
          <PublicationList publications={books} source="Amazon" />
        </section>
        <section aria-labelledby="udemy">
          <h2 id="udemy" className="mb-4 text-xl font-semibold">
            Udemy
          </h2>
          <PublicationList publications={courses} source="Udemy" />
        </section>
      </div>
    </>
  );
}
