import { Dashboard } from "./Dashboard";
import { DashboardProvider } from "@/providers/dashboard-provider";

const DashboardIndex = () => {
  return (
    <DashboardProvider>
      <Dashboard />
    </DashboardProvider>
  );
};

export default DashboardIndex;
