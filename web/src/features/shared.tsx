import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUrlFilters } from "@/src/hooks/use-url-filters";
import type { Alignment } from "@/src/types/api";

export const FilterBar = ({
  includeAlignment = true,
}: {
  includeAlignment?: boolean;
}) => {
  const { filters, setFilters } = useUrlFilters();
  return (
    <form
      className="bg-card flex flex-wrap items-end gap-3 border p-3"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setFilters({
          alignment: String(form.get("alignment")) as Alignment,
          cutoff: String(form.get("cutoff")),
          endDate: String(form.get("end_date")),
          startDate: String(form.get("start_date")),
        });
      }}
    >
      <label className="text-muted-foreground grid gap-1 text-xs">
        Start date
        <Input name="start_date" type="date" defaultValue={filters.startDate} />
      </label>
      <label className="text-muted-foreground grid gap-1 text-xs">
        End date
        <Input name="end_date" type="date" defaultValue={filters.endDate} />
      </label>
      <label className="text-muted-foreground grid gap-1 text-xs">
        Decision cutoff
        <Input
          name="cutoff"
          type="time"
          step="1800"
          defaultValue={filters.cutoff}
        />
      </label>
      {includeAlignment && (
        <label className="text-muted-foreground grid gap-1 text-xs">
          Alignment
          <select
            name="alignment"
            defaultValue={filters.alignment}
            className="bg-background h-9 border px-2 text-sm"
          >
            <option value="hour_mean">Hourly mean</option>
            <option value="hour_start_point">Hour start point</option>
          </select>
        </label>
      )}
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
      <div className="text-muted-foreground border p-8 text-sm">
        Loading analytical data...
      </div>
    );
  }
  if (error) {
    return (
      <output
        role="alert"
        className="border-destructive/40 bg-destructive/5 border p-4 text-sm"
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
