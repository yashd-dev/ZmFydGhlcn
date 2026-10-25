import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUrlFilters } from "@/src/hooks/use-url-filters";

export const FilterBar = ({ singleDate = false }: { singleDate?: boolean }) => {
  const { filters, setFilters } = useUrlFilters();
  return (
    <form
      className="bg-card flex flex-wrap items-end gap-3 rounded-lg border p-3"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const startDate = String(
          form.get(singleDate ? "delivery_date" : "start_date")
        );
        setFilters({
          cutoff: "09:00",
          endDate: singleDate ? startDate : String(form.get("end_date")),
          startDate,
        });
      }}
    >
      {singleDate ? (
        <label className="text-muted-foreground grid gap-1 text-xs">
          Delivery date
          <Input
            name="delivery_date"
            type="date"
            defaultValue={filters.startDate}
            min="2026-01-02"
            max="2026-01-31"
          />
        </label>
      ) : (
        <>
          <label className="text-muted-foreground grid gap-1 text-xs">
            Start date
            <Input
              name="start_date"
              type="date"
              defaultValue={filters.startDate}
            />
          </label>
          <label className="text-muted-foreground grid gap-1 text-xs">
            End date
            <Input name="end_date" type="date" defaultValue={filters.endDate} />
          </label>
        </>
      )}
      <div className="text-muted-foreground grid gap-1 text-xs">
        Purchase decision by
        <span className="text-foreground text-sm">09:00</span>
      </div>
      <Button type="submit">Apply filters</Button>
    </form>
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
      <div className="text-muted-foreground rounded-lg border p-8 text-sm">
        Loading analytical data...
      </div>
    );
  }
  if (error) {
    return (
      <output
        role="alert"
        className="border-destructive/40 bg-destructive/5 rounded-lg border p-4 text-sm"
      >
        <p className="font-medium">The backend/API is unavailable.</p>
        <p className="text-muted-foreground mt-1">{error.message}</p>
        <Button className="mt-3" size="sm" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      </output>
    );
  }
  return null;
};
