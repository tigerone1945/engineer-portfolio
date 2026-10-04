import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function Card({ children, className = "" }: Props) {
  return (
    <div className={`rounded-lg border border-border bg-surface p-6 ${className}`}>{children}</div>
  );
}
