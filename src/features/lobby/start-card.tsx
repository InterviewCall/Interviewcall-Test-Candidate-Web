"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/fields";
import { FormError } from "@/components/ui/form-error";
import { Icon } from "@/components/ui/icon";
import { useStartAttempt } from "@/lib/api/candidate";
import { ApiError } from "@/lib/api/errors";
import type { TestInfo } from "@/lib/api/types";
import { formatTime, formatWait } from "@/lib/time";

function Declaration({ checked, onChange, children }: { checked: boolean; onChange: (value: boolean) => void; children: string }) {
  return (
    <label className="flex items-start gap-3 text-[15px] leading-snug text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-5 shrink-0 accent-[var(--action)]"
      />
      {children}
    </label>
  );
}

/** The one place a candidate starts the clock. It is deliberately plain: two promises, one number, one button. */
export function StartCard({ info, nowMs }: { info: TestInfo; nowMs: number }) {
  const start = useStartAttempt();
  const [years, setYears] = useState("");
  const [ownWork, setOwnWork] = useState(false);
  const [accurate, setAccurate] = useState(false);
  const [touched, setTouched] = useState(false);

  const opensIn = (Date.parse(info.startsAt) - nowMs) / 1000;
  const waiting = info.state === "NOT_OPEN" && opensIn > 0;
  const startByIn = (Date.parse(info.latestStartAt) - nowMs) / 1000;

  const parsed = years.trim() === "" ? NaN : Number(years);
  const yearsInvalid = Number.isNaN(parsed) || parsed < 0 || parsed > 60;
  const showYearsError = touched && yearsInvalid;
  const declared = ownWork && accurate;
  const ready = !waiting && declared && !yearsInvalid;

  function submit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (!ready) return;
    start.mutate({ workExperienceYears: parsed, declarations: { ownWork: true, accurateDetails: true } });
  }

  const error = start.error instanceof ApiError ? start.error.message : touched && !declared ? "Tick both statements to continue." : null;

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5 rounded-panel border border-line bg-surface p-6 shadow-card">
      {waiting ? (
        <div>
          <p className="flex items-center gap-2 text-[13px] font-semibold text-primary">
            <Icon name="clock" size={16} />
            Opens in {formatWait(opensIn)}
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">Not open yet</h2>
          <p className="mt-1.5 text-[15px] text-ink-muted">
            You can start from {formatTime(info.startsAt)} IST. This page opens the test by itself, so you can leave it here.
          </p>
        </div>
      ) : (
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Ready when you are</h2>
          <p className="mt-1.5 text-[15px] text-ink-muted">
            You will have {info.durationMinutes} minutes from the moment you press Start.
            {startByIn > 0 && startByIn < 3600 ? ` Start within ${formatWait(startByIn)}, by ${formatTime(info.latestStartAt)}.` : ` Start by ${formatTime(info.latestStartAt)}.`}
          </p>
        </div>
      )}

      <TextField
        label="Years of work experience"
        type="number"
        inputMode="decimal"
        min={0}
        max={60}
        step={0.5}
        placeholder="0"
        value={years}
        onChange={(event) => setYears(event.target.value)}
        onBlur={() => setTouched(true)}
        hint="Enter 0 if you are a fresher."
        error={showYearsError ? "Enter a number between 0 and 60." : undefined}
        disabled={waiting}
      />

      <fieldset disabled={waiting} className="flex flex-col gap-3 border-0 p-0 disabled:opacity-60">
        <legend className="sr-only">Declarations</legend>
        <Declaration checked={ownWork} onChange={setOwnWork}>
          I will do this test on my own, without help.
        </Declaration>
        <Declaration checked={accurate} onChange={setAccurate}>
          The details I have given are accurate.
        </Declaration>
      </fieldset>

      <FormError message={error} />

      <div>
        <Button type="submit" loading={start.isPending} disabled={waiting} className="h-12 w-full text-base">
          {waiting ? "Opens soon" : "Start the test"}
        </Button>
        {!waiting ? <p className="mt-2.5 text-center text-[13px] text-ink-muted">The {info.durationMinutes}-minute clock starts straight away.</p> : null}
      </div>
    </form>
  );
}
