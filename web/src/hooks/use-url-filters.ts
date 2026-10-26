import { useCallback, useSyncExternalStore } from "react";

import type { Alignment } from "@/src/types/api";

export const defaults = {
  alignment: "hour_mean" as Alignment,
  cutoff: "09:00",
  endDate: "2026-02-01",
  interval: "",
  startDate: "2026-01-20",
};
export const useUrlFilters = () => {
  const search = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("popstate", onChange);
      return () => window.removeEventListener("popstate", onChange);
    },
    () => window.location.search,
    () => ""
  );
  const params = new URLSearchParams(search);
  let storedStart = "";
  try {
    storedStart = window.localStorage.getItem("wind-delivery-date") ?? "";
  } catch {
    // Storage can be blocked by the browser.
  }
  const requestedStart = params.get("start_date") || storedStart;
  const requestedEnd = params.get("end_date") ?? "";
  const startDate =
    requestedStart >= "2026-01-02" && requestedStart <= defaults.endDate
      ? requestedStart
      : defaults.startDate;
  const endDate =
    requestedEnd >= startDate && requestedEnd <= defaults.endDate
      ? requestedEnd
      : defaults.endDate;
  const requestedCutoff = params.get("cutoff") ?? "";
  const cutoff = /^(?<hour>[01][0-9]|2[0-3]):(?<minute>00|30)$/u.test(
    requestedCutoff
  )
    ? requestedCutoff
    : defaults.cutoff;
  const filters = {
    alignment:
      params.get("alignment") === "hour_start_point"
        ? ("hour_start_point" as const)
        : defaults.alignment,
    cutoff,
    endDate,
    interval: params.get("interval") ?? defaults.interval,
    startDate,
  };
  const setFilters = useCallback((updates: Partial<typeof filters>) => {
    const next = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(updates)) {
      const name = key.replaceAll(
        /[A-Z]/gu,
        (char) => `_${char.toLowerCase()}`
      );
      if (value) {
        next.set(name, value);
        if (key === "startDate") {
          try {
            window.localStorage.setItem("wind-delivery-date", value);
          } catch {
            // Storage can be blocked by the browser.
          }
        }
      } else {
        next.delete(name);
      }
    }
    window.history.pushState({}, "", `${window.location.pathname}?${next}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, []);
  return { filters, setFilters };
};
