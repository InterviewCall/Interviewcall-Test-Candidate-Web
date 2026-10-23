import type { ReactNode } from "react";
import { HexCluster } from "./hex-cluster";
import { LogoMark, Wordmark } from "./brand";
import { Icon } from "@/components/ui/icon";
import type { IconName } from "@/components/ui/icon";

const promises: { icon: IconName; text: string }[] = [
  { icon: "save", text: "Every answer saves the moment you choose it." },
  { icon: "clock", text: "Our server keeps the clock, so a refresh or a dropped connection never costs you time." },
  { icon: "lock", text: "Your link works until your slot ends. Close the tab and come back to carry on." },
];

/** The frame around opening the link: a brand panel that says what to expect, and the form beside it. */
export function GateShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <aside className="relative hidden flex-col justify-between gap-10 overflow-hidden bg-brand p-12 text-white lg:flex">
        <Wordmark size={44} />

        <div className="flex flex-col gap-10">
          <div className="w-full max-w-[19rem] self-start">
            <HexCluster />
          </div>
          <div className="flex max-w-md flex-col gap-6">
            <p className="font-display text-[2.4rem] font-semibold leading-[1.1] tracking-tight">One question at a time. Your best attempt.</p>
            <ul className="flex flex-col gap-3.5 text-[15px] text-rail-ink">
              {promises.map((p) => (
                <li key={p.icon} className="flex items-start gap-3">
                  <Icon name={p.icon} size={18} className="mt-0.5 shrink-0 text-highlighter" />
                  {p.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-sm text-rail-ink">Need help? Reply to the email your advisor sent you.</p>
      </aside>

      <main className="flex flex-col justify-center px-6 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <LogoMark size={40} />
            <span className="font-display text-lg font-semibold tracking-tight">InterviewCall</span>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
