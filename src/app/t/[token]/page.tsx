import type { Metadata } from "next";
import { GateShell } from "@/components/layout/gate-shell";
import { EmailGate } from "@/features/gate/email-gate";

export const instant = false;

export const metadata: Metadata = { title: "Confirm your email" };

export default async function OpenTestPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <GateShell>
      <EmailGate token={decodeURIComponent(token)} />
    </GateShell>
  );
}
