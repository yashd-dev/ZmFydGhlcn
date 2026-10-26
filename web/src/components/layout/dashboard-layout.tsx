import type { ReactNode } from "react";

import { DashboardTopbar } from "./dashboard-topbar";

export const DashboardLayout = ({ children }: { children: ReactNode }) => (
  <main className="bg-background flex h-svh min-h-0 min-w-0 flex-col overflow-hidden">
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <DashboardTopbar />
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  </main>
);
