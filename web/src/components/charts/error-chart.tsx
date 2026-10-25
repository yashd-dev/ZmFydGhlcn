import {
  CartesianGrid,
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

export const ErrorChart = ({ intervals }: { intervals: Interval[] }) => {
  const data = intervals
    .filter((item) => item.error_mw !== null)
    .map((item) => ({
      error: item.error_mw,
      label: formatUk(item.start_time),
    }));
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid className="stroke-border [stroke-dasharray:2_3]" />
          <XAxis dataKey="label" minTickGap={45} tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} unit=" MW" />
          <Tooltip content={<ChartTooltip />} />
          <Line
            type="monotone"
            dataKey="error"
            name="Error"
            stroke="var(--chart-3)"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
