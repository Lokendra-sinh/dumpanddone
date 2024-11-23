import { createRouter } from "@tanstack/react-router";
import { RootRoute, IndexRoute, DashboardRoute, LoginRoute, RegisterRoute } from "./routes/routes";

const routeTree = RootRoute.addChildren([
IndexRoute,
LoginRoute,
RegisterRoute,
DashboardRoute
])

export const router = createRouter({routeTree})

declare module '@tanstack/react-router' {
    interface Register{
        router: typeof router
    }
}