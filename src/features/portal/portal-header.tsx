"use client";

import { LogoMark } from "@/components/layout/brand";
import { Button } from "@/components/ui/button";
import { useEndSession } from "@/lib/api/candidate";
import { hardNavigate } from "@/lib/navigation";

/** The top bar on the lobby and the done page. The exam has its own, so nothing here can be hit by accident mid-test. */
export function PortalHeader({ name }: { name?: string }) {
  const end = useEndSession();
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <span className="flex items-center gap-3">
          <LogoMark size={36} />
          <span className="font-display text-[17px] font-semibold tracking-tight">InterviewCall</span>
        </span>
        <span className="flex items-center gap-3">
          {name ? <span className="hidden text-sm text-ink-muted sm:inline">{name}</span> : null}
          <Button
            variant="ghost"
            size="sm"
            icon="logout"
            loading={end.isPending}
            onClick={() => end.mutate(undefined, { onSettled: () => hardNavigate("/") })}
          >
            Sign out
          </Button>
        </span>
      </div>
    </header>
  );
}
