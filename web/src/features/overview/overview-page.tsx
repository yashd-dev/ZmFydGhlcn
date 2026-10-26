import { useState } from "react";

import { ForecastActualChart } from "@/src/components/charts/forecast-actual-chart";
import { MetricCard } from "@/src/components/metrics/metric-card";
import { MetricGrid } from "@/src/components/metrics/metric-grid";
import { IntervalTable } from "@/src/components/tables/interval-table";
import { useAccuracy } from "@/src/hooks/use-accuracy";
import { useForecasts } from "@/src/hooks/use-forecasts";
import { useUrlFilters } from "@/src/hooks/use-url-filters";
import { formatMw, metric } from "@/src/lib/formatters";
import type { Forecast, Interval } from "@/src/types/api";

import { FilterBar, QueryState } from "../shared";

export const OverviewPage = () => {
  const { filters } = useUrlFilters();
  const forecastQuery = useForecasts({
    cutoff: filters.cutoff,
    endDate: filters.startDate,
    startDate: filters.startDate,
  });
  const historyQuery = useAccuracy({
    ...filters,
    endDate: filters.startDate,
    startDate: `${filters.startDate.slice(0, 7)}-01`,
  });
  const [view, setView] = useState<"chart" | "table">("chart");
  const { data, error: historyError, isPending: historyPending } = historyQuery;
  const { error: forecastError, isPending: forecastPending } = forecastQuery;
  const selected = new Map<string, Forecast>();
  for (const forecast of forecastQuery.data ?? []) {
    const existing = selected.get(forecast.start_time);
    if (
      forecast.eligible &&
      (!existing || forecast.publish_time > existing.publish_time)
    ) {
      selected.set(forecast.start_time, forecast);
    }
  }
  const forecastIntervals: Interval[] = [...selected.values()].map(
    (forecast) => ({
      actual_mw: null,
      error_mw: null,
      forecast_mw: forecast.forecast_mw,
      publish_time: forecast.publish_time,
      reason: null,
      start_time: forecast.start_time,
      status: "forecast",
    })
  );
  const loading = forecastPending || historyPending;
  const error = forecastError ?? historyError;
  const handleRetry = async () => {
    await Promise.all([forecastQuery.refetch(), historyQuery.refetch()]);
  };
  return (
    <div className="space-y-5 p-4 md:p-8">
      <div>
        <h2 className="mt-1 text-2xl font-semibold">
          Decision-time wind forecast
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
          Select a delivery date to see the latest forecast available by the
          09:00 Europe/London decision cutoff. This is the raw forecast, not a
          hindsight-adjusted estimate.
        </p>
      </div>
      <FilterBar singleDate />
      <QueryState loading={loading} error={error} onRetry={handleRetry} />
      {data && (
        <>
          <MetricGrid>
            <MetricCard
              label="Decision-time forecast"
              value={
                forecastIntervals.length
                  ? formatMw(
                      forecastIntervals.reduce(
                        (sum, interval) => sum + (interval.forecast_mw ?? 0),
                        0
                      ) / forecastIntervals.length
                    )
                  : "N/A"
              }
              detail="Average MW from forecasts available at the cutoff"
              featured
            />
            <MetricCard
              label="Retrospective MAE"
              value={metric(data.metrics, "mae")}
              detail="Typical miss in either direction"
            />
            <MetricCard
              label="Retrospective RMSE"
              value={metric(data.metrics, "rmse")}
              detail="Root mean squared error; larger misses count more"
            />
            <MetricCard
              label="Retrospective bias"
              value={metric(data.metrics, "bias")}
              detail="Positive means wind was overestimated"
            />
          </MetricGrid>
          <div className="grid gap-5 lg:grid-cols-2">
            <section className="bg-card flex min-h-[30rem] flex-col rounded-lg border p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-medium">Decision-time forecast</h3>
                  <p className="text-muted-foreground text-xs">
                    Latest forecast published by the 09:00 Europe/London cutoff.
                  </p>
                </div>
                <div className="bg-muted flex rounded-md p-1">
                  <button
                    className={`rounded-sm px-3 py-1.5 text-xs ${view === "chart" ? "bg-background font-medium shadow-sm" : "text-muted-foreground"}`}
                    onClick={() => setView("chart")}
                    type="button"
                  >
                    Chart
                  </button>
                  <button
                    className={`rounded-sm px-3 py-1.5 text-xs ${view === "table" ? "bg-background font-medium shadow-sm" : "text-muted-foreground"}`}
                    onClick={() => setView("table")}
                    type="button"
                  >
                    Table
                  </button>
                </div>
              </div>
              {view === "chart" ? (
                <ForecastActualChart
                  intervals={forecastIntervals}
                  showActual={false}
                  forecastName="Forecast available at cutoff"
                />
              ) : (
                <IntervalTable
                  intervals={forecastIntervals}
                  showActual={false}
                  forecastLabel="Forecast available at cutoff"
                />
              )}
            </section>
            <section className="bg-card min-h-[30rem] rounded-lg border p-4">
              <h3 className="mb-1 font-medium">
                Forecast versus actual generation
              </h3>
              <p className="text-muted-foreground mb-3 text-xs">
                Retrospective comparison using actual generation for the
                selected delivery period.
              </p>
              <ForecastActualChart
                intervals={data.intervals}
                showError
                showLegend={false}
              />
            </section>
          </div>
        </>
      )}
    </div>
  );
};
