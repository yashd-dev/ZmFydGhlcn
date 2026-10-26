export const formatMw = (value: number | null | undefined) =>
  value === null || value === undefined || Number.isNaN(value)
    ? "N/A"
    : `${value.toFixed(2)} MW`;
export const formatUtc = (value: string | null | undefined) =>
  value
    ? `${new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(value))} UTC`
    : "N/A";
export const formatUk = (value: string | null | undefined) =>
  value
    ? new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Europe/London",
      }).format(new Date(value))
    : "N/A";
export const formatUkDate = (value: string | null | undefined) =>
  value
    ? new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeZone: "Europe/London",
      }).format(new Date(value))
    : "N/A";
export const metric = (values: Record<string, number | null>, key: string) =>
  formatMw(values[key]);
