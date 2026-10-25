import { ForecastVersionTable } from "@/src/components/tables/forecast-version-table";
import { useForecasts } from "@/src/hooks/use-forecasts";
import { useUrlFilters } from "@/src/hooks/use-url-filters";

import { FilterBar, QueryState } from "../shared";

export const ForecastExplorerPage = () => {
  const { filters } = useUrlFilters();
  const query = useForecasts(filters);
  const handleRetry = async () => {
    await query.refetch();
  };
  return (
    <div className="space-y-5 p-4 md:p-8">
      <div>
        <h2 className="mt-1 text-2xl font-semibold">Forecast versions</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          See which forecast was available when each purchase decision was made.
        </p>
      </div>
      <FilterBar />
      <QueryState
        loading={query.isPending}
        error={query.error}
        onRetry={handleRetry}
      />
      {query.data && (
        <section className="bg-card rounded-lg border p-4">
          <ForecastVersionTable
            forecasts={query.data}
            interval={filters.interval}
          />
        </section>
      )}
    </div>
  );
};
