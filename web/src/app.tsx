import { useSyncExternalStore } from "react";

import { AppProviders } from "./app/app-providers";
import { DashboardLayout } from "./components/layout/dashboard-layout";
import { AccuracyPage } from "./features/accuracy/accuracy-page";
import { OverviewPage } from "./features/overview/overview-page";

const App = () => {
  const path = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("popstate", onChange);
      return () => window.removeEventListener("popstate", onChange);
    },
    () => window.location.pathname,
    () => "/"
  );
  let page = <OverviewPage />;
  if (path === "/accuracy") {
    page = <AccuracyPage />;
  } else if (path !== "/") {
    page = (
      <div className="p-8">
        <h2 className="text-2xl font-semibold">Page not found</h2>
      </div>
    );
  }

  return (
    <AppProviders>
      <DashboardLayout>{page}</DashboardLayout>
    </AppProviders>
  );
};

export default App;
