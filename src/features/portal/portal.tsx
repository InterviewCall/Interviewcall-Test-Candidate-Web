"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LogoMark } from "@/components/layout/brand";
import { Icon } from "@/components/ui/icon";
import { useTestInfo } from "@/lib/api/candidate";
import { ApiError } from "@/lib/api/errors";
import { ClosedNotice } from "@/features/gate/closed-notice";
import { DoneScreen } from "@/features/done/done-screen";
import { ExamScreen } from "@/features/exam/exam-screen";
import { Lobby } from "@/features/lobby/lobby";
import { PortalHeader } from "./portal-header";

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <PortalHeader />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-16">{children}</main>
    </div>
  );
}

function PortalSkeleton() {
  return (
    <div className="flex min-h-dvh flex-col" aria-busy="true" aria-label="Loading your test">
      <div className="flex h-16 items-center border-b border-line bg-surface px-6">
        <LogoMark size={36} />
      </div>
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-60 rounded-sheet" />
          <Skeleton className="h-56 rounded-panel" />
        </div>
        <Skeleton className="h-80 rounded-panel" />
      </div>
    </div>
  );
}

/** Decides what the candidate sees from where they are in the test. The server is the source of truth. */
export function Portal() {
  const info = useTestInfo();

  if (info.data) {
    switch (info.data.state) {
      case "IN_PROGRESS":
        return <ExamScreen info={info.data} />;
      case "SUBMITTED":
        return <DoneScreen info={info.data} />;
      default:
        return <Lobby info={info.data} />;
    }
  }

  if (info.isPending) return <PortalSkeleton />;

  const error = info.error;
  if (error instanceof ApiError && error.status === 403 && error.code === "TEST_CLOSED") {
    return (
      <Centered>
        <ClosedNotice />
      </Centered>
    );
  }

  return (
    <Centered>
      <span className="inline-flex size-12 items-center justify-center rounded-full bg-danger-tint text-danger">
        <Icon name="alert" size={24} />
      </span>
      <h1 className="mt-6 font-display text-[1.75rem] font-semibold leading-tight tracking-tight">We couldn’t load your test</h1>
      <p className="mt-3 text-ink-muted">{error instanceof ApiError ? error.message : "Something went wrong."}</p>
      <div className="mt-6">
        <Button onClick={() => info.refetch()} loading={info.isFetching}>
          Try again
        </Button>
      </div>
    </Centered>
  );
}
