import { ForecastActualChart } from "@/src/components/charts/forecast-actual-chart";
import { MetricCard } from "@/src/components/metrics/metric-card";
import { MetricGrid } from "@/src/components/metrics/metric-grid";
import { IntervalTable } from "@/src/components/tables/interval-table";
import { useAccuracy } from "@/src/hooks/use-accuracy";
import { useUrlFilters } from "@/src/hooks/use-url-filters";
import { metric } from "@/src/lib/formatters";

import { FilterBar, QueryState } from "../shared";

export const OverviewPage = () => {
  const { filters } = useUrlFilters();
  const query = useAccuracy(filters);
  const { data } = query;
  const handleRetry = async () => {
    await query.refetch();
  };
  return (
    <div className="space-y-5 p-4 md:p-8">
      <div>
        <p className="text-primary text-xs tracking-widest uppercase">
          Decision support
        </p>
        <h2 className="mt-1 text-2xl font-semibold">
          Wind generation evaluation
        </h2>
      </div>
      <FilterBar />
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
              detail="Average absolute error · MW"
            />
            <MetricCard
              label="RMSE"
              value={metric(data.metrics, "rmse")}
              detail="Larger errors weighted · MW"
            />
            <MetricCard
              label="Mean signed error"
              value={metric(data.metrics, "bias")}
              detail="Positive means overforecast · MW"
            />
            <MetricCard
              label="Matched intervals"
              value={String(data.metrics.matched_count ?? 0)}
              detail={`${data.period.start_date} to ${data.period.end_date}`}
            />
          </MetricGrid>
          {data.excluded_count > 0 && (
            <output className="border-primary/40 bg-primary/5 border p-3 text-sm">
              <strong>{data.excluded_count} intervals excluded.</strong>{" "}
              {Object.entries(data.exclusions)
                .map(([reason, count]) => `${reason}: ${count}`)
                .join(" · ")}
            </output>
          )}
          <section className="bg-card border p-4">
            <div className="mb-4">
              <h3 className="font-medium">Forecast versus actual</h3>
              <p className="text-muted-foreground text-xs">
                UK local display · API values in MW
              </p>
            </div>
            <ForecastActualChart intervals={data.intervals} />
          </section>
          <section className="bg-card border p-4">
            <h3 className="mb-4 font-medium">Bounded interval comparison</h3>
            <IntervalTable intervals={data.intervals} />
          </section>
        </>
      )}
    </div>
  );
};
