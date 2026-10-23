import { Icon } from "@/components/ui/icon";

/** The slot is over or the test has expired. Only an advisor or admin can open it again, with a new link. */
export function ClosedNotice() {
  return (
    <div>
      <span className="inline-flex size-12 items-center justify-center rounded-full bg-warning-tint text-warning">
        <Icon name="calendar" size={24} />
      </span>
      <h1 className="mt-6 font-display text-[2rem] font-semibold leading-tight tracking-tight">This test is closed</h1>
      <p className="mt-3 text-ink-muted">
        Your slot has ended, so this link no longer opens the test. Your advisor can reschedule it and send you a new link. If you have already submitted your test, there is nothing more to do.
      </p>
    </div>
  );
}
