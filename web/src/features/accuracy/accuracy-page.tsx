import { useState } from "react";

import { ForecastActualChart } from "@/src/components/charts/forecast-actual-chart";
import { MetricCard } from "@/src/components/metrics/metric-card";
import { MetricGrid } from "@/src/components/metrics/metric-grid";
import { IntervalTable } from "@/src/components/tables/interval-table";
import { useAccuracy } from "@/src/hooks/use-accuracy";
import { useUrlFilters } from "@/src/hooks/use-url-filters";
import { metric } from "@/src/lib/formatters";
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
  const handleRetry = async () => {
    await query.refetch();
  };
  return (
    <div className="space-y-5 p-4 md:p-8">
      <div>
        <h2 className="mt-1 text-2xl font-semibold">Forecast accuracy</h2>
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
          <MetricGrid>
            <MetricCard
              label="MAE"
              value={metric(data.metrics, "mae")}
              detail="Average absolute error"
            />
            <MetricCard
              label="RMSE"
              value={metric(data.metrics, "rmse")}
              detail="Weights larger errors more"
            />
            <MetricCard
              label="Bias"
              value={metric(data.metrics, "bias")}
              detail="Forecast direction"
            />
          </MetricGrid>
          <section className="bg-card rounded-lg border p-4">
            <h3 className="mb-1 font-medium">
              Forecast versus actual generation
            </h3>
            <p className="text-muted-foreground mb-3 text-xs">
              Actual generation is only used retrospectively to calculate error.
            </p>
            <ForecastActualChart intervals={data.intervals} showError />
          </section>
          <section className="bg-card rounded-lg border p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-medium">Forecast interval detail</h3>
              <div className="bg-muted flex rounded-full p-1">
                <button
                  aria-pressed={!dayView}
                  className={`rounded-full px-3 py-1.5 text-xs ${dayView ? "text-muted-foreground" : "bg-background font-medium shadow-sm"}`}
                  onClick={() => setDayView(false)}
                  type="button"
                >
                  Intervals
                </button>
                <button
                  aria-pressed={dayView}
                  className={`rounded-full px-3 py-1.5 text-xs ${dayView ? "bg-background font-medium shadow-sm" : "text-muted-foreground"}`}
                  onClick={() => setDayView(true)}
                  type="button"
                >
                  Daily average
                </button>
              </div>
            </div>
            <IntervalTable
              dayView={dayView}
              intervals={dayView ? dailyIntervals : data.intervals}
            />
          </section>
        </>
      )}
    </div>
  );
};
