import { LogoMark } from "@/components/layout/brand";
import { Button, Spinner } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { formatClock } from "@/lib/time";
import type { SaveStatus } from "./use-autosave";
import type { TimeTone } from "./exam-model";

const toneClasses = {
  calm: "bg-primary-tint text-primary",
  warm: "bg-warning-tint text-warning",
  urgent: "bg-danger text-on-danger",
} as const;

const fuseClasses = { calm: "bg-primary", warm: "bg-bar-below", urgent: "bg-danger" } as const;

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "saved") {
    return (
      <span className="hidden items-center gap-1.5 text-[13px] text-ink-muted sm:inline-flex">
        <Icon name="check" size={15} className="text-success" />
        All answers saved
      </span>
    );
  }
  if (status === "saving") {
    return (
      <span className="hidden items-center gap-1.5 text-[13px] text-ink-muted sm:inline-flex">
        <Spinner className="size-3.5" />
        Saving
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-danger">
      <Icon name="wifi" size={15} />
      <span className="hidden sm:inline">Not saved yet, retrying</span>
      <span className="sm:hidden">Retrying</span>
    </span>
  );
}

/**
 * The exam's top bar. The clock lives here and nowhere else, and the fuse under it is the same
 * time drawn as a line, so how much is left can be read without reading a number.
 */
export function ExamBar({
  remainingSeconds,
  totalSeconds,
  tone,
  saveStatus,
  answered,
  total,
  onSubmit,
}: {
  remainingSeconds: number;
  totalSeconds: number;
  tone: TimeTone["tone"];
  saveStatus: SaveStatus;
  answered: number;
  total: number;
  onSubmit: () => void;
}) {
  const share = Math.min(1, Math.max(0, remainingSeconds / totalSeconds));

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <span className="flex items-center gap-3">
          <LogoMark size={34} />
          <span className="hidden font-display text-[17px] font-semibold tracking-tight md:inline">InterviewCall</span>
        </span>

        <div className="flex items-center gap-3 sm:gap-5">
          <SaveIndicator status={saveStatus} />
          <span className="hidden text-[13px] text-ink-muted md:inline">
            {answered} of {total} answered
          </span>
          <span
            role="timer"
            aria-label={`${Math.floor(remainingSeconds / 60)} minutes ${Math.floor(remainingSeconds % 60)} seconds left`}
            data-pulse={tone === "urgent" ? "" : undefined}
            className={cn(
              "inline-flex min-w-[6.25rem] items-center justify-center gap-2 rounded-full px-4 py-2 font-display text-[1.25rem] font-semibold tabular-nums leading-none transition-colors",
              toneClasses[tone],
              tone === "urgent" && "animate-[fuse-pulse_1s_ease-in-out_infinite]",
            )}
          >
            <Icon name="clock" size={18} />
            {formatClock(remainingSeconds)}
          </span>
          <Button size="sm" variant="secondary" icon="send" onClick={onSubmit}>
            <span className="hidden sm:inline">Submit test</span>
            <span className="sm:hidden">Submit</span>
          </Button>
        </div>
      </div>
      <div aria-hidden="true" className="h-1 w-full bg-line">
        <div className={cn("h-full origin-left transition-[background-color] duration-500", fuseClasses[tone])} style={{ width: `${share * 100}%` }} />
      </div>
    </header>
  );
}
