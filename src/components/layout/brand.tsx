import Image from "next/image";
import { cn } from "@/lib/cn";

/** The InterviewCall mark on a cream tile, so it reads on the indigo panels and the paper page alike. */
export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  const height = Math.round(size * 0.68);
  return (
    <span
      style={{ width: size, height: size }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[28%] bg-highlighter shadow-[0_1px_0_rgb(255_255_255/0.6)_inset,0_6px_16px_-6px_rgb(0_0_0/0.55)]",
        className,
      )}
    >
      <Image src="/images/ic-logo.png" alt="" width={Math.round(height * 0.875)} height={height} priority />
    </span>
  );
}

export function Wordmark({ className, size = 40, subtitle = "Entrance test" }: { className?: string; size?: number; subtitle?: string }) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <LogoMark size={size} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[18px] font-semibold tracking-tight">InterviewCall</span>
        <span className="mt-1.5 text-xs font-normal opacity-70">{subtitle}</span>
      </span>
    </span>
  );
}
