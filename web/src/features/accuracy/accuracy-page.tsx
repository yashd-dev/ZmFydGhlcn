import { ErrorChart } from "@/src/components/charts/error-chart";
import { ForecastActualChart } from "@/src/components/charts/forecast-actual-chart";
import { MetricCard } from "@/src/components/metrics/metric-card";
import { MetricGrid } from "@/src/components/metrics/metric-grid";
import { IntervalTable } from "@/src/components/tables/interval-table";
import { useAccuracy } from "@/src/hooks/use-accuracy";
import { useUrlFilters } from "@/src/hooks/use-url-filters";
import { metric } from "@/src/lib/formatters";

import { FilterBar, QueryState } from "../shared";

export const AccuracyPage = () => {
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
          Methodology
        </p>
        <h2 className="mt-1 text-2xl font-semibold">Accuracy Analysis</h2>
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
            <MetricCard
              label="Matched count"
              value={String(data.metrics.matched_count ?? 0)}
              detail={`${data.excluded_count} excluded`}
            />
          </MetricGrid>
          <div className="bg-muted/30 text-muted-foreground border p-4 text-sm">
            <p>
              MAE is average absolute error. RMSE weights larger errors more
              heavily. Bias indicates overforecasting or underforecasting
              direction. Historical error is not a calibrated uncertainty
              interval.
            </p>
          </div>
          <section className="bg-card border p-4">
            <h3 className="mb-3 font-medium">Error trend</h3>
            <ErrorChart intervals={data.intervals} />
          </section>
          <section className="bg-card border p-4">
            <h3 className="mb-3 font-medium">Forecast versus actual</h3>
            <ForecastActualChart intervals={data.intervals} />
          </section>
          <section className="bg-card border p-4">
            <h3 className="mb-3 font-medium">Interval detail</h3>
            <IntervalTable intervals={data.intervals} />
          </section>
        </>
      )}
    </div>
  );
};
