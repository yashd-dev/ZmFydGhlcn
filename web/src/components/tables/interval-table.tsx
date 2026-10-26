import {
  formatMw,
  formatSignedMw,
  formatUk,
  formatUkDate,
} from "@/src/lib/formatters";
import type { Interval } from "@/src/types/api";

export const IntervalTable = ({
  intervals,
  showActual = true,
  forecastLabel = "Forecast",
  dayView = false,
  showPublishTime = false,
}: {
  intervals: Interval[];
  showActual?: boolean;
  forecastLabel?: string;
  dayView?: boolean;
  showPublishTime?: boolean;
}) => (
  <div className="overflow-x-auto rounded-xl">
    <table className="[&_td]:border-border [&_th]:border-border [&_th]:bg-card w-full min-w-[520px] border-collapse text-[0.8rem] tabular-nums [&_td]:border-b [&_td]:px-5 [&_td]:py-2 [&_td]:whitespace-nowrap [&_th]:sticky [&_th]:top-0 [&_th]:border-b [&_th]:px-5 [&_th]:py-2 [&_th]:font-medium [&_th]:whitespace-nowrap [&_tr:last-child_td]:border-b-0">
      <caption className="sr-only">
        {showActual ? "Evaluation interval comparisons" : "Forecast intervals"}
      </caption>
      <thead>
        <tr>
          <th className="text-left">
            {showPublishTime ? "Delivery hour, UK time" : "Delivery (UK)"}
          </th>
          <th className="text-right">{forecastLabel}</th>
          {showPublishTime && (
            <th className="text-right">Forecast publication time, UK time</th>
          )}
          {showActual && <th className="text-right">Actual</th>}
          {showActual && <th className="text-right">Error</th>}
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
            <td className="text-right">{formatMw(item.forecast_mw)}</td>
            {showPublishTime && (
              <td className="text-right">{formatUk(item.publish_time)}</td>
            )}
            {showActual && (
              <td className="text-right">{formatMw(item.actual_mw)}</td>
            )}
            {showActual && (
              <td className="text-right">{formatSignedMw(item.error_mw)}</td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
