import type { TooltipProps } from "recharts";

export const ChartTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (!active || !payload?.length) {
    return null;
  }
  return (
    <div className="bg-card border px-3 py-2 text-xs shadow-sm">
      <div className="text-muted-foreground mb-1">{label}</div>
      {payload.map((item) => (
        <div key={item.dataKey}>
          {item.name}:{" "}
          {item.value === null || item.value === undefined
            ? "N/A"
            : `${Number(item.value).toFixed(2)} MW`}
        </div>
      ))}
    </div>
  );
};
