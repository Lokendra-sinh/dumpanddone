import { createRootRoute, createRoute, Outlet } from "@tanstack/react-router";
import { Dashboard } from "../pages/Dashboard/Dashboard";
import LandingPage from "../pages/Landing/LandingPage";
import { ThemeProvider } from "../providers/theme-provider";
import { DashboardProvider } from "../providers/dashboard-provider";
import { Login } from "../pages/Login"
import { Register } from '../pages/Register'
import { Toaster } from '@dumpanddone/ui'
import { AuthRoute } from "./authenticated-route";


export const RootRoute = createRootRoute({
  component: () => (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="w-screen min-h-screen bg-black text-white relative overflow-hidden flex flex-col items-center">
        <Outlet />
        <Toaster />
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

export const LoginRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/login",
  component: Login,

})

export const RegisterRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/register",
  component: Register
})

export const DashboardRoute = createRoute({
  getParentRoute: () => AuthRoute,
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
