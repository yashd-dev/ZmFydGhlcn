export type Alignment = "hour_mean" | "hour_start_point";

export interface HealthResponse {
  status: string;
  service: string;
  database: string;
  actual_count: number;
  forecast_count: number;
}
export interface Forecast {
  start_time: string;
  publish_time: string;
  forecast_mw: number;
  eligible: boolean;
}
export interface Interval {
  start_time: string;
  publish_time: string | null;
  forecast_mw: number | null;
  actual_mw: number | null;
  error_mw: number | null;
  status: string;
  reason: string | null;
}
export interface AccuracyResponse {
  period: { start_date: string; end_date: string };
  policy: {
    cutoff: string;
    timezone: string;
    alignment: Alignment;
    unit: string;
  };
  metrics: Record<string, number | null>;
  excluded_count: number;
  exclusions: Record<string, number>;
  intervals: Interval[];
}
export interface AccuracyParams {
  startDate: string;
  endDate: string;
  cutoff: string;
  alignment: Alignment;
}
export interface ForecastParams {
  startDate: string;
  endDate: string;
  cutoff: string;
}
