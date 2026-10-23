"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  /** False while a request is running or a one-time secret is on screen. */
  dismissible?: boolean;
}

const widths = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg" } as const;

/**
 * A modal built on the native <dialog>: focus is trapped, Escape closes it, and the
 * page behind is inert. Children mount only while open, so forms start fresh each time.
 */
export function Dialog({ open, onClose, title, description, children, footer, size = "md", dismissible = true }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && dismissible) onClose();
      }}
      className={cn(
        "m-auto w-[calc(100%-2rem)] overflow-hidden rounded-sheet border border-line bg-surface p-0 text-ink shadow-pop",
        widths[size],
      )}
    >
      {open ? (
        <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
          <div aria-hidden="true" className="h-1.5 shrink-0 bg-brand" />
          <div className="flex items-start justify-between gap-4 px-6 pt-6">
            <div className="min-w-0">
              <h2 id="dialog-title" className="font-display text-xl font-semibold leading-tight tracking-tight">
                {title}
              </h2>
              {description ? <p className="mt-1.5 text-sm text-ink-muted">{description}</p> : null}
            </div>
            {dismissible ? (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-mr-2 -mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-control text-ink-muted hover:bg-sunken hover:text-ink"
              >
                <Icon name="x" />
              </button>
            ) : null}
          </div>
          <div className="overflow-y-auto px-6 py-5">{children}</div>
          {footer ? (
            <div className="flex flex-col-reverse gap-2 border-t border-line bg-sunken px-6 py-4 sm:flex-row sm:justify-end">
              {footer}
            </div>
          ) : null}
        </div>
      ) : null}
    </dialog>
  );
}
