import {
  SidebarInset,
  SidebarProvider,
} from "@dumpanddone/ui";
import { AppSidebar } from "../../components/app-sidebar";
import { Outlet } from "@tanstack/react-router";


export const Dashboard = () => {

 
  return (
    <SidebarProvider className="">
      <AppSidebar className="bg-background text-foreground" />

      <SidebarInset className="w-full h-screen">
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
};


