import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "danger";

export default function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base =
    "select-none border px-5 py-3 font-mono text-xs tracking-[0.28em] transition focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] disabled:opacity-50 disabled:cursor-not-allowed";

  const styles: Record<Variant, string> = {
    primary:
      "border-transparent bg-[var(--accent-red)] text-white hover:shadow-[var(--glow-red)]",
    ghost:
      "border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]",
    danger:
      "border-[var(--accent-red)] bg-transparent text-[var(--accent-red)] hover:shadow-[var(--glow-red)]",
  };

  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}

