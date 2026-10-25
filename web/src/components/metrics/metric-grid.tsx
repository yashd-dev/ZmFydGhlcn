import type { ReactNode } from "react";

export const MetricGrid = ({ children }: { children: ReactNode }) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
    {children}
  </div>
);
