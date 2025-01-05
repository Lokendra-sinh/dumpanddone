import {
  SidebarInset,
  SidebarProvider,
} from "@dumpanddone/ui";
import { AppSidebar } from "../../components/app-sidebar";
import { Outlet } from "@tanstack/react-router";

export const Dashboard = () => {
  return (
    <SidebarProvider className="bg-background">
      <AppSidebar className="bg-card text-foreground border-r border-border" />

      <SidebarInset className="w-full h-screen bg-background">
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
};
