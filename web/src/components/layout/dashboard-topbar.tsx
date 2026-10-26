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
  const activeIndex = pathname.startsWith("/accuracy") ? 1 : 0;
  return (
    <header className="flex shrink-0 items-center justify-center px-4 py-4 md:px-8">
      <nav
        aria-label="Primary"
        className="bg-background/90 relative grid w-fit grid-cols-2 rounded-full border p-1 shadow-sm backdrop-blur"
      >
        <span
          className={`bg-muted pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full transition-transform duration-300 ease-out ${activeIndex === 1 ? "translate-x-full" : "translate-x-0"}`}
          aria-hidden="true"
        />
        {links.map(({ href, label }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <a
              aria-current={active ? "page" : undefined}
              className={`relative z-10 rounded-full px-4 py-2 text-center text-sm transition-colors ${active ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
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
    </header>
  );
};
