import {
  createRootRoute,
  createRoute,
  lazyRouteComponent,
  redirect,
} from "@tanstack/react-router";
import LandingPage from "../pages/Landing/LandingPage";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { AuthRoute } from "./authenticated-route";
import { GithubCallback } from "@/pages/GithubCallback";
import { Root } from "@/pages/Root";
import { useUserStore } from "@/store/useUserStore";
import { PlaygroundIndex } from "@/pages/Dashboard/Playground/playground-index";

export const RootRoute = createRootRoute({
  component: Root,
  beforeLoad: async () => {
    try {
      const response = await fetch("http://localhost:4000/trpc/silentAuth", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        const userData = result.result.data;

        if (userData?.user) {
          useUserStore.setState({ user: userData.user });
          return {
            title: "Home",
            userData: userData.user, // Return user data to be available in other routes
          };
        }
      }

      return {
        title: "Home",
        userData: null,
      };
    } catch (error) {
      console.log("Silent auth check failed:", error);
      return {
        title: "Home",
        userData: null,
      };
    }
  },
});

export const IndexRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/",
  component: LandingPage,
  beforeLoad: () => {
    console.log("inside IndexRoute");
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
    console.log("search is", search);
    if (typeof search.code !== "string") {
      throw new Error("No code provided. Please retry or use another method");
    }
    return {
      code: search.code!,
    };
  },
  component: GithubCallback,
});

export const RegisterRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/register",
  component: Register,
});

export const DashboardRoute = createRoute({
  getParentRoute: () => AuthRoute,
  path: "/dashboard",
  component: lazyRouteComponent(
    () => import("../pages/Dashboard/DashboardIndex"),
  ),
  beforeLoad: () => {
    const user = useUserStore.getState().user;
    console.log("USER is", user);

    if (!user) {
      throw redirect({
        to: "/login",
        search: {
          redirect: window.location.pathname,
        },
      });
    }

    return {
      title: "Dashboard",
    };
  },
});

export const DashboardIndexRoute = createRoute({
  getParentRoute: () => DashboardRoute,
  path: "/",
  component: lazyRouteComponent(
    () => import("../pages/Dashboard/blogs/Blogs"),
  ),
});

export const BlogsRoute = createRoute({
  getParentRoute: () => DashboardRoute,
  path: "/blogs",
  component: lazyRouteComponent(
    () => import("../pages/Dashboard/blogs/Blogs"),
  ),
  beforeLoad: () => {
    console.log("inside blogs");
    return {
      title: "Blogs",
    };
  },
});


export const BlogEditorRoute = createRoute({
  getParentRoute: () => DashboardRoute,  // Changed to DashboardRoute
  path: "/editor/$blogId",               // Changed path to be more explicit
  component: PlaygroundIndex,
});

