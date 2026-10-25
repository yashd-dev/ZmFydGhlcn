import type { ReactNode } from "react";

import { DashboardTopbar } from "./dashboard-topbar";

export const DashboardLayout = ({ children }: { children: ReactNode }) => (
  <main className="bg-muted/30 flex h-svh min-h-0 min-w-0 flex-col overflow-hidden p-3 md:p-5">
    <div className="bg-background flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border shadow-sm">
      <DashboardTopbar />
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  </main>
);
