import { useQuery } from "@tanstack/react-query";

import { getAccuracy } from "@/src/api/wind";
import type { AccuracyParams } from "@/src/types/api";

export const useAccuracy = (params: AccuracyParams, enabled = true) =>
  useQuery({
    enabled,
    queryFn: ({ signal }) => getAccuracy(params, signal),
    queryKey: ["accuracy", params],
    refetchOnMount: false,
  });
