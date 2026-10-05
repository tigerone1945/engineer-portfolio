import type { Metadata } from "next";
import ArticleList from "@/components/sections/ArticleList";
import Button from "@/components/ui/Button";
import SectionTitle from "@/components/ui/SectionTitle";
import { links } from "@/data/links";
import { getAllArticles } from "@/lib/articles";

export const metadata: Metadata = { title: "Articles" };

export default async function ArticlesPage() {
  const articles = await getAllArticles();
  return (
    <>
      <SectionTitle
        as="h1"
        title="Articles"
        subtitle="AIエージェントの設計・実装・PoC・本番運用について書いた記事から、代表的なものを掲載しています。"
      />
      <div className="mb-8 flex flex-wrap gap-3">
        {links.zenn ? (
          <Button href={links.zenn} variant="secondary" external>
            Zenn のプロフィール
          </Button>
        ) : null}
        {links.note ? (
          <Button href={links.note} variant="secondary" external>
            note のプロフィール
          </Button>
        ) : null}
      </div>
      <ArticleList articles={articles} />
    </>
  );
}
