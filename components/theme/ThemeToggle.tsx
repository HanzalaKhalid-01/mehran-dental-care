"use client";

import { useTheme } from "@/lib/theme/ThemeProvider";
import { Moon, Sun } from "lucide-react";

type Props = {
  /** Visual variant for different contexts */
  variant?: "default" | "sidebar" | "public";
  className?: string;
};

export function ThemeToggle({ variant = "default", className = "" }: Props) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const base =
    "inline-flex items-center justify-center rounded-lg transition-colors focus-ring disabled:opacity-50";

  const variants = {
    default:
      "h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted border border-border bg-card",
    sidebar:
      "h-9 w-9 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-hover",
    public:
      "h-9 w-9 text-ink/60 hover:text-ink hover:bg-ink/5 border border-transparent",
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {isDark ? (
        <Sun className="h-4 w-4" strokeWidth={2} />
      ) : (
        <Moon className="h-4 w-4" strokeWidth={2} />
      )}
    </button>
  );
}
