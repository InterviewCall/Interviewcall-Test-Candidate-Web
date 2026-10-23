import type { Attempt, AttemptQuestion } from "@/lib/api/types";

export interface CodeStub {
  language: string;
  label: string;
  code: string;
}

export interface ExamQuestion extends AttemptQuestion {
  /** 0-based position across the whole test. */
  index: number;
  topic: string;
  /** The code the question refers to, one entry per language. Empty when the question has none. */
  stubs: CodeStub[];
}

/** The API sends the code as loose JSON, so check every field instead of trusting it. */
export function parseStubs(value: unknown): CodeStub[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const { language, label, code } = item as Record<string, unknown>;
    if (typeof code !== "string" || code.trim() === "") return [];
    const lang = typeof language === "string" && language ? language : "code";
    return [{ language: lang, label: typeof label === "string" && label ? label : lang, code }];
  });
}

/** The test as one list, in the order the server fixed when the attempt started. */
export function flattenAttempt(attempt: Attempt): ExamQuestion[] {
  let index = 0;
  return attempt.sections.flatMap((section) => section.questions.map((q) => ({ ...q, topic: section.topic, index: index++, stubs: parseStubs(q.codeStubs) })));
}

export interface TimeTone {
  tone: "calm" | "warm" | "urgent";
  /** Spoken to screen readers when the tone changes. */
  announcement: string | null;
}

/** Five minutes left turns the clock amber, one minute turns it red. Colour never carries this alone. */
export function timeTone(remainingSeconds: number): TimeTone {
  if (remainingSeconds <= 60) return { tone: "urgent", announcement: "One minute left." };
  if (remainingSeconds <= 300) return { tone: "warm", announcement: "Five minutes left." };
  return { tone: "calm", announcement: null };
}

export const optionLetter = (i: number) => String.fromCharCode(65 + i);
