"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
  /** Element rendered inside the input on the right (e.g. a show/hide toggle). */
  rightElement?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ className = "", label, error, hint, id, rightElement, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground"
          >
            {label}
            {props.required && <span className="text-destructive ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full h-10 rounded-xl border bg-card px-3.5 text-sm
              text-foreground placeholder:text-muted-foreground
              border-border
              transition-colors
              focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary
              disabled:opacity-50 disabled:cursor-not-allowed
              ${rightElement ? "pr-10" : ""}
              ${error ? "border-destructive focus:ring-destructive/30 focus:border-destructive" : ""}
              ${className}
            `}
            {...props}
          />
          {rightElement && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
