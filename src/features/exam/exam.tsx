"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Markdown } from "@/components/ui/markdown";
import { attemptKey, testKey, useSubmitAttempt } from "@/lib/api/candidate";
import { ApiError } from "@/lib/api/errors";
import type { Attempt } from "@/lib/api/types";
import { useServerNow } from "@/lib/clock";
import { cn } from "@/lib/cn";
import { CodePanel } from "./code-panel";
import { ExamBar } from "./exam-bar";
import { flattenAttempt, optionLetter, timeTone } from "./exam-model";
import { OptionCard } from "./option-card";
import { QuestionMap } from "./question-map";
import { SubmitDialog } from "./submit-dialog";
import { useAutosave } from "./use-autosave";

type Phase = "working" | "timeup";

/** Flags and the current question survive a refresh. Per tab, per attempt, and never needed for correctness. */
function useRemembered<T>(key: string, initial: T, revive: (raw: unknown) => T, store: (value: T) => unknown) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.sessionStorage.getItem(key);
      return raw ? revive(JSON.parse(raw)) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(store(value)));
    } catch {
      /* Storage can be blocked. The exam works without it. */
    }
  }, [key, value, store]);
  return [value, setValue] as const;
}

const storeSet = (value: Set<number>) => [...value];
const reviveSet = (raw: unknown) => new Set(Array.isArray(raw) ? raw.filter((n): n is number => typeof n === "number") : []);
const storeText = (value: string) => value;
const reviveText = (raw: unknown) => (typeof raw === "string" ? raw : "");
const storeNumber = (value: number) => value;
const reviveNumber = (raw: unknown) => (typeof raw === "number" ? raw : 0);

