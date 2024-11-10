import { createRouter } from "@tanstack/react-router";
import { RootRoute, IndexRoute, DashboardRoute } from "./routes/routes";

const routeTree = RootRoute.addChildren([
IndexRoute,
DashboardRoute
])

export const router = createRouter({routeTree})

declare module '@tanstack/react-router' {
    interface Register{
        router: typeof router
    }
}