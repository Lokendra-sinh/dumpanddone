import { createRootRoute, createRoute } from "@tanstack/react-router";
import Dashboard from "../pages/Dashboard/Dashboard";
import LandingPage from "../pages/Landing/LandingPage";

export const RootRoute = createRootRoute({
    component: () => {
        return (
            <LandingPage />
        )
    }
})


export const IndexRoute = createRoute({
    getParentRoute: () => RootRoute,
    path: "/",
    component: () => {
        return <h1>Home page</h1>
    }
})

export const DashboardRoute = createRoute({
    getParentRoute: () => RootRoute,
    path: "/dashboard",
    component: () => <Dashboard />
})



