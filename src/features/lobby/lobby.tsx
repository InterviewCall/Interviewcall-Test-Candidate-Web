"use client";

import { useEffect } from "react";
import { Icon } from "@/components/ui/icon";
import { Markdown } from "@/components/ui/markdown";
import { serverOffsetMs, useServerNow } from "@/lib/clock";
import { useTestInfo } from "@/lib/api/candidate";
import type { TestInfo } from "@/lib/api/types";
import { formatDay, formatTime } from "@/lib/time";
import { PortalHeader } from "@/features/portal/portal-header";
import { StartCard } from "./start-card";

const levelLabel = { INTERMEDIATE: "Intermediate", ADVANCED: "Advanced" } as const;

const rules = [
  "The clock starts when you press Start and runs on our server. Refreshing or closing the page does not pause it.",
  "You see one question at a time. Choose an option and it saves straight away. You can change your answer until you submit.",
  "Use the question map to jump around, and flag a question to come back to it.",
  "Questions you leave blank score zero. Nothing is taken off for a wrong answer.",
  "When time runs out, your answers are submitted for you.",
  "If you lose connection, open your link again before your slot ends and carry on where you left off.",
];

function Fact({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-l border-white/20 pl-4 first:border-l-0 first:pl-0">
      <dd className="font-display text-[1.75rem] font-semibold leading-none tracking-tight">{value}</dd>
      <dt className="text-[13px] text-rail-ink">{label}</dt>
    </div>
  );
}

/** Everything a candidate needs before pressing Start: what the test is, the rules, and the start card. */
export function Lobby({ info }: { info: TestInfo }) {
  const query = useTestInfo();
  const offset = serverOffsetMs(info.serverTime, query.dataUpdatedAt);
  const now = useServerNow(offset);
  const first = info.candidate.fullName.split(" ")[0];

  // The moment the test opens, or the last start time passes, ask the server again instead of guessing.
  const opensAt = Date.parse(info.startsAt);
  const lastStart = Date.parse(info.latestStartAt);
  const { refetch } = query;
  useEffect(() => {
    const targets = [opensAt, lastStart].filter((t) => t > Date.now() + offset);
    const timers = targets.map((t) => window.setTimeout(() => void refetch(), t - (Date.now() + offset) + 400));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [opensAt, lastStart, offset, refetch]);

  const sections = info.test?.sections ?? [];
  const questionCount = info.test?.questionCount ?? 0;

  return (
    <div className="flex min-h-dvh flex-col">
      <PortalHeader name={info.candidate.fullName} />

      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-4 py-6 pb-28 sm:px-6 sm:py-8 lg:pb-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <section className="relative overflow-hidden rounded-sheet bg-brand p-6 text-white shadow-pop sm:p-9">
            <span className="inline-flex items-center gap-2 rounded-full bg-highlighter px-3 py-1 text-[13px] font-semibold text-on-highlighter">
              {levelLabel[info.level]} assessment
            </span>
            <h1 className="mt-5 font-display text-[2.4rem] font-semibold leading-[1.05] tracking-tight sm:text-[3rem]">Welcome, {first}</h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-rail-ink">
              <Icon name="calendar" size={17} />
              {formatDay(info.startsAt)}, {formatTime(info.startsAt)} to {formatTime(info.endsAt)} IST
            </p>

            <dl className="mt-8 flex flex-wrap gap-x-6 gap-y-4">
              <Fact value={`${info.durationMinutes} min`} label="to answer everything" />
              {questionCount > 0 ? <Fact value={String(questionCount)} label="questions" /> : null}
              {sections.length > 0 ? <Fact value={String(sections.length)} label={sections.length === 1 ? "topic" : "topics"} /> : null}
            </dl>
          </section>

          <section className="rounded-panel border border-line bg-surface p-6 shadow-card sm:p-7">
            <h2 className="font-display text-xl font-semibold tracking-tight">Before you begin</h2>
            {info.test?.instructionsMd ? <Markdown className="mt-3 text-ink-muted">{info.test.instructionsMd}</Markdown> : null}
            <ul className="mt-4 flex flex-col gap-3">
              {rules.map((rule) => (
                <li key={rule} className="flex items-start gap-3 text-[15px] leading-relaxed text-ink-muted">
                  <span aria-hidden="true" className="mt-[7px] size-2.5 shrink-0 bg-primary clip-hex" />
                  {rule}
                </li>
              ))}
            </ul>
          </section>

          {sections.length > 0 ? (
            <section className="rounded-panel border border-line bg-surface p-6 shadow-card sm:p-7">
              <h2 className="font-display text-xl font-semibold tracking-tight">What’s in the test</h2>
              <p className="mt-1 text-[15px] text-ink-muted">Questions are grouped by topic and shuffled within each topic.</p>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {sections.map((s) => (
                  <li key={s.topic} className="flex items-center justify-between gap-3 rounded-control bg-sunken px-4 py-3">
                    <span className="font-medium">{s.topic}</span>
                    <span className="shrink-0 text-[13px] text-ink-muted">
                      {s.questions} {s.questions === 1 ? "question" : "questions"}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside id="start" className="scroll-mt-4 lg:sticky lg:top-6">
          <StartCard info={info} nowMs={now} />
        </aside>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 p-3 backdrop-blur lg:hidden">
        <a
          href="#start"
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-control bg-action text-base font-medium text-on-action shadow-[0_8px_16px_-8px_var(--action)]"
        >
          {info.state === "NOT_OPEN" ? "See when it opens" : "Ready to start"}
          <Icon name="arrow-right" size={18} />
        </a>
      </div>
    </div>
  );
}

