import { createRootRoute, createRoute, lazyRouteComponent, Outlet } from "@tanstack/react-router";
import LandingPage from "../pages/Landing/LandingPage";
import { ThemeProvider } from "../providers/theme-provider";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { Toaster } from "@dumpanddone/ui";
import { AuthRoute } from "./authenticated-route";
import { GithubCallback } from "@/pages/GithubCallback";

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
      title: "Home",
    };
  },
});

export const IndexRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/",
  component: LandingPage,
  beforeLoad: () => {
    return {
      title: "Home",
    };
  },
});

export const LoginRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/login",
  component: Login,
});

export const GithubCallbackRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/auth/github-callback",
  validateSearch: (search) => {
    console.log("search is", search)
    if(typeof search.code !== 'string'){
      throw new Error("No code provided. Please retry or use another method")
    }
    return {
      code: search.code!
    }
  },
  component: GithubCallback,
})

export const RegisterRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/register",
  component: Register,
});

export const DashboardRoute = createRoute({
  getParentRoute: () => AuthRoute,
  path: "/dashboard",
  component: lazyRouteComponent(() => import('../pages/Dashboard/Dashboard')),
  beforeLoad: () => {
    return {
      title: "Dashboard",
    };
  },
});
