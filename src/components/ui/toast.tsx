"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

type Tone = "success" | "error" | "info";

interface ToastInput {
  title: string;
  description?: string;
  tone?: Tone;
}

interface ToastItem extends ToastInput {
  id: number;
}

const ToastContext = createContext<(toast: ToastInput) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

const toneStyles: Record<Tone, { icon: "check" | "alert" | "info"; badge: string }> = {
  success: { icon: "check", badge: "bg-success-tint text-success" },
  error: { icon: "alert", badge: "bg-danger-tint text-danger" },
  info: { icon: "info", badge: "bg-primary-tint text-primary" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setItems((current) => current.filter((t) => t.id !== id)), []);
  const push = useCallback((toast: ToastInput) => {
    setItems((current) => [...current.slice(-3), { ...toast, id: nextId.current++ }]);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-4 sm:items-end"
      >
        {items.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
  const tone = toneStyles[item.tone ?? "success"];

  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(item.id), item.tone === "error" ? 8000 : 5000);
    return () => window.clearTimeout(timer);
  }, [item.id, item.tone, onDismiss]);

  return (
    <div
      data-toast
      className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-panel border border-line bg-surface shadow-card p-3.5 shadow-pop animate-[toast-in_180ms_ease-out]"
    >
      <span className={cn("mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full", tone.badge)}>
        <Icon name={tone.icon} size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">{item.title}</p>
        {item.description ? <p className="mt-0.5 text-[13px] text-ink-muted">{item.description}</p> : null}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss"
        className="-mr-1 -mt-1 inline-flex size-7 items-center justify-center rounded-md text-ink-faint hover:text-ink"
      >
        <Icon name="x" size={15} />
      </button>
    </div>
  );
}
