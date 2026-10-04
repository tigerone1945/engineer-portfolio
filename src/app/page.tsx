import Button from "@/components/ui/Button";
import SectionTitle from "@/components/ui/SectionTitle";

export default function Home() {
  return (
    <section>
      <SectionTitle as="h1" title="Yozo Maeda" subtitle="AI Agent / DX Engineer" />
      <div className="flex gap-3">
        <Button href="/projects">Projects</Button>
      </div>
    </section>
  );
}
