import { Outlet } from "@tanstack/react-router";
import { Dashboard } from "./Dashboard";

export const DashboardIndex = () => {
  return (
    <>
      <Dashboard />
      <Outlet />
    </>
  );
};
