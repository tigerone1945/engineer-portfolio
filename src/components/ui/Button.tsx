import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  external?: boolean;
};

const base =
  "inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium transition-colors";
const variants = {
  primary: "bg-accent text-background hover:bg-foreground/85",
  secondary: "border border-border text-foreground hover:bg-surface",
};

export default function Button({ href, children, variant = "primary", external = false }: Props) {
  const className = `${base} ${variants[variant]}`;
  if (external) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
