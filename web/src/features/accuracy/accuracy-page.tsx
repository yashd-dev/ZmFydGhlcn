import { useState } from "react";

import { ForecastActualChart } from "@/src/components/charts/forecast-actual-chart";
import { IntervalTable } from "@/src/components/tables/interval-table";
import { useAccuracy } from "@/src/hooks/use-accuracy";
import { useUrlFilters } from "@/src/hooks/use-url-filters";
import { formatMw, formatSignedMw, formatUkDate } from "@/src/lib/formatters";
import type { Interval } from "@/src/types/api";

import { FilterBar, QueryState } from "../shared";

export const AccuracyPage = () => {
  const [dayView, setDayView] = useState(true);
  const { filters } = useUrlFilters();
  const query = useAccuracy({
    ...filters,
    endDate: filters.startDate,
    startDate: `${filters.startDate.slice(0, 7)}-01`,
  });
  const { data } = query;
  const dailyIntervals: Interval[] = [];
  if (data) {
    const groups = new Map<string, Interval[]>();
    const dayFormatter = new Intl.DateTimeFormat("en-GB", {
      dateStyle: "short",
      timeZone: "Europe/London",
    });
    for (const interval of data.intervals) {
      const key = dayFormatter.format(new Date(interval.start_time));
      const group = groups.get(key) ?? [];
      group.push(interval);
      groups.set(key, group);
    }
    for (const group of groups.values()) {
      const average = (key: "forecast_mw" | "actual_mw" | "error_mw") => {
        const values = group
          .map((item) => item[key])
          .filter((value): value is number => typeof value === "number");
        return values.length
          ? values.reduce((sum, value) => sum + value, 0) / values.length
          : null;
      };
      dailyIntervals.push({
        actual_mw: average("actual_mw"),
        error_mw: average("error_mw"),
        forecast_mw: average("forecast_mw"),
        publish_time: group[0].publish_time,
        reason: null,
        start_time: group[0].start_time,
        status: "daily average",
      });
    }
  }
  const periodLabel = data
    ? `${dailyIntervals.length} daily averages, ${formatUkDate(`${data.period.start_date}T12:00:00Z`)}-${formatUkDate(`${data.period.end_date}T12:00:00Z`)}`
    : "";
  const handleRetry = async () => {
    await query.refetch();
  };
  return (
    <main className="space-y-8 px-4 pt-8 pb-16 sm:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Forecast accuracy
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
          Retrospective accuracy of forecasts available at the decision cutoff.
          Actuals are shown here for evaluation, not as decision-time
          information.
        </p>
      </div>
      <FilterBar singleDate />
      <QueryState
        loading={query.isPending}
        error={query.error}
        onRetry={handleRetry}
      />
      {data && (
        <>
          <dl className="grid border-y py-5 sm:grid-cols-3 sm:gap-0 [&>div]:py-3 [&>div]:sm:border-l [&>div]:sm:px-7 [&>div:first-child]:sm:border-0 [&>div:first-child]:sm:pl-0">
            <div>
              <dt className="text-muted-foreground text-sm font-semibold">
                Mean absolute error
              </dt>
              <dd className="mt-1.5 text-2xl font-semibold tabular-nums">
                {formatMw(data.metrics.mae)}
              </dd>
              <p className="text-muted-foreground mt-1 text-sm">
                Average absolute error.
              </p>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm font-semibold">
                Root mean squared error
              </dt>
              <dd className="mt-1.5 text-2xl font-semibold tabular-nums">
                {formatMw(data.metrics.rmse)}
              </dd>
              <p className="text-muted-foreground mt-1 text-sm">
                Larger misses count more.
              </p>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm font-semibold">
                Bias
              </dt>
              <dd className="mt-1.5 text-2xl font-semibold tabular-nums">
                {formatSignedMw(data.metrics.bias)}
              </dd>
              <p className="text-muted-foreground mt-1 text-sm">
                Forecast direction.
              </p>
            </div>
          </dl>
          <section>
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">
                  Forecast versus actual generation
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Actual generation is only used retrospectively to calculate
                  error. MW.
                </p>
              </div>
              <div className="text-muted-foreground flex gap-4 text-sm">
                <span className="flex items-center gap-2">
                  <span className="border-primary w-5 border-t-2 border-dashed" />
                  Forecast
                </span>
                <span className="flex items-center gap-2">
                  <span className="border-actual-line w-5 border-t-2" />
                  Actual
                </span>
              </div>
            </div>
            <div className="bg-card rounded-2xl p-4 shadow-sm ring-1 ring-black/10 sm:px-5">
              <ForecastActualChart
                intervals={data.intervals}
                showError
                showLegend={false}
                dateOnly
                className="h-[220px] sm:h-[260px]"
              />
            </div>
          </section>
          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">Forecast interval detail</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  {periodLabel}
                </p>
              </div>
              <div className="bg-muted flex rounded-xl p-1">
                <button
                  aria-pressed={!dayView}
                  className={`rounded-lg px-3 py-1.5 text-xs ${dayView ? "text-muted-foreground" : "bg-background text-primary font-medium shadow-sm"}`}
                  onClick={() => setDayView(false)}
                  type="button"
                >
                  Intervals
                </button>
                <button
                  aria-pressed={dayView}
                  className={`rounded-lg px-3 py-1.5 text-xs ${dayView ? "bg-background text-primary font-medium shadow-sm" : "text-muted-foreground"}`}
                  onClick={() => setDayView(true)}
                  type="button"
                >
                  Daily average
                </button>
              </div>
            </div>
            <div className="bg-card rounded-2xl shadow-sm ring-1 ring-black/10">
              <IntervalTable
                dayView={dayView}
                intervals={dayView ? dailyIntervals : data.intervals}
              />
            </div>
          </section>
        </>
      )}
    </main>
  );
};
