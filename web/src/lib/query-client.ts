import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 30 * 60_000,
      refetchOnWindowFocus: false,
      retry: (count, error) =>
        count < 2 &&
        !(
          error instanceof Error &&
          "status" in error &&
          Number(error.status) < 500
        ),
      staleTime: 5 * 60_000,
    },
  },
});
