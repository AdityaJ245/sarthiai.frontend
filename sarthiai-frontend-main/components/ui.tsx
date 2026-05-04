import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
  children: ReactNode;
}): React.ReactElement {
  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-accent text-white hover:bg-accent-hover shadow-sm"
      : variant === "danger"
        ? "bg-red-700 text-white hover:bg-red-800"
        : "bg-transparent text-ink hover:bg-line/60";
  return (
    <button type={type} className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Input({
  label,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }): React.ReactElement {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted">{label}</span>
      <input
        className={`w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none ring-accent/30 placeholder:text-muted focus:border-accent focus:ring-2 ${className}`}
        {...props}
      />
    </label>
  );
}

export function Textarea({
  label,
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
}): React.ReactElement {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted">{label}</span>
      <textarea
        className={`w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none ring-accent/30 placeholder:text-muted focus:border-accent focus:ring-2 ${className}`}
        {...props}
      />
    </label>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}): React.ReactElement {
  return (
    <div
      className={`rounded-2xl border border-line/80 bg-surface p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}
