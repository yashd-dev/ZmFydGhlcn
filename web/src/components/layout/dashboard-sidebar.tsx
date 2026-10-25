import { Activity, ChartNoAxesCombined, LayoutDashboard } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { href: "/", icon: LayoutDashboard, label: "Overview" },
  { href: "/forecasts", icon: ChartNoAxesCombined, label: "Forecast Explorer" },
  { href: "/accuracy", icon: Activity, label: "Forecast accuracy" },
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
      <SidebarContent className="justify-center px-4">
        <SidebarMenu className="w-full gap-2">
          {items.map(({ label, href, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  isActive={active}
                  className="text-muted-foreground data-active:text-foreground h-auto rounded-xl px-3 py-2.5 text-sm"
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
    </Sidebar>
  );
};
