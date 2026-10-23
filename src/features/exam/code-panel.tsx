"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import type { ThemedToken } from "shiki/core";
import { cn } from "@/lib/cn";
import type { CodeStub } from "./exam-model";
import { loadedHighlighter, loadHighlighter } from "./highlight";
import type { Highlighter } from "./highlight";

/**
 * The code a question is about, with one tab per language the question has it in.
 * Candidates pick the language they read best once, and every later question follows.
 */
export function CodePanel({
  stubs,
  language,
  onLanguage,
}: {
  stubs: CodeStub[];
  language: string;
  onLanguage: (language: string) => void;
}) {
  const id = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const [highlighter, setHighlighter] = useState<Highlighter | null>(loadedHighlighter);
  useEffect(() => {
    let live = true;
    void loadHighlighter().then((h) => {
      if (live && h) setHighlighter(h);
    });
    return () => {
      live = false;
    };
  }, []);
  const index = Math.max(0, stubs.findIndex((s) => s.language === language));
  const active = stubs[index];
  const source = active ? active.code.replace(/\r\n?/g, "\n").replace(/\n+$/, "") : "";
  const lines = useMemo(() => source.split("\n"), [source]);
  const colored = useMemo(
    () => (active && highlighter ? highlighter.tokenize(source, active.language) : null),
    [active, highlighter, source],
  );
  if (!active) return null;

  function onKeyDown(event: KeyboardEvent, from: number) {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    event.stopPropagation();
    const next = (from + step + stubs.length) % stubs.length;
    onLanguage(stubs[next].language);
    tabs.current[next]?.focus();
  }

  return (
    <figure className="mt-5 overflow-hidden rounded-panel bg-rail text-white shadow-[0_10px_30px_-18px_rgb(8_7_31/0.9)]">
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 py-2.5">
        <span className="pl-1 text-[13px] font-medium text-rail-ink">Code</span>
        {stubs.length > 1 ? (
          <div role="tablist" aria-label="Language" className="flex flex-wrap gap-1">
            {stubs.map((stub, i) => {
              const selected = i === index;
              return (
                <button
                  key={stub.language}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`${id}-tab-${stub.language}`}
                  aria-selected={selected}
                  aria-controls={`${id}-panel`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => onLanguage(stub.language)}
                  onKeyDown={(event) => onKeyDown(event, i)}
                  className={cn(
                    "rounded-full px-3 py-1 text-[13px] font-medium transition-colors motion-reduce:transition-none",
                    selected ? "bg-highlighter text-on-highlighter" : "text-rail-ink hover:bg-white/10 hover:text-white",
                  )}
                >
                  {stub.label}
                </button>
              );
            })}
          </div>
        ) : (
          <span className="pr-1 text-[13px] text-rail-ink">{active.label}</span>
        )}
      </figcaption>

      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${active.language}`} tabIndex={0} className="overflow-x-auto">
        <ol className="min-w-max px-4 py-4 font-mono text-[14.5px] leading-[1.7] [counter-reset:line]">
          {lines.map((line, i) => (
            <li
              key={i}
              className="flex gap-4 whitespace-pre text-[#d4d4d4] [counter-increment:line] before:w-6 before:shrink-0 before:select-none before:text-right before:text-white/35 before:content-[counter(line)]"
            >
              <span>
                {line === "" ? (
                  " "
                ) : colored?.[i]?.length ? (
                  colored[i].map((token, t) => (
                    <span key={t} style={tokenStyle(token)}>
                      {token.content}
                    </span>
                  ))
                ) : (
                  line
                )}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </figure>
  );
}

/** Shiki font styles are bit flags: 1 italic, 2 bold, 4 underline. */
function tokenStyle(token: ThemedToken): CSSProperties {
  const flags = token.fontStyle ?? 0;
  return {
    color: token.color,
    fontStyle: flags & 1 ? "italic" : undefined,
    fontWeight: flags & 2 ? 700 : undefined,
    textDecoration: flags & 4 ? "underline" : undefined,
  };
}
