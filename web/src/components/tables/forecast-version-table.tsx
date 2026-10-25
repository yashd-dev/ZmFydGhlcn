import { formatMw, formatUtc } from "@/src/lib/formatters";
import type { Forecast } from "@/src/types/api";

export const ForecastVersionTable = ({
  forecasts,
  interval,
}: {
  forecasts: Forecast[];
  interval: string;
}) => {
  const rows = interval
    ? forecasts.filter((item) => item.start_time === interval)
    : forecasts;
  return (
    <div className="overflow-x-auto">
      <table className="[&_td]:border-border [&_th]:border-border [&_th]:text-muted-foreground w-full border-collapse text-[0.8rem] [&_td]:border-b [&_td]:px-3 [&_td]:py-2.5 [&_td]:whitespace-nowrap [&_th]:border-b [&_th]:px-3 [&_th]:py-2.5 [&_th]:text-left [&_th]:font-medium [&_th]:whitespace-nowrap">
        <caption className="sr-only">Forecast versions</caption>
        <thead>
          <tr>
            <th>Delivery (UTC)</th>
            <th>Published (UTC)</th>
            <th>Forecast</th>
            <th>Eligibility</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr
              key={`${item.start_time}-${item.publish_time}`}
              className={item.eligible ? "bg-primary/5" : ""}
            >
              <td>{formatUtc(item.start_time)}</td>
              <td>{formatUtc(item.publish_time)}</td>
              <td>{formatMw(item.forecast_mw)}</td>
              <td>
                {item.eligible ? (
                  <span className="text-primary font-medium">
                    Selected at cutoff
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    Unavailable at decision time
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && (
        <p className="text-muted-foreground p-6 text-sm">
          No forecast versions match this delivery interval.
        </p>
      )}
    </div>
  );
};
