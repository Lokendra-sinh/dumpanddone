import {
  Separator,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@dumpanddone/ui";
import { AppSidebar } from "../../components/app-sidebar";
import { DumpanddoneBreadcrumb } from "./BreadCrumb";
import { ModeToggle } from "../../components/toggle-mode";
import { Outlet } from "@tanstack/react-router";


export const Dashboard = () => {
 
  return (
    <SidebarProvider className="">
      <AppSidebar className="bg-background text-foreground" />

      <SidebarInset className="h-screen">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4 justify-between">
          <div className="flex items-center">
            <SidebarTrigger className="bg-background text-foreground -ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <DumpanddoneBreadcrumb />
          </div>
          <ModeToggle />
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
};


