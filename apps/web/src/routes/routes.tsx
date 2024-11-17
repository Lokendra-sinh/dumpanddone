import { createRootRoute, createRoute, Outlet } from "@tanstack/react-router";
import { Dashboard } from "../pages/Dashboard/Dashboard";
import LandingPage from "../pages/Landing/LandingPage";
import { ThemeProvider } from "../providers/theme-provider";
import { DashboardProvider } from "../providers/dashboard-provider";


export const RootRoute = createRootRoute({
  component: () => (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="w-screen min-h-screen bg-black text-white relative overflow-hidden flex flex-col items-center">
        <Outlet />
      </div>
    </ThemeProvider>
  ),
  beforeLoad: () => {
    return {
      title: "Home"
    }
  }
});

export const IndexRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/",
  component: LandingPage,
  beforeLoad: () => {
    return {
      title: "Home"
    }
  }
});

export const DashboardRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/dashboard",
  component: () => {
    return (
      <DashboardProvider>
        <Dashboard />
      </DashboardProvider>
    )
  },
  beforeLoad: () => {
    return {
      title: "Dashboard"
    }
  }
});
