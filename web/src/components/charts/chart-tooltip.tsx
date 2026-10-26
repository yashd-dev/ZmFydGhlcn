import type { TooltipProps } from "recharts";

export const ChartTooltip = ({
  active,
  payload,
  label,
  showError = false,
}: TooltipProps<number, string> & { showError?: boolean }) => {
  if (!active || !payload?.length) {
    return null;
  }
  return (
    <div className="bg-card rounded-lg border px-3 py-2 text-xs shadow-sm">
      <div className="text-muted-foreground mb-1">{label}</div>
      {payload.map((item) => (
        <div key={item.dataKey}>
          {item.name}:{" "}
          {item.value === null || item.value === undefined
            ? "N/A"
            : `${Number(item.value).toFixed(2)} MW`}
        </div>
      ))}
      {showError && typeof payload[0]?.payload?.error === "number" && (
        <div
          className={
            payload[0].payload.error >= 0
              ? "text-chart-4"
              : "text-destructive"
          }
        >
          Error: {Number(payload[0].payload.error).toFixed(2)} MW
        </div>
      )}
    </div>
  );
};
