import { formatMw, formatUk, formatUkDate } from "@/src/lib/formatters";
import type { Interval } from "@/src/types/api";

export const IntervalTable = ({
  intervals,
  showActual = true,
  forecastLabel = "Forecast",
  dayView = false,
}: {
  intervals: Interval[];
  showActual?: boolean;
  forecastLabel?: string;
  dayView?: boolean;
}) => (
  <div className="overflow-x-auto">
    <table className="[&_td]:border-border [&_th]:border-border [&_th]:text-muted-foreground w-full border-collapse text-[0.8rem] [&_td]:border-b [&_td]:px-3 [&_td]:py-2.5 [&_td]:whitespace-nowrap [&_th]:border-b [&_th]:px-3 [&_th]:py-2.5 [&_th]:text-left [&_th]:font-medium [&_th]:whitespace-nowrap">
      <caption className="sr-only">
        {showActual ? "Evaluation interval comparisons" : "Forecast intervals"}
      </caption>
      <thead>
        <tr>
          <th>Delivery (UK)</th>
          <th>{forecastLabel}</th>
          {showActual && <th>Actual</th>}
          {showActual && <th>Error</th>}
          {showActual && <th>Status</th>}
          {showActual && <th>Reason</th>}
        </tr>
      </thead>
      <tbody>
        {intervals.map((item) => (
          <tr key={item.start_time}>
            <td>
              {dayView
                ? formatUkDate(item.start_time)
                : formatUk(item.start_time)}
            </td>
            <td>{formatMw(item.forecast_mw)}</td>
            {showActual && <td>{formatMw(item.actual_mw)}</td>}
            {showActual && <td>{formatMw(item.error_mw)}</td>}
            {showActual && <td>{item.status}</td>}
            {showActual && (
              <td className="text-muted-foreground">
                {item.reason ?? "Matched"}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
