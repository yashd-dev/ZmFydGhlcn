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
  className = "h-96",
  dateOnly = false,
}: {
  intervals: Interval[];
  showActual?: boolean;
  forecastName?: string;
  showError?: boolean;
  showLegend?: boolean;
  className?: string;
  dateOnly?: boolean;
}) => {
  const data = intervals
    .map((item) => ({
      actual: showActual ? item.actual_mw : null,
      error: item.error_mw,
      forecast: item.forecast_mw,
      label: dateOnly ? item.start_time : formatUk(item.start_time),
    }))
    .filter((item) => item.forecast !== null || item.actual !== null);
  return (
    <div className={`${className} w-full`}>
      {data.length ? (
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{ bottom: 8, left: 0, right: 8, top: 8 }}
          >
            <CartesianGrid className="stroke-border [stroke-dasharray:2_3]" />
            <XAxis
              dataKey="label"
              interval="preserveStartEnd"
              minTickGap={45}
              tick={{ fontSize: dateOnly ? 11 : 10 }}
              tickFormatter={(value: string) =>
                dateOnly
                  ? new Intl.DateTimeFormat("en-GB", {
                      day: "numeric",
                      month: "short",
                      timeZone: "Europe/London",
                    }).format(new Date(value))
                  : value
              }
            />
            <YAxis
              ticks={[0, 5000, 10_000, 15_000, 20_000]}
              tick={{ fontSize: 10 }}
              tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
            />
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
                stroke="var(--actual-line)"
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
