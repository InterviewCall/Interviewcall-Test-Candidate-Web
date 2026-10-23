import type { Metadata } from "next";
import { Suspense } from "react";
import { GateShell } from "@/components/layout/gate-shell";
import { OpenYourLink } from "@/features/gate/open-your-link";

export const metadata: Metadata = { title: "Open your test link" };

export default function HomePage() {
  return (
    <GateShell>
      {/* useSearchParams needs a Suspense boundary under Cache Components. */}
      <Suspense fallback={null}>
        <OpenYourLink />
      </Suspense>
    </GateShell>
  );
}
