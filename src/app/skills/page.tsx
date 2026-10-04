import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";
import { skills } from "@/data/skills";

export const metadata: Metadata = { title: "Skills" };

export default function SkillsPage() {
  return (
    <>
      <SectionTitle as="h1" title="Skills" />
      <div className="grid gap-4 sm:grid-cols-2">
        {skills.map((group) => (
          <Card key={group.category}>
            <h2 className="font-semibold">{group.category}</h2>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </>
  );
}
