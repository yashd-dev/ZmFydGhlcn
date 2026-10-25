import { Activity, ChartNoAxesCombined, LayoutDashboard } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { Brand } from "./brand";

const items = [
  { href: "/", icon: LayoutDashboard, label: "Overview" },
  { href: "/forecasts", icon: ChartNoAxesCombined, label: "Forecast Explorer" },
  { href: "/accuracy", icon: Activity, label: "Accuracy Analysis" },
];
export const DashboardSidebar = () => {
  const { isMobile, setOpenMobile } = useSidebar();
  const { pathname } = window.location;
  const closeMobile = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };
  return (
    <Sidebar className="border-none p-0.5">
      <SidebarHeader className="px-4 pt-6 pb-8">
        <Brand />
      </SidebarHeader>
      <SidebarContent className="px-4">
        <SidebarMenu className="gap-2">
          {items.map(({ label, href, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  isActive={active}
                  className="h-auto rounded-none px-3 py-3 text-sm"
                  render={
                    <a
                      href={href}
                      onClick={closeMobile}
                      aria-label={label}
                      aria-current={active ? "page" : undefined}
                    />
                  }
                >
                  <Icon />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="px-4 pb-5">
        <div className="text-muted-foreground border-t pt-4 text-xs">
          <div>Elexon BMRS</div>
          <div>January 2026 analysis</div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
