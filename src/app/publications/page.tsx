import type { Metadata } from "next";
import PublicationList from "@/components/sections/PublicationList";
import SectionTitle from "@/components/ui/SectionTitle";
import { getKindleBooks } from "@/lib/publications";

export const metadata: Metadata = { title: "Publications" };

export default async function PublicationsPage() {
  const books = await getKindleBooks();
  return (
    <>
      <SectionTitle
        as="h1"
        title="Publications"
        subtitle="AIエージェントの設計・実装を体系的にまとめた書籍です。"
      />
      <section aria-labelledby="kindle">
        <h2 id="kindle" className="mb-4 text-xl font-semibold">
          Kindle
        </h2>
        <PublicationList publications={books} />
      </section>
    </>
  );
}
