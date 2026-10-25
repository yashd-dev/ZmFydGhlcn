import { formatMw, formatUk } from "@/src/lib/formatters";
import type { Interval } from "@/src/types/api";

export const IntervalTable = ({ intervals }: { intervals: Interval[] }) => (
  <div className="overflow-x-auto">
    <table className="[&_td]:border-border [&_th]:border-border [&_th]:text-muted-foreground w-full border-collapse text-[0.8rem] [&_td]:border-b [&_td]:px-3 [&_td]:py-2.5 [&_td]:whitespace-nowrap [&_th]:border-b [&_th]:px-3 [&_th]:py-2.5 [&_th]:text-left [&_th]:font-medium [&_th]:whitespace-nowrap">
      <caption className="sr-only">Evaluation interval comparisons</caption>
      <thead>
        <tr>
          <th>Delivery (UK)</th>
          <th>Forecast</th>
          <th>Actual</th>
          <th>Error</th>
          <th>Status</th>
          <th>Reason</th>
        </tr>
      </thead>
      <tbody>
        {intervals.map((item) => (
          <tr key={item.start_time}>
            <td>{formatUk(item.start_time)}</td>
            <td>{formatMw(item.forecast_mw)}</td>
            <td>{formatMw(item.actual_mw)}</td>
            <td>{formatMw(item.error_mw)}</td>
            <td>{item.status}</td>
            <td className="text-muted-foreground">
              {item.reason ?? "Matched"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
