import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";

export type CellState = { answered: boolean; current: boolean; flagged: boolean };

/**
 * One question on the map. A hexagon, because that is the InterviewCall mark.
 * Indigo = answered, white = not yet, a heavy ink outline = the one you are on, an amber tab = flagged.
 * Each hexagon is two clipped layers: the outer one is the outline, the inner one the fill.
 */
export function HexCell({
  number,
  state,
  onSelect,
  size = 46,
}: {
  number: number;
  state: CellState;
  onSelect: () => void;
  size?: number;
}) {
  const { answered, current, flagged } = state;
  const label = `Question ${number}, ${answered ? "answered" : "not answered"}${flagged ? ", flagged for review" : ""}`;
  const outline = current ? "bg-ink" : answered ? "bg-primary" : "bg-line-strong";
  const fill = answered ? "bg-primary" : current ? "bg-highlighter" : "bg-surface";
  const text = answered ? "text-on-primary" : current ? "text-on-highlighter" : "text-ink-muted";
  const inset = current ? 3 : 2;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={label}
      aria-current={current ? "step" : undefined}
      style={{ width: size, height: size * 1.1547 }}
      className="group relative shrink-0 transition-transform hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transition-none"
    >
      <span aria-hidden="true" className={cn("absolute inset-0 clip-hex-pointy", outline)} />
      <span aria-hidden="true" style={{ inset }} className={cn("absolute clip-hex-pointy", fill)} />
      <span aria-hidden="true" className={cn("relative font-display text-[15px] font-semibold", text)}>
        {number}
      </span>
      {flagged ? (
        <span
          aria-hidden="true"
          className="absolute -right-0.5 -top-0.5 inline-flex size-[18px] items-center justify-center rounded-full bg-bar-below text-white ring-2 ring-paper"
        >
          <Icon name="flag" size={10} filled />
        </span>
      ) : null}
    </button>
  );
}
