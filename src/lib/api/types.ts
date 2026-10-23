/**
 * What the candidate API returns. The API does not publish response schemas for these routes,
 * so the shapes are written out here to match apps/api/src/candidate/types/candidate.types.ts.
 * Dates arrive as ISO strings.
 */

export type TestLevel = "INTERMEDIATE" | "ADVANCED";
export type TestState = "NOT_OPEN" | "READY" | "IN_PROGRESS" | "SUBMITTED";

export interface TestInfo {
  state: TestState;
  candidate: { fullName: string };
  level: TestLevel;
  durationMinutes: number;
  startsAt: string;
  endsAt: string;
  latestStartAt: string;
  serverTime: string;
  test: {
    questionCount: number;
    sections: { topic: string; questions: number }[];
    instructionsMd: string | null;
  } | null;
}

export interface AttemptOption {
  id: number;
  textMd: string;
}

export interface AttemptQuestion {
  questionVersionId: number;
  title: string;
  statementMd: string;
  codeStubs: unknown;
  options: AttemptOption[];
  selectedOptionId: number | null;
}

export interface AttemptSection {
  topic: string;
  questions: AttemptQuestion[];
}

export interface Attempt {
  status: "IN_PROGRESS" | "SUBMITTED";
  startedAt: string;
  deadlineAt: string;
  submittedAt: string | null;
  serverTime: string;
  sections: AttemptSection[];
}

export interface StartAttemptInput {
  workExperienceYears: number;
  declarations: { ownWork: true; accurateDetails: true };
}
