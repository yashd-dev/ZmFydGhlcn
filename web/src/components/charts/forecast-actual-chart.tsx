import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatUk } from "@/src/lib/formatters";
import type { Interval } from "@/src/types/api";

import { ChartTooltip } from "./chart-tooltip";

export const ForecastActualChart = ({
  intervals,
  showActual = true,
  forecastName = "Forecast",
  showError = false,
  showLegend = true,
}: {
  intervals: Interval[];
  showActual?: boolean;
  forecastName?: string;
  showError?: boolean;
  showLegend?: boolean;
}) => {
  const data = intervals
    .map((item) => ({
      actual: showActual ? item.actual_mw : null,
      error: item.error_mw,
      forecast: item.forecast_mw,
      label: formatUk(item.start_time),
    }))
    .filter((item) => item.forecast !== null || item.actual !== null);
  return (
    <div className="h-96 w-full">
      {data.length ? (
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{ bottom: 8, left: 0, right: 8, top: 8 }}
          >
            <CartesianGrid className="stroke-border [stroke-dasharray:2_3]" />
            <XAxis dataKey="label" minTickGap={45} tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} unit=" MW" />
            <Tooltip content={<ChartTooltip showError={showError} />} />
            {showActual && showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey="forecast"
              name={forecastName}
              stroke="var(--forecast-line)"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 4"
              connectNulls={false}
            />
            {showActual && (
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
          No matching observations exist.
        </div>
      )}
    </div>
  );
};
