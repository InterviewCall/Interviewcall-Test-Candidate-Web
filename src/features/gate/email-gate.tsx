"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/fields";
import { FormError } from "@/components/ui/form-error";
import { useOpenTest } from "@/lib/api/candidate";
import { ApiError } from "@/lib/api/errors";
import { ClosedNotice } from "./closed-notice";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Step one: the link proves you have the email, the address proves you are the person it was sent to. */
export function EmailGate({ token }: { token: string }) {
  const router = useRouter();
  const open = useOpenTest();
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [closed, setClosed] = useState(false);

  const invalid = touched && !emailPattern.test(email.trim());

  function submit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (!emailPattern.test(email.trim())) return;
    open.mutate(
      { token, email },
      {
        onSuccess: () => router.replace("/test"),
        onError: (error) => {
          if (error instanceof ApiError && error.status === 403 && error.code === "TEST_CLOSED") setClosed(true);
        },
      },
    );
  }

  if (closed) return <ClosedNotice />;

  const error = open.error instanceof ApiError ? open.error : null;
  const message = error
    ? error.status === 401
      ? "That email doesn’t match this invitation. Use the address your advisor registered for you."
      : error.message
    : null;

  return (
    <div>
      <h1 className="font-display text-[2rem] font-semibold leading-tight tracking-tight">Confirm your email</h1>
      <p className="mt-3 text-ink-muted">Enter the email address this invitation was sent to. Then you can read the instructions and start when you are ready.</p>

      <form onSubmit={submit} noValidate className="mt-8 flex flex-col gap-5">
        <TextField
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          autoFocus
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onBlur={() => setTouched(true)}
          error={invalid ? "Enter a valid email address." : undefined}
        />
        <FormError message={message} />
        <Button type="submit" loading={open.isPending} className="h-12 text-base">
          Continue
        </Button>
      </form>
    </div>
  );
}
