import { createRoute, Outlet, redirect } from "@tanstack/react-router";
import { RootRoute } from "./routes";

export const AuthRoute = createRoute({
  getParentRoute: () => RootRoute,
  loader: async ({ context }) => {
    // Access the userData from root loader data
    
    if (!context.userData) {
      throw redirect({
        to: "/login",
        search: {
          redirect: window.location.pathname,
        },
      });
    }
    
    return null;
  },
  component: () => <Outlet />,
  id: "auth-route",
});