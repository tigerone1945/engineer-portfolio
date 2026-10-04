type Props = {
  title: string;
  subtitle?: string;
  as?: "h1" | "h2";
};

export default function SectionTitle({ title, subtitle, as: Heading = "h2" }: Props) {
  return (
    <div className="mb-8">
      <Heading className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</Heading>
      {subtitle ? <p className="mt-2 text-muted">{subtitle}</p> : null}
    </div>
  );
}
