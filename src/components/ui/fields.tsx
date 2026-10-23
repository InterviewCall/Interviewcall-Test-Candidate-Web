"use client";

import { useId } from "react";
import type { InputHTMLAttributes, ReactNode, Ref } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

interface FieldChrome {
  label: string;
  hint?: string;
  error?: string;
}

function FieldShell({
  id,
  label,
  hint,
  error,
  children,
}: FieldChrome & { id: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="flex items-start gap-1.5 text-[13px] text-danger">
          <Icon name="alert" size={15} className="mt-0.5 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[13px] text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const controlClass =
  "h-12 w-full rounded-control border bg-surface px-3.5 text-base text-ink placeholder:text-ink-faint transition-colors focus-visible:border-ink focus-visible:outline-offset-0 disabled:bg-sunken disabled:text-ink-muted";

function describedBy(id: string, error?: string, hint?: string) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement>, FieldChrome {
  ref?: Ref<HTMLInputElement>;
  trailing?: ReactNode;
}

export function TextField({ label, hint, error, trailing, className, id: idProp, ref, ...rest }: TextFieldProps) {
  const generated = useId();
  const id = idProp ?? generated;
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        <input
          id={id}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          className={cn(controlClass, error ? "border-danger" : "border-line-strong", trailing ? "pr-11" : "", className)}
          {...rest}
        />
        {trailing ? <div className="absolute inset-y-0 right-1 flex items-center">{trailing}</div> : null}
      </div>
    </FieldShell>
  );
}
