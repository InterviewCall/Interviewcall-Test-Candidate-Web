"use client";

import { Icon } from "@/components/ui/icon";
import type { TestInfo } from "@/lib/api/types";
import { PortalHeader } from "@/features/portal/portal-header";
import { FeedbackForm } from "./feedback-form";

/** Shown once the answers are in. There is no score here on purpose: the result goes to the advisor. */
export function DoneScreen({ info }: { info: TestInfo }) {
  const first = info.candidate.fullName.split(" ")[0];

  return (
    <div className="flex min-h-dvh flex-col">
      <PortalHeader name={info.candidate.fullName} />

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6 sm:py-16">
        <section className="relative overflow-hidden rounded-sheet bg-brand p-8 text-center text-white shadow-pop sm:p-10">
          <span className="mx-auto grid size-20 place-items-center bg-highlighter text-on-highlighter clip-hex-pointy">
            <Icon name="check" size={34} />
          </span>
          <h1 className="mt-6 font-display text-[2.25rem] font-semibold leading-tight tracking-tight">Test submitted</h1>
          <p className="mx-auto mt-3 max-w-sm text-rail-ink">
            Thank you, {first}. Your answers are in. Your advisor will take it from here, and you can close this page.
          </p>
        </section>

        <FeedbackForm />
      </main>
    </div>
  );
}
