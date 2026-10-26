import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUrlFilters } from "@/src/hooks/use-url-filters";

export const FilterBar = ({ singleDate = false }: { singleDate?: boolean }) => {
  const { filters, setFilters } = useUrlFilters();
  return (
    <form
      className="mt-6 flex flex-wrap items-end gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const startDate = String(
          form.get(singleDate ? "delivery_date" : "start_date")
        );
        setFilters({
          cutoff: filters.cutoff,
          endDate: singleDate ? startDate : String(form.get("end_date")),
          startDate,
        });
      }}
    >
      {singleDate ? (
        <label className="text-muted-foreground grid gap-1 text-xs font-medium">
          Delivery date
          <Input
            name="delivery_date"
            type="date"
            defaultValue={filters.startDate}
            min="2026-01-02"
            max="2026-02-01"
          />
        </label>
      ) : (
        <>
          <label className="text-muted-foreground grid gap-1 text-xs font-medium">
            Start date
            <Input
              name="start_date"
              type="date"
              defaultValue={filters.startDate}
            />
          </label>
          <label className="text-muted-foreground grid gap-1 text-xs font-medium">
            End date
            <Input name="end_date" type="date" defaultValue={filters.endDate} />
          </label>
        </>
      )}
      <div className="text-muted-foreground grid gap-1 pb-2 text-sm">
        Decision cutoff
        <span className="text-foreground text-sm">
          {filters.cutoff} Europe/London
        </span>
      </div>
      <Button type="submit">Apply filters</Button>
    </form>
  );
};

export const EvaluateThroughField = () => {
  const { filters, setFilters } = useUrlFilters();
  return (
    <form
      className="mt-6 flex flex-wrap items-end gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const endDate = String(
          new FormData(event.currentTarget).get("end_date")
        );
        setFilters({ endDate, startDate: "2026-01-02" }, false);
      }}
    >
      <label className="text-muted-foreground grid gap-1 text-xs font-medium">
        Evaluate through
        <Input
          name="end_date"
          type="date"
          defaultValue={filters.endDate}
          min="2026-01-02"
          max="2026-02-01"
        />
      </label>
      <div className="text-muted-foreground grid gap-1 pb-2 text-sm">
        Assumed decision time
        <span className="text-foreground text-sm">
          {filters.cutoff} Europe/London
        </span>
      </div>
      <Button type="submit">Apply filters</Button>
    </form>
  );
};

export const DeliveryDateField = () => {
  const { filters, setFilters } = useUrlFilters();
  return (
    <label className="text-muted-foreground grid gap-1 text-sm">
      Delivery date
      <Input
        name="delivery_date"
        type="date"
        defaultValue={filters.startDate}
        min="2026-01-02"
        max="2026-02-01"
        onChange={(event) =>
          setFilters({
            endDate: event.currentTarget.value,
            startDate: event.currentTarget.value,
          })
        }
      />
    </label>
  );
};
export const QueryState = ({
  loading,
  error,
  onRetry,
}: {
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
}) => {
  if (loading) {
    return (
      <output aria-busy="true" className="space-y-5">
        <span className="sr-only">Loading analytical data...</span>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {["one", "two", "three", "four"].map((key) => (
            <div
              className="bg-card space-y-4 rounded-2xl p-5 shadow-sm ring-1 ring-black/10"
              key={key}
            >
              <div className="bg-muted h-3 w-28 animate-pulse rounded" />
              <div className="bg-muted h-8 w-24 animate-pulse rounded" />
              <div className="bg-muted h-3 w-40 animate-pulse rounded" />
            </div>
          ))}
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {["chart", "comparison"].map((key) => (
            <div
              className="bg-card space-y-5 rounded-2xl p-5 shadow-sm ring-1 ring-black/10"
              key={key}
            >
              <div className="space-y-3">
                <div className="bg-muted h-4 w-48 animate-pulse rounded" />
                <div className="bg-muted h-3 w-64 animate-pulse rounded" />
              </div>
              <div className="bg-muted/60 h-[13rem] animate-pulse rounded-md sm:h-[16rem]" />
            </div>
          ))}
        </div>
      </output>
    );
  }
  if (error) {
    return (
      <output
        role="alert"
        className="flex max-w-2xl items-start gap-4 rounded-xl border border-rose-200 bg-rose-50/70 p-5 text-sm text-rose-950 shadow-sm dark:border-rose-900/60 dark:bg-rose-950/20 dark:text-rose-100"
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-200">
          <svg
            aria-hidden="true"
            className="size-5"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 8v4m0 4h.01M10.3 3.7 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">We couldn&apos;t load this data</p>
          <p className="mt-1 text-rose-800/80 dark:text-rose-200/80">
            Check that the backend is running, then try again.
          </p>
          <p className="mt-2 truncate text-xs text-rose-800/60 dark:text-rose-200/60">
            {error.message}
          </p>
          <Button
            className="mt-4 border-rose-300 bg-white text-rose-900 hover:bg-rose-100 dark:border-rose-800 dark:bg-transparent dark:text-rose-100 dark:hover:bg-rose-900/40"
            onClick={onRetry}
            size="sm"
            type="button"
            variant="outline"
          >
            Try again
          </Button>
        </div>
      </output>
    );
  }
  return null;
};