export function Exam({ attempt, offsetMs, candidateName }: { attempt: Attempt; offsetMs: number; candidateName: string }) {
  const queryClient = useQueryClient();
  const questions = useMemo(() => flattenAttempt(attempt), [attempt]);
  const submit = useSubmitAttempt();
  const storageKey = `ic-exam-${attempt.startedAt}`;

  const [answers, setAnswers] = useState<Record<number, number | null>>(() =>
    Object.fromEntries(questions.map((q) => [q.questionVersionId, q.selectedOptionId])),
  );
  const [flags, setFlags] = useRemembered(`${storageKey}-flags`, new Set<number>(), reviveSet, storeSet);
  const firstBlank = Math.max(0, questions.findIndex((q) => q.selectedOptionId == null));
  const [current, setCurrent] = useRemembered(`${storageKey}-at`, firstBlank, reviveNumber, storeNumber);
  const index = Math.min(Math.max(current, 0), questions.length - 1);
  const question = questions[index];

  // The language they read code in. Remembered, and shared by every question that has code.
  const [language, setLanguage] = useRemembered("ic-exam-language", "cpp", reviveText, storeText);

  const [phase, setPhase] = useState<Phase>("working");
  const [mapOpen, setMapOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const cardRef = useRef<HTMLElement>(null);

  const finish = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: testKey });
    queryClient.removeQueries({ queryKey: attemptKey });
  }, [queryClient]);

  const { status: saveStatus, select, flush } = useAutosave(
    useMemo(() => Object.fromEntries(questions.map((q) => [q.questionVersionId, q.selectedOptionId])), [questions]),
    finish,
  );

  // The clock: the server's time, read four times a second.
  const now = useServerNow(offsetMs, 250);
  const deadline = Date.parse(attempt.deadlineAt);
  const totalSeconds = Math.max(1, (deadline - Date.parse(attempt.startedAt)) / 1000);
  const remaining = Math.max(0, (deadline - now) / 1000);
  const { tone, announcement } = timeTone(remaining);

  // Everything is final once this runs, one way or the other: save what is pending, then hand in.
  const handIn = useCallback(
    async (patientMs: number) => {
      await flush(patientMs);
      try {
        await submit.mutateAsync();
      } catch (error) {
        // Already handed in by the server (time ran out first) is the same outcome.
        if (error instanceof ApiError && error.status === 409) return finish();
        throw error;
      }
    },
    [flush, submit, finish],
  );

  const timeUpStarted = useRef(false);
  const [timeUpError, setTimeUpError] = useState(false);
  const runTimeUp = useCallback(() => {
    setTimeUpError(false);
    handIn(3000).catch(() => setTimeUpError(true));
  }, [handIn]);
  useEffect(() => {
    if (remaining > 0 || timeUpStarted.current) return;
    timeUpStarted.current = true;
    setPhase("timeup");
    setReviewOpen(false);
    setMapOpen(false);
    runTimeUp();
  }, [remaining, runTimeUp]);

  const confirmSubmit = useCallback(async () => {
    setBusy(true);
    setSubmitError(null);
    const saved = await flush(8000);
    if (!saved) {
      setBusy(false);
      setSubmitError("Your latest answers haven’t reached us yet. Check your connection and try again. Your time is still running.");
      return;
    }
    try {
      await handIn(0);
    } catch (error) {
      setBusy(false);
      setSubmitError(error instanceof ApiError ? error.message : "We couldn’t submit just now. Try again.");
    }
  }, [flush, handIn]);

  const choose = useCallback(
    (optionId: number | null) => {
      if (!question || phase !== "working") return;
      setAnswers((a) => ({ ...a, [question.questionVersionId]: optionId }));
      select(question.questionVersionId, optionId);
    },
    [question, phase, select],
  );

  const toggleFlag = useCallback(() => {
    if (!question) return;
    setFlags((f) => {
      const next = new Set(f);
      if (next.has(question.questionVersionId)) next.delete(question.questionVersionId);
      else next.add(question.questionVersionId);
      return next;
    });
  }, [question, setFlags]);

  const goTo = useCallback(
    (to: number) => {
      setCurrent(Math.min(Math.max(to, 0), questions.length - 1));
      setMapOpen(false);
      setReviewOpen(false);
    },
    [setCurrent, questions.length],
  );

  // Back to the top of the question whenever it changes.
  useEffect(() => {
    window.scrollTo({ top: 0 });
    cardRef.current?.focus({ preventScroll: true });
  }, [index]);

  // Keyboard: arrows to move, letters or numbers to choose, F to flag.
  useEffect(() => {
    if (!question || phase !== "working" || mapOpen || reviewOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement;
      if (target.closest("input, textarea, select, dialog")) return;
      const key = event.key.toLowerCase();
      if (key === "arrowright") goTo(index + 1);
      else if (key === "arrowleft") goTo(index - 1);
      else if (key === "f") toggleFlag();
      else {
        const byLetter = key.length === 1 && key >= "a" && key <= "z" ? key.charCodeAt(0) - 97 : -1;
        const byNumber = key.length === 1 && key >= "1" && key <= "9" ? Number(key) - 1 : -1;
        const option = question.options[byLetter >= 0 ? byLetter : byNumber];
        if (!option) return;
        choose(option.id);
      }
      event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [question, phase, mapOpen, reviewOpen, index, goTo, toggleFlag, choose]);

  if (!question) return null;

  const answeredCount = questions.filter((q) => answers[q.questionVersionId] != null).length;
  const selected = answers[question.questionVersionId];
  const flagged = flags.has(question.questionVersionId);
  const last = index === questions.length - 1;

  return (
    <div className="flex min-h-dvh flex-col pb-24 lg:pb-0">
      <ExamBar
        remainingSeconds={remaining}
        totalSeconds={totalSeconds}
        tone={tone}
        saveStatus={saveStatus}
        answered={answeredCount}
        total={questions.length}
        onSubmit={() => setReviewOpen(true)}
      />
      <p className="sr-only" aria-live="assertive">
        {announcement}
      </p>

      {saveStatus === "retrying" ? (
        <div role="status" className="sticky top-[68px] z-20 border-b border-danger/20 bg-danger-tint px-4 py-2.5 text-center text-sm text-danger">
          We can’t reach the server right now. Keep going: your answers save once you are back online. The clock keeps running.
        </div>
      ) : null}

      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
        <main ref={cardRef} tabIndex={-1} style={{ outline: "none" }} className="flex min-w-0 flex-col gap-5" aria-label={`Question ${index + 1} of ${questions.length}`}>
          <article key={question.questionVersionId} data-rise className="animate-[rise-in_220ms_ease-out] rounded-sheet border border-line bg-surface p-5 shadow-card sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-display text-lg font-semibold tracking-tight">
                  Question {index + 1} <span className="font-normal text-ink-faint">of {questions.length}</span>
                </span>
                <span className="rounded-full bg-primary-tint px-3 py-1 text-[13px] font-medium text-primary">{question.topic}</span>
              </div>
              <button
                type="button"
                onClick={toggleFlag}
                aria-pressed={flagged}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-[13px] font-medium transition-colors motion-reduce:transition-none",
                  flagged ? "border-bar-below bg-warning-tint text-warning" : "border-line-strong text-ink-muted hover:bg-sunken hover:text-ink",
                )}
              >
                <Icon name="flag" size={15} filled={flagged} />
                {flagged ? "Flagged for review" : "Flag for review"}
              </button>
            </div>

            <Markdown className="mt-6 max-w-[72ch] text-ink">{question.statementMd}</Markdown>

            {question.stubs.length > 0 ? <CodePanel stubs={question.stubs} language={language} onLanguage={setLanguage} /> : null}

            <div role="radiogroup" aria-label="Answer choices" className="mt-7 flex flex-col gap-3">
              {question.options.map((option, i) => (
                <OptionCard key={option.id} index={i} text={option.textMd} checked={selected === option.id} onChoose={() => choose(option.id)} />
              ))}
            </div>

            <div className="mt-5 flex min-h-8 items-center justify-between gap-3">
              <p className="hidden text-[13px] text-ink-faint md:block">
                Press {optionLetter(0)} to {optionLetter(Math.max(0, question.options.length - 1))} to choose, and the arrow keys to move.
              </p>
              {selected != null ? (
                <Button variant="ghost" size="sm" onClick={() => choose(null)} className="ml-auto">
                  Clear my answer
                </Button>
              ) : null}
            </div>
          </article>

          <nav aria-label="Move between questions" className="hidden items-center justify-between gap-3 lg:flex">
            <Button variant="secondary" icon="arrow-left" onClick={() => goTo(index - 1)} disabled={index === 0}>
              Previous
            </Button>
            {last ? (
              <Button icon="send" onClick={() => setReviewOpen(true)}>
                Review and submit
              </Button>
            ) : (
              <Button onClick={() => goTo(index + 1)}>
                Next
                <Icon name="arrow-right" size={17} />
              </Button>
            )}
          </nav>
        </main>

        <aside className="hidden lg:sticky lg:top-24 lg:block" aria-label="Question map">
          <div className="rounded-panel border border-line bg-surface p-5 shadow-card">
            <h2 className="mb-4 font-display text-base font-semibold tracking-tight">Your questions</h2>
            <QuestionMap questions={questions} answers={answers} flags={flags} currentIndex={index} onSelect={goTo} />
          </div>
          <p className="mt-3 px-1 text-[13px] text-ink-faint">Taking the test as {candidateName}.</p>
        </aside>
      </div>

      <nav
        aria-label="Move between questions"
        className="fixed inset-x-0 bottom-0 z-20 flex items-center gap-2 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur lg:hidden"
      >
        <Button variant="secondary" onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="Previous question" className="w-12 px-0">
          <Icon name="arrow-left" size={18} />
        </Button>
        <Button variant="secondary" icon="map" onClick={() => setMapOpen(true)} className="flex-1">
          {answeredCount} of {questions.length} answered
        </Button>
        {last ? (
          <Button onClick={() => setReviewOpen(true)} icon="send">
            Submit
          </Button>
        ) : (
          <Button onClick={() => goTo(index + 1)} aria-label="Next question" className="w-12 px-0">
            <Icon name="arrow-right" size={18} />
          </Button>
        )}
      </nav>

      <Dialog open={mapOpen} onClose={() => setMapOpen(false)} title="Your questions" description="Tap a hexagon to jump to that question.">
        <QuestionMap questions={questions} answers={answers} flags={flags} currentIndex={index} onSelect={goTo} />
      </Dialog>

      <SubmitDialog
        open={reviewOpen && phase === "working"}
        questions={questions}
        answers={answers}
        flags={flags}
        remainingSeconds={remaining}
        busy={busy}
        error={submitError}
        onClose={() => {
          setReviewOpen(false);
          setSubmitError(null);
        }}
        onGoTo={goTo}
        onConfirm={confirmSubmit}
      />

      {phase === "timeup" ? (
        <div role="alertdialog" aria-labelledby="timeup-title" className="fixed inset-0 z-50 flex items-center justify-center bg-brand p-6 text-white">
          <div className="flex max-w-md flex-col items-center text-center">
            <span className="grid size-20 place-items-center bg-highlighter text-on-highlighter clip-hex-pointy">
              <Icon name="clock" size={32} />
            </span>
            <h2 id="timeup-title" className="mt-7 font-display text-[2.25rem] font-semibold leading-tight tracking-tight">
              Time is up
            </h2>
            <p className="mt-3 text-rail-ink">
              {timeUpError ? "We couldn’t reach the server to hand in your answers. Your saved answers are safe, and they are handed in for you as soon as you are back online." : "We are handing in your answers now. This takes a moment."}
            </p>
            {timeUpError ? (
              <Button variant="secondary" className="mt-6" onClick={runTimeUp}>
                Try again
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
