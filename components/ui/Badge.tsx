import type { ReactNode } from "react";

type Variant = "default" | "success" | "warning" | "danger" | "info" | "muted";

const variants: Record<Variant, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-orange-500 text-white dark:bg-amber-400/20 dark:text-amber-300",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  muted: "bg-muted text-muted-foreground",
};

// A soft glow that's only visible in dark mode — in light mode it stays off
// so the badge doesn't look muddy against a white background.
const glows: Record<Variant, string> = {
  default: "dark:shadow-[0_0_10px_1px_rgba(45,212,191,0.35)]",
  success: "dark:shadow-[0_0_10px_1px_rgba(34,197,94,0.4)]",
  warning: "dark:shadow-[0_0_10px_1px_rgba(251,191,36,0.4)]",
  danger: "dark:shadow-[0_0_10px_1px_rgba(239,68,68,0.4)]",
  info: "dark:shadow-[0_0_10px_1px_rgba(56,189,248,0.4)]",
  muted: "",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full px-2.5 py-0.5
        text-xs font-semibold
        ${variants[variant]}
        ${glows[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
