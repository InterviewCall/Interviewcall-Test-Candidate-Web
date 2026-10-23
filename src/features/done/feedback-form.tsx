"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Icon } from "@/components/ui/icon";
import { useSendFeedback } from "@/lib/api/candidate";
import { ApiError } from "@/lib/api/errors";
import { cn } from "@/lib/cn";

const labels = ["Poor", "Fair", "Good", "Very good", "Excellent"];
const MAX = 1000;

function alreadySent(): boolean {
  try {
    return window.sessionStorage.getItem("ic-feedback-sent") === "1";
  } catch {
    return false;
  }
}

/** Optional, and quick: one tap for how it went, one box for anything else. */
export function FeedbackForm() {
  const send = useSendFeedback();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(alreadySent);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (rating === 0) return;
    send.mutate(
      { rating, comment: comment.trim() || undefined },
      {
        onSuccess: () => {
          setSent(true);
          try {
            window.sessionStorage.setItem("ic-feedback-sent", "1");
          } catch {
            /* Not worth failing over. */
          }
        },
      },
    );
  }

  if (sent) {
    return (
      <section className="flex items-center gap-3 rounded-panel border border-line bg-surface p-5 shadow-card" role="status">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-success-tint text-success">
          <Icon name="check" size={18} />
        </span>
        <p className="text-[15px]">Thanks for letting us know how it went.</p>
      </section>
    );
  }

  const shown = hover || rating;
  const error = send.error instanceof ApiError ? send.error.message : null;

  return (
    <form onSubmit={submit} className="rounded-panel border border-line bg-surface p-6 shadow-card">
      <h2 className="font-display text-xl font-semibold tracking-tight">How was the test experience?</h2>
      <p className="mt-1 text-[15px] text-ink-muted">This is about the platform, not your answers. It takes ten seconds.</p>

      <div role="radiogroup" aria-label="Rating" className="mt-5 flex items-center gap-1.5" onMouseLeave={() => setHover(0)}>
        {labels.map((label, i) => {
          const value = i + 1;
          return (
            <button
              key={label}
              type="button"
              role="radio"
              aria-checked={rating === value}
              aria-label={`${value} out of 5, ${label}`}
              onClick={() => setRating(value)}
              onMouseEnter={() => setHover(value)}
              className={cn("rounded-md p-1 transition-colors motion-reduce:transition-none", value <= shown ? "text-bar-below" : "text-line-strong")}
            >
              <Icon name="star" size={34} filled={value <= shown} />
            </button>
          );
        })}
        <span className="ml-2 min-w-20 text-sm font-medium text-ink-muted" aria-hidden="true">
          {shown ? labels[shown - 1] : ""}
        </span>
      </div>

      <label htmlFor="feedback-comment" className="mt-5 block text-[13px] font-medium">
        Anything we should know? <span className="font-normal text-ink-muted">(optional)</span>
      </label>
      <textarea
        id="feedback-comment"
        value={comment}
        maxLength={MAX}
        rows={3}
        onChange={(event) => setComment(event.target.value)}
        className="mt-1.5 w-full resize-y rounded-control border border-line-strong bg-surface px-3.5 py-3 text-base text-ink placeholder:text-ink-faint focus-visible:border-ink focus-visible:outline-offset-0"
        placeholder="Tell us what worked and what didn’t."
      />
      <p className="mt-1 text-right text-xs text-ink-faint">
        {comment.length} / {MAX}
      </p>

      <div className="mt-3 flex flex-col gap-3">
        <FormError message={error} />
        <Button type="submit" disabled={rating === 0} loading={send.isPending} className="self-start">
          Send feedback
        </Button>
      </div>
    </form>
  );
}
