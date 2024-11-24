import { createRoute, Outlet, redirect } from "@tanstack/react-router";
import { RootRoute } from "./routes";
import { useUserStore } from "@/store/useUserStore";




export const AuthRoute = createRoute({
    getParentRoute: () => RootRoute,
    component: () => <Outlet />,
    id: "auth-route",
    beforeLoad: () => {
        console.log("Checking whether user is logegd in ornot");
        const isLoggedIn = useUserStore.getState().user !== null
        console.log("USer logfed in ",isLoggedIn);
        if(!isLoggedIn){
            throw redirect({
                to: "/login",
                search: {
                    redirect: window.location.pathname
                }
        })
        }
    }

})