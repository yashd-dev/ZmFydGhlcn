import type {
  AccuracyParams,
  AccuracyResponse,
  Forecast,
  ForecastParams,
  HealthResponse,
} from "@/src/types/api";

import { getJson } from "./client";

export const getHealth = (signal?: AbortSignal) =>
  getJson<HealthResponse>("/api/v1/health", {}, signal);
export const getAccuracy = (params: AccuracyParams, signal?: AbortSignal) =>
  getJson<AccuracyResponse>(
    "/api/v1/accuracy",
    {
      alignment: params.alignment,
      cutoff: params.cutoff,
      end_date: params.endDate,
      start_date: params.startDate,
    },
    signal
  );
export const getForecasts = (params: ForecastParams, signal?: AbortSignal) =>
  getJson<Forecast[]>(
    "/api/v1/forecasts",
    {
      cutoff: params.cutoff,
      end_date: params.endDate,
      start_date: params.startDate,
    },
    signal
  );
