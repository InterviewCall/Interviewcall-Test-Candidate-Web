import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormError } from "@/components/ui/form-error";
import { formatClock } from "@/lib/time";
import type { ExamQuestion } from "./exam-model";
import { HexCell } from "./hex-cell";

function Tile({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-control bg-sunken px-3 py-3.5">
      <span className="font-display text-[1.75rem] font-semibold leading-none">{value}</span>
      <span className="mt-1.5 text-[13px] text-ink-muted">{label}</span>
    </div>
  );
}

/** The last look before the answers are final: what is blank, what is flagged, and a way back to each. */
export function SubmitDialog({
  open,
  questions,
  answers,
  flags,
  remainingSeconds,
  busy,
  error,
  onClose,
  onGoTo,
  onConfirm,
}: {
  open: boolean;
  questions: ExamQuestion[];
  answers: Record<number, number | null>;
  flags: Set<number>;
  remainingSeconds: number;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onGoTo: (index: number) => void;
  onConfirm: () => void;
}) {
  const blank = questions.filter((q) => answers[q.questionVersionId] == null);
  const flagged = questions.filter((q) => flags.has(q.questionVersionId));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      dismissible={!busy}
      title="Submit your test?"
      description={`You have ${formatClock(remainingSeconds)} left. Once you submit, you can’t change your answers.`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Keep working
          </Button>
          <Button onClick={onConfirm} loading={busy} icon="send">
            Submit test
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-3 gap-3">
          <Tile value={questions.length - blank.length} label="Answered" />
          <Tile value={blank.length} label="Not answered" />
          <Tile value={flagged.length} label="Flagged" />
        </div>

        {blank.length > 0 ? (
          <div>
            <p className="mb-2.5 text-sm font-medium">Not answered yet. Tap one to go back to it.</p>
            <div className="flex flex-wrap gap-x-1.5 gap-y-2.5">
              {blank.map((q) => (
                <HexCell
                  key={q.questionVersionId}
                  number={q.index + 1}
                  size={42}
                  state={{ answered: false, current: false, flagged: flags.has(q.questionVersionId) }}
                  onSelect={() => onGoTo(q.index)}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-ink-muted">You have answered every question.</p>
        )}

        <FormError message={error} />
      </div>
    </Dialog>
  );
}
