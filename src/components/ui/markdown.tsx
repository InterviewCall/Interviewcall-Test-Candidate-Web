import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/cn";

/**
 * Question text is markdown, with code. Raw HTML is never rendered (react-markdown ignores it),
 * so text written by staff can't inject anything into the page.
 */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("md", className)}>
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
