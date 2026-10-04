import type { Metadata } from "next";
import Button from "@/components/ui/Button";
import SectionTitle from "@/components/ui/SectionTitle";

export const metadata: Metadata = { title: "ページが見つかりません" };

export default function NotFound() {
  return (
    <section className="py-8 sm:py-16">
      <p className="font-mono text-sm text-muted">404</p>
      <div className="mt-3">
        <SectionTitle
          as="h1"
          title="ページが見つかりません"
          subtitle="URLが間違っているか、ページが移動または削除された可能性があります。"
        />
      </div>
      <Button href="/">Home へ戻る</Button>
    </section>
  );
}
