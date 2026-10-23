"use client";

import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/icon";

/** Where anyone lands who did not come through their invitation email. */
export function OpenYourLink() {
  const ended = useSearchParams().get("ended") === "1";

  return (
    <div>
      <h1 className="font-display text-[2rem] font-semibold leading-tight tracking-tight">
        {ended ? "Your session has ended" : "Open your test link"}
      </h1>
      <p className="mt-3 text-ink-muted">
        {ended
          ? "For your privacy we signed you out. Open the link in your invitation email again to carry on."
          : "Your test opens from the link in the invitation email we sent you. Click it, confirm your email address, and you are in."}
      </p>

      <div className="mt-8 flex items-start gap-3 rounded-panel border border-line bg-surface p-4 shadow-card">
        <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-tint text-primary">
          <Icon name="info" size={17} />
        </span>
        <p className="text-[15px] text-ink-muted">
          Can’t find the email, or your link says it has expired? Ask your advisor to reschedule your test. They will send you a new link.
        </p>
      </div>
    </div>
  );
}
