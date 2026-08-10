import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  icon,
  trend,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
  trend?: string;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-sm min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-muted-foreground truncate">{label}</p>
          <p className="text-xl sm:text-2xl font-semibold mt-1 text-foreground tracking-tight truncate">
            {value}
          </p>
          {trend && (
            <p className="text-xs text-muted-foreground mt-1">{trend}</p>
          )}
        </div>
        {icon && (
          <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
