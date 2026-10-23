"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { attemptKey, testKey, useAttempt } from "@/lib/api/candidate";
import { ApiError } from "@/lib/api/errors";
import type { TestInfo } from "@/lib/api/types";
import { serverOffsetMs } from "@/lib/clock";
import { Exam } from "./exam";

/** Loads the attempt (questions, saved answers, the server's deadline) and hands it to the exam. */
export function ExamScreen({ info }: { info: TestInfo }) {
  const attempt = useAttempt(true);
  const queryClient = useQueryClient();

  // The attempt ended while this page was open (time ran out on the server): the test info now says so.
  const submitted = attempt.data?.status === "SUBMITTED";
  useEffect(() => {
    if (submitted) void queryClient.invalidateQueries({ queryKey: testKey });
  }, [submitted, queryClient]);

  if (attempt.data && attempt.data.status === "IN_PROGRESS") {
    return (
      <Exam
        key={attempt.data.startedAt}
        attempt={attempt.data}
        offsetMs={serverOffsetMs(attempt.data.serverTime, attempt.dataUpdatedAt)}
        candidateName={info.candidate.fullName}
      />
    );
  }

  if (attempt.error) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6">
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-danger-tint text-danger">
          <Icon name="alert" size={24} />
        </span>
        <h1 className="mt-6 font-display text-[1.75rem] font-semibold tracking-tight">We couldn’t load your questions</h1>
        <p className="mt-3 text-ink-muted">
          {attempt.error instanceof ApiError ? attempt.error.message : "Something went wrong."} Your clock is still running, so try again now.
        </p>
        <div className="mt-6">
          <Button
            onClick={() => {
              void queryClient.invalidateQueries({ queryKey: attemptKey });
            }}
            loading={attempt.isFetching}
          >
            Try again
          </Button>
        </div>
      </main>
    );
  }

  return (
    <div aria-busy="true" aria-label="Loading your questions" className="min-h-dvh">
      <div className="h-[68px] border-b border-line bg-surface" />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <Skeleton className="h-96 rounded-sheet" />
        <Skeleton className="hidden h-72 rounded-panel lg:block" />
      </div>
    </div>
  );
}
