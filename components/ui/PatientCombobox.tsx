"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, ChevronDown, Check } from "lucide-react";

type PatientOption = { id: string; full_name: string; phone?: string };

export function PatientCombobox({
  patients,
  value,
  onChange,
  label = "Patient",
  required,
  placeholder = "Search by name or phone...",
}: {
  patients: PatientOption[];
  value: string;
  onChange: (id: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = patients.find((p) => p.id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) => p.full_name.toLowerCase().includes(q) || (p.phone ?? "").includes(q)
    );
  }, [patients, query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-1.5" ref={rootRef}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full h-10 rounded-xl border border-border bg-card px-3.5 text-sm text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-colors"
        >
          <span className={selected ? "text-foreground truncate" : "text-foreground/40 truncate"}>
            {selected ? selected.full_name : "Choose a patient..."}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>

        {open && (
          <div className="absolute z-30 mt-1.5 w-full rounded-xl border border-border bg-card shadow-lg overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
              <Search className="h-4 w-4 shrink-0 opacity-40" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-transparent text-sm focus:outline-none placeholder:text-foreground/40"
              />
            </div>

            <div className="max-h-64 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="px-3.5 py-3 text-sm text-foreground/50">No patients match.</p>
              ) : (
                filtered.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onChange(p.id);
                      setOpen(false);
                      setQuery("");
                    }}
                    className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm text-left hover:bg-primary/5 transition-colors"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-foreground">{p.full_name}</span>
                      {p.phone && <span className="block text-xs text-foreground/50">{p.phone}</span>}
                    </span>
                    {p.id === value && <Check className="h-4 w-4 shrink-0 text-primary" />}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
