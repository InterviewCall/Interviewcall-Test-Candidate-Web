import type { ExamQuestion } from "./exam-model";
import { HexCell } from "./hex-cell";
import { Icon } from "@/components/ui/icon";

function Key({ children, className }: { children: string; className: string }) {
  return (
    <span className="flex items-center gap-2 text-[13px] text-ink-muted">
      <span aria-hidden="true" className={`size-3.5 clip-hex-pointy ${className}`} />
      {children}
    </span>
  );
}

/** Every question as a hexagon, grouped by topic. Tap one to jump there. */
export function QuestionMap({
  questions,
  answers,
  flags,
  currentIndex,
  onSelect,
}: {
  questions: ExamQuestion[];
  answers: Record<number, number | null>;
  flags: Set<number>;
  currentIndex: number;
  onSelect: (index: number) => void;
}) {
  const topics = [...new Set(questions.map((q) => q.topic))];

  return (
    <div className="flex flex-col gap-5">
      {topics.map((topic) => (
        <section key={topic} aria-label={topic}>
          <h3 className="mb-2.5 text-[13px] font-semibold text-ink">{topic}</h3>
          <div className="flex flex-wrap gap-x-1.5 gap-y-2.5">
            {questions
              .filter((q) => q.topic === topic)
              .map((q) => (
                <HexCell
                  key={q.questionVersionId}
                  number={q.index + 1}
                  state={{
                    answered: answers[q.questionVersionId] != null,
                    current: q.index === currentIndex,
                    flagged: flags.has(q.questionVersionId),
                  }}
                  onSelect={() => onSelect(q.index)}
                />
              ))}
          </div>
        </section>
      ))}

      <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-line pt-4">
        <Key className="bg-primary">Answered</Key>
        <Key className="bg-line-strong">Not answered</Key>
        <span className="flex items-center gap-2 text-[13px] text-ink-muted">
          <span aria-hidden="true" className="inline-flex size-3.5 items-center justify-center rounded-full bg-bar-below text-white">
            <Icon name="flag" size={8} filled />
          </span>
          Flagged
        </span>
      </div>
    </div>
  );
}
