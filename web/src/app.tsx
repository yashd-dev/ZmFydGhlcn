import { AppProviders } from "./app/app-providers";
import { DashboardLayout } from "./components/layout/dashboard-layout";
import { AccuracyPage } from "./features/accuracy/accuracy-page";
import { ForecastExplorerPage } from "./features/forecasts/forecast-explorer-page";
import { OverviewPage } from "./features/overview/overview-page";

const App = () => {
  const path = window.location.pathname;
  let page = <OverviewPage />;
  if (path === "/forecasts") {
    page = <ForecastExplorerPage />;
  } else if (path === "/accuracy") {
    page = <AccuracyPage />;
  }

  return (
    <AppProviders>
      <DashboardLayout>{page}</DashboardLayout>
    </AppProviders>
  );
};

export default App;
