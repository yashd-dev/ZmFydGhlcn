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
  const query = useAccuracy({
    ...filters,
    endDate: filters.startDate,
    startDate: `${filters.startDate.slice(0, 7)}-01`,
  });
  const { data } = query;
  const handleRetry = async () => {
    await query.refetch();
  };
  return (
    <div className="space-y-5 p-4 md:p-8">
      <div>
        <h2 className="mt-1 text-2xl font-semibold">Forecast accuracy</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
          Quantify the error in the forecasts used for day-ahead procurement.
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
              Hover an interval to see the forecast error.
            </p>
            <ForecastActualChart intervals={data.intervals} showError />
          </section>
          <section className="bg-card rounded-lg border p-4">
            <h3 className="mb-3 font-medium">Forecast interval detail</h3>
            <IntervalTable intervals={data.intervals} showActual={false} />
          </section>
        </>
      )}
    </div>
  );
};
