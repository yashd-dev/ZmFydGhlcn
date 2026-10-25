import { useQuery } from "@tanstack/react-query";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { getHealth } from "@/src/api/wind";
import { useUrlFilters } from "@/src/hooks/use-url-filters";

const titles: Record<string, string> = {
  "/": "Overview",
  "/accuracy": "Accuracy Analysis",
  "/forecasts": "Forecast Explorer",
};
export const DashboardTopbar = () => {
  const { filters } = useUrlFilters();
  const health = useQuery({
    queryFn: ({ signal }) => getHealth(signal),
    queryKey: ["health"],
    staleTime: 30_000,
  });
  const title = titles[window.location.pathname] ?? "Overview";
  let connectionLabel = "API connected";
  if (health.isFetching) {
    connectionLabel = "Refreshing";
  } else if (health.isError) {
    connectionLabel = "Backend unavailable";
  }
  return (
    <header className="flex shrink-0 flex-col gap-3 border-b px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="md:hidden" aria-label="Open navigation" />
        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
          <p className="text-muted-foreground text-xs">
            {filters.startDate} to {filters.endDate} · cutoff {filters.cutoff} ·{" "}
            {filters.alignment.replace("hour_", "hour ")}
          </p>
        </div>
      </div>
      <div className="text-muted-foreground text-right text-xs">
        <div className="flex items-center justify-end gap-2">
          <span
            className={`size-2 ${health.isError ? "bg-destructive" : "bg-primary"}`}
          />
          {connectionLabel}
        </div>
        <div>Europe/London · values in MW</div>
      </div>
    </header>
  );
};
