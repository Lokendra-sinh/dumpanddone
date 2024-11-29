import { createRouter } from "@tanstack/react-router";
import {
  RootRoute,
  IndexRoute,
  DashboardRoute,
  LoginRoute,
  RegisterRoute,
  GithubCallbackRoute,
} from "./routes/routes";
import { AuthRoute } from "./routes/authenticated-route";

const AuthenticatedRoutes = [DashboardRoute];

const NonAuthenticatedRoutes = [IndexRoute, LoginRoute, RegisterRoute, GithubCallbackRoute];

const routeTree = RootRoute.addChildren([
  ...NonAuthenticatedRoutes,
  AuthRoute.addChildren([...AuthenticatedRoutes]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
