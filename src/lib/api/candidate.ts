"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "./http";
import type { Attempt, StartAttemptInput, TestInfo } from "./types";

export const testKey = ["candidate", "test"] as const;
export const attemptKey = ["candidate", "attempt"] as const;

/** Swap the emailed secret plus the candidate's email for a session cookie. */
export function useOpenTest() {
  return useMutation({
    mutationKey: ["open-test"],
    mutationFn: async (input: { token: string; email: string }) => {
      await http.post("/candidate/session", { token: input.token, email: input.email.trim().toLowerCase() });
    },
  });
}

export function useTestInfo() {
  return useQuery({
    queryKey: testKey,
    queryFn: async () => (await http.get<TestInfo>("/candidate/test")).data,
  });
}

/** The questions and saved answers. Fetched once; after that the screen holds the answers itself. */
export function useAttempt(enabled: boolean) {
  return useQuery({
    queryKey: attemptKey,
    enabled,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    queryFn: async () => (await http.get<Attempt>("/candidate/attempt")).data,
  });
}

export function useStartAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: StartAttemptInput) => (await http.post<Attempt>("/candidate/attempt/start", input)).data,
    onSuccess: async (attempt) => {
      queryClient.setQueryData(attemptKey, attempt);
      await queryClient.invalidateQueries({ queryKey: testKey });
    },
  });
}

export async function saveAnswer(questionVersionId: number, optionId: number | null): Promise<void> {
  await http.put(`/candidate/attempt/answers/${questionVersionId}`, { optionId });
}

export function useSubmitAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => (await http.post<{ status: "SUBMITTED"; submittedAt: string }>("/candidate/attempt/submit")).data,
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: attemptKey });
      await queryClient.invalidateQueries({ queryKey: testKey });
    },
  });
}

export function useSendFeedback() {
  return useMutation({
    mutationFn: async (input: { rating: number; comment?: string }) => {
      await http.post("/candidate/feedback", input);
    },
  });
}

export function useEndSession() {
  return useMutation({
    mutationFn: async () => {
      await http.delete("/candidate/session");
    },
  });
}
