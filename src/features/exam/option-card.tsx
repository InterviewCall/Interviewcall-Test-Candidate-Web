import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";
import { Markdown } from "@/components/ui/markdown";
import { optionLetter } from "./exam-model";

/**
 * One answer choice, as a big target. Chosen = cream fill with an indigo outline and a solid hexagon
 * marker. The letter doubles as the keyboard shortcut.
 */
export function OptionCard({
  index,
  text,
  checked,
  onChoose,
}: {
  index: number;
  text: string;
  checked: boolean;
  onChoose: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onChoose}
      className={cn(
        "group flex w-full items-start gap-4 rounded-panel border-2 px-4 py-3.5 text-left transition-[border-color,background-color,box-shadow] motion-reduce:transition-none sm:px-5",
        checked
          ? "border-primary bg-highlighter text-on-highlighter shadow-[0_6px_18px_-10px_var(--primary)]"
          : "border-line bg-surface hover:border-line-strong hover:bg-sunken",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "mt-px grid size-9 shrink-0 place-items-center font-display text-[15px] font-semibold transition-colors clip-hex-pointy motion-reduce:transition-none",
          checked ? "bg-primary text-on-primary" : "bg-primary-tint text-primary group-hover:bg-line",
        )}
      >
        {checked ? <Icon name="check" size={17} /> : optionLetter(index)}
      </span>
      <Markdown className="min-w-0 flex-1 pt-[5px] text-[1.0625rem] leading-relaxed [&_p]:m-0 [&_pre]:my-2">{text}</Markdown>
    </button>
  );
}
