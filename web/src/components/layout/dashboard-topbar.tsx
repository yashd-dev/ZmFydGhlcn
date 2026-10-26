import { useSyncExternalStore } from "react";

const links = [
  { href: "/", label: "Overview" },
  { href: "/accuracy", label: "Forecast accuracy" },
];

export const DashboardTopbar = () => {
  const pathname = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("popstate", onChange);
      return () => window.removeEventListener("popstate", onChange);
    },
    () => window.location.pathname,
    () => "/"
  );
  return (
    <header className="bg-background/90 sticky top-0 z-10 flex h-14 items-center border-b px-4 backdrop-blur sm:px-8">
      <div className="mx-auto flex w-full max-w-[1200px] justify-center">
        <nav aria-label="Primary" className="flex h-14 gap-6 overflow-x-auto">
          {links.map(({ href, label }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <a
                aria-current={active ? "page" : undefined}
                className={`flex h-full shrink-0 items-center border-b-2 text-sm transition-colors ${active ? "border-primary text-foreground font-semibold" : "text-muted-foreground hover:text-foreground border-transparent"}`}
                href={href}
                key={href}
                onClick={(event) => {
                  event.preventDefault();
                  if (window.location.pathname === href) {
                    return;
                  }
                  window.history.pushState(
                    {},
                    "",
                    `${href}${window.location.search}`
                  );
                  window.dispatchEvent(new PopStateEvent("popstate"));
                }}
              >
                {label}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
