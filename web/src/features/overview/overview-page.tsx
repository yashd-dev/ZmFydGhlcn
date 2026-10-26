import { ForecastActualChart } from "@/src/components/charts/forecast-actual-chart";
import { IntervalTable } from "@/src/components/tables/interval-table";
import { useAccuracy } from "@/src/hooks/use-accuracy";
import { useForecasts } from "@/src/hooks/use-forecasts";
import { useUrlFilters } from "@/src/hooks/use-url-filters";
import { formatMwWhole } from "@/src/lib/formatters";
import type { Forecast, Interval } from "@/src/types/api";

import { DeliveryDateField, QueryState } from "../shared";

const londonMidnight = (date: string) => {
  const target = `${date}T00:00:00`;
  let timestamp = Date.parse(`${date}T00:00:00Z`);
  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZone: "Europe/London",
    year: "numeric",
  });
  for (let i = 0; i < 2; i += 1) {
    const parts = Object.fromEntries(
      formatter.formatToParts(timestamp).map(({ type, value }) => [type, value])
    );
    const local = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second)
    );
    timestamp += Date.parse(`${target}Z`) - local;
  }
  return timestamp;
};

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
  const dayStart = londonMidnight(filters.startDate);
  const nextDate = new Date(`${filters.startDate}T12:00:00Z`);
  nextDate.setUTCDate(nextDate.getUTCDate() + 1);
  const nextDateLabel = nextDate.toISOString().slice(0, 10);
  const dayEnd = londonMidnight(nextDateLabel);
  const dayHours = (dayEnd - dayStart) / 3_600_000;
  const dayForecasts = forecastIntervals
    .filter((item) => {
      const time = Date.parse(item.start_time);
      return time >= dayStart && time < dayEnd;
    })
    .toSorted((a, b) => Date.parse(a.start_time) - Date.parse(b.start_time));
  const completeDay =
    dayForecasts.length === dayHours &&
    dayForecasts.every(
      (item, index) =>
        Date.parse(item.start_time) === dayStart + index * 3_600_000 &&
        item.forecast_mw !== null &&
        Number.isFinite(item.forecast_mw)
    );
  const dailyEnergy = completeDay
    ? dayForecasts.reduce((sum, item) => sum + Number(item.forecast_mw), 0)
    : null;
  const averageForecast = dailyEnergy === null ? null : dailyEnergy / dayHours;
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
            <div className="flex flex-col justify-around">
              <div>
                <p className="text-muted-foreground text-sm">
                  Estimated wind energy for the day, {deliveryDateLabel}
                </p>
                <p className="text-foreground mt-3 text-5xl font-semibold tracking-tight lg:text-[56px]">
                  {dailyEnergy === null
                    ? "Unavailable"
                    : dailyEnergy.toLocaleString("en-GB", {
                        maximumFractionDigits: 2,
                      })}
                  <span className="text-muted-foreground ml-1 text-xl font-medium">
                    MWh
                  </span>
                </p>
                <p className="text-muted-foreground mt-3 text-sm">
                  {dailyEnergy === null
                    ? "Daily total unavailable: incomplete forecast"
                    : "Estimated by treating each hourly forecast as average power over that hour."}
                </p>
              </div>
            </div>
            <section className="bg-card rounded-2xl p-4 shadow-sm ring-1 ring-black/10 sm:px-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-medium">Decision-time forecast</h3>
                  <p className="text-muted-foreground text-xs">
                    Hourly forecast power (MW)
                  </p>
                </div>
              </div>
              <ForecastActualChart
                intervals={dayForecasts}
                showActual={false}
                forecastName="Forecast power (MW)"
                className="h-[200px] sm:h-[260px]"
              />
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
                  error = forecast - actual. Positive error means the forecast
                  overestimated wind, so actual wind was lower than expected.
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
          <section className="border-border space-y-4 border-t pt-8">
            <div>
              <h2 className="text-lg font-semibold">
                Selected day hourly forecast
              </h2>
              <p className="text-muted-foreground mt-1.5 text-sm">
                Forecast power for each delivery hour on {deliveryDateLabel},
                using forecasts published by {filters.cutoff} UK time on the
                previous day.
                <br />
                Average forecast power:{" "}
                <strong className="text-foreground font-semibold">
                  {formatMwWhole(averageForecast)} MW
                </strong>
                .
              </p>
            </div>
            <div className="bg-card rounded-2xl p-4 shadow-sm ring-1 ring-black/10 sm:px-5">
              <IntervalTable
                intervals={dayForecasts}
                showActual={false}
                forecastLabel="Forecast power, MW"
                showPublishTime
              />
            </div>
          </section>
        </>
      )}
    </main>
  );
};
