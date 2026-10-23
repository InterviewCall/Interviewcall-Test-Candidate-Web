"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { saveAnswer } from "@/lib/api/candidate";
import { ApiError } from "@/lib/api/errors";

export type SaveStatus = "saved" | "saving" | "retrying";

/**
 * Saves each choice the moment it is made, and keeps trying if the network drops.
 *
 * The screen always shows the candidate's latest choice. This hook's job is to make the server agree:
 * it remembers what it last saved per question, and re-sends whatever differs, backing off between
 * failures. A choice changed while an earlier save is still in flight is sent again afterwards, so
 * the last click always wins.
 */
export function useAutosave(initial: Record<number, number | null>, onClosed: () => void) {
  const desired = useRef(new Map<number, number | null>());
  const confirmed = useRef(new Map<number, number | null>(Object.entries(initial).map(([id, value]) => [Number(id), value])));
  const inflight = useRef(new Set<number>());
  const failures = useRef(0);
  const retryTimer = useRef<number | undefined>(undefined);
  const closed = useRef(onClosed);
  const pumpRef = useRef<() => void>(() => {});
  const [status, setStatus] = useState<SaveStatus>("saved");

  useEffect(() => {
    closed.current = onClosed;
  }, [onClosed]);

  const isDirty = useCallback(() => {
    for (const [id, value] of desired.current) {
      if (confirmed.current.get(id) !== value) return true;
    }
    return false;
  }, []);

  const refresh = useCallback(() => {
    setStatus(!isDirty() && inflight.current.size === 0 ? "saved" : failures.current > 0 ? "retrying" : "saving");
  }, [isDirty]);

  const pump = useCallback(() => {
    window.clearTimeout(retryTimer.current);
    for (const [id, value] of desired.current) {
      if (inflight.current.has(id) || confirmed.current.get(id) === value) continue;
      inflight.current.add(id);
      saveAnswer(id, value)
        .then(() => {
          confirmed.current.set(id, value);
          failures.current = 0;
        })
        .catch((error: unknown) => {
          // The test has ended. Nothing more can be saved, so hand over to the screen.
          if (error instanceof ApiError && error.status === 409) {
            desired.current.clear();
            closed.current();
            return;
          }
          if (error instanceof ApiError && error.status === 401) return; // The global handler sends them back to their link.
          failures.current += 1;
          retryTimer.current = window.setTimeout(() => pumpRef.current(), Math.min(1500 * 2 ** (failures.current - 1), 10_000));
        })
        .finally(() => {
          inflight.current.delete(id);
          if (isDirty() && failures.current === 0) pumpRef.current();
          refresh();
        });
    }
    refresh();
  }, [isDirty, refresh]);

  useEffect(() => {
    pumpRef.current = pump;
  }, [pump]);

  const select = useCallback(
    (questionVersionId: number, optionId: number | null) => {
      desired.current.set(questionVersionId, optionId);
      pump();
    },
    [pump],
  );

  /** Resolves true once everything chosen so far is on the server, or false if that takes longer than `timeoutMs`. */
  const flush = useCallback(
    (timeoutMs: number) =>
      new Promise<boolean>((resolve) => {
        if (!isDirty() && inflight.current.size === 0) return resolve(true);
        failures.current = 0;
        pump();
        const started = Date.now();
        const id = window.setInterval(() => {
          const clean = !isDirty() && inflight.current.size === 0;
          if (clean || Date.now() - started > timeoutMs) {
            window.clearInterval(id);
            resolve(clean);
          }
        }, 100);
      }),
    [isDirty, pump],
  );

  useEffect(() => {
    const retryNow = () => {
      failures.current = 0;
      pump();
    };
    const warn = (event: BeforeUnloadEvent) => {
      if (isDirty() || inflight.current.size > 0) event.preventDefault();
    };
    window.addEventListener("online", retryNow);
    window.addEventListener("beforeunload", warn);
    return () => {
      window.removeEventListener("online", retryNow);
      window.removeEventListener("beforeunload", warn);
      window.clearTimeout(retryTimer.current);
    };
  }, [isDirty, pump]);

  return { status, select, flush };
}
