import type { ReactNode } from "react";

import { DashboardTopbar } from "./dashboard-topbar";

export const DashboardLayout = ({ children }: { children: ReactNode }) => (
  <main className="bg-background min-h-screen min-w-0">
    <DashboardTopbar />
    <div className="mx-auto w-full max-w-[1200px]">{children}</div>
  </main>
);
