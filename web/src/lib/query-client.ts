import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, error) =>
        count < 2 &&
        !(
          error instanceof Error &&
          "status" in error &&
          Number(error.status) < 500
        ),
      staleTime: 30_000,
    },
  },
});
