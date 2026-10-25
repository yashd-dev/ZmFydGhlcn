import { useQuery } from "@tanstack/react-query";

import { getForecasts } from "@/src/api/wind";
import type { ForecastParams } from "@/src/types/api";

export const useForecasts = (params: ForecastParams) =>
  useQuery({
    queryFn: ({ signal }) => getForecasts(params, signal),
    queryKey: ["forecasts", params],
  });
