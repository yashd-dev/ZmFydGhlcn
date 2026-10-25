import type { CSSProperties, ReactNode } from "react";

import { SidebarProvider } from "@/components/ui/sidebar";

import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";

export const DashboardLayout = ({ children }: { children: ReactNode }) => (
  <SidebarProvider
    defaultOpen
    className="h-svh overflow-hidden"
    style={{ "--sidebar-width": "15.625rem" } as CSSProperties}
  >
    <DashboardSidebar />
    <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-3 md:p-4">
      <div className="bg-background flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border shadow-sm">
        <DashboardTopbar />
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </main>
  </SidebarProvider>
);
