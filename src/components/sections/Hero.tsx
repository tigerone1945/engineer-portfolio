import Button from "@/components/ui/Button";
import { links } from "@/data/links";

export default function Hero() {
  return (
    <section className="py-8 sm:py-16">
      <p className="font-mono text-sm text-muted">AI Agent / DX Engineer</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">Yozo Maeda</h1>
      <p className="mt-6 text-xl leading-relaxed sm:text-2xl">
        業務課題を、
        <br />
        AIエージェントとして
        <br />
        設計・実装・本番運用まで。
      </p>
      <p className="mt-6 font-mono text-sm text-muted">
        Python / OpenAI Agents SDK / FastAPI / AWS
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/projects">Projects</Button>
        <Button href={links.github} variant="secondary" external>
          GitHub
        </Button>
      </div>
    </section>
  );
}
