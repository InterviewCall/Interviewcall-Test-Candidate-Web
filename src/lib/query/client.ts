import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/errors";
import { hardNavigate } from "@/lib/navigation";

/** The portal session ended (cookie expired or was cleared): go back to the page that explains the link. */
function handleGlobalError(error: unknown) {
  if (!(error instanceof ApiError)) return;
  if (error.status === 401 && typeof window !== "undefined" && window.location.pathname.startsWith("/test")) {
    hardNavigate("/?ended=1");
  }
}

export function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({ onError: handleGlobalError }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        // Opening the link answers 401 for a wrong email. The form shows that itself.
        if (mutation.options.mutationKey?.[0] === "open-test") return;
        handleGlobalError(error);
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 0,
        refetchOnWindowFocus: true,
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
          return failureCount < 2;
        },
      },
      mutations: { retry: false },
    },
  });
}
