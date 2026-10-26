import { useState } from "react";

import { ForecastActualChart } from "@/src/components/charts/forecast-actual-chart";
import { IntervalTable } from "@/src/components/tables/interval-table";
import { useAccuracy } from "@/src/hooks/use-accuracy";
import { useForecasts } from "@/src/hooks/use-forecasts";
import { useUrlFilters } from "@/src/hooks/use-url-filters";
import { formatMwWhole } from "@/src/lib/formatters";
import type { Forecast, Interval } from "@/src/types/api";

import { DeliveryDateField, QueryState } from "../shared";

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
  const deliveryDateLabel = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/London",
  }).format(new Date(`${filters.startDate}T12:00:00`));
  const averageForecast = forecastIntervals.length
    ? forecastIntervals.reduce(
        (sum, interval) => sum + (interval.forecast_mw ?? 0),
        0
      ) / forecastIntervals.length
    : null;
  const handleRetry = async () => {
    await Promise.all([forecastQuery.refetch(), historyQuery.refetch()]);
  };
  return (
    <main className="space-y-10 px-4 pt-8 pb-16 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Decision-time wind forecast
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
            Select a delivery date to see the latest forecast available
          </p>
        </div>
        <DeliveryDateField />
      </div>
      <QueryState loading={loading} error={error} onRetry={handleRetry} />
      {data && (
        <>
          <section className="grid gap-8 lg:grid-cols-[300px_1fr] lg:gap-12">
            <div
              className={`flex flex-col justify-center ${view === "table" ? "lg:sticky lg:top-20 lg:self-start" : ""}`}
            >
              <p className="text-muted-foreground text-sm">
                Average forecast, {deliveryDateLabel}
              </p>
              <p className="text-foreground mt-3 text-5xl font-semibold tracking-tight lg:text-[56px]">
                {formatMwWhole(averageForecast)}
                <span className="text-muted-foreground ml-1 text-xl font-medium">
                  MW
                </span>
              </p>
              <p className="text-muted-foreground mt-3 max-w-[26ch] text-sm">
                Latest forecast published before the decision cutoff.
              </p>
            </div>
            <section className="bg-card rounded-2xl p-4 shadow-sm ring-1 ring-black/10 sm:px-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-medium">Decision-time forecast</h3>
                  <p className="text-muted-foreground text-xs">
                    Hourly generation (MW)
                  </p>
                </div>
                <div className="bg-muted flex rounded-xl p-1">
                  <button
                    className={`rounded-lg px-3 py-1.5 text-xs ${view === "chart" ? "bg-background text-primary font-medium shadow-sm" : "text-muted-foreground"}`}
                    onClick={() => setView("chart")}
                    type="button"
                  >
                    Chart
                  </button>
                  <button
                    className={`rounded-lg px-3 py-1.5 text-xs ${view === "table" ? "bg-background text-primary font-medium shadow-sm" : "text-muted-foreground"}`}
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
                  className="h-[200px] sm:h-[260px]"
                />
              ) : (
                <IntervalTable
                  intervals={forecastIntervals}
                  showActual={false}
                  forecastLabel="Forecast available at cutoff"
                />
              )}
            </section>
          </section>
          <section className="border-border border-t pt-8">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-lg font-semibold">How accurate was it?</h2>
              <a
                className="text-primary shrink-0 text-sm font-medium underline-offset-4 hover:underline"
                href="/accuracy"
              >
                View full accuracy
              </a>
            </div>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Uses actual generation, so it was not available at decision time.
              Window: 1-{deliveryDateLabel}.
            </p>
            <dl className="my-6 grid gap-5 sm:grid-cols-3 sm:gap-0 [&>div]:sm:border-l [&>div]:sm:px-8 [&>div:first-child]:sm:border-0 [&>div:first-child]:sm:pl-0">
              <div>
                <dt className="text-muted-foreground text-sm">
                  Mean absolute error
                </dt>
                <dd className="mt-1 text-2xl font-semibold">
                  {formatMwWhole(data.metrics.mae)}{" "}
                  <span className="text-muted-foreground text-sm font-medium">
                    MW
                  </span>
                </dd>
                <p className="text-muted-foreground mt-1 text-sm">
                  Typical miss in either direction.
                </p>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm">
                  Root mean squared error
                </dt>
                <dd className="mt-1 text-2xl font-semibold">
                  {formatMwWhole(data.metrics.rmse)}{" "}
                  <span className="text-muted-foreground text-sm font-medium">
                    MW
                  </span>
                </dd>
                <p className="text-muted-foreground mt-1 text-sm">
                  Larger misses count more.
                </p>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm">Bias</dt>
                <dd className="mt-1 text-2xl font-semibold">
                  {formatMwWhole(data.metrics.bias)}{" "}
                  <span className="text-muted-foreground text-sm font-medium">
                    MW
                  </span>
                </dd>
                <p className="text-muted-foreground mt-1 text-sm">
                  Positive means wind was overestimated.
                </p>
              </div>
            </dl>
            <section className="bg-card rounded-2xl p-4 shadow-sm ring-1 ring-black/10 sm:px-5">
              <h3 className="mb-1 font-medium">
                Forecast versus actual generation
              </h3>
              <p className="text-muted-foreground mb-3 text-xs">
                Retrospective hourly generation (MW).
              </p>
              <ForecastActualChart
                intervals={data.intervals}
                showError
                className="h-[200px] sm:h-[260px]"
              />
            </section>
          </section>
        </>
      )}
    </main>
  );
};
