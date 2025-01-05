import { ThemeProvider } from "@/providers/theme-provider";
import { Outlet } from "@tanstack/react-router";
import { Toaster } from "@dumpanddone/ui";

export const Root = () => {

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="w-screen min-h-screen bg-card relative overflow-hidden flex flex-col items-center">
        <Outlet />
        <Toaster />
      </div>
    </ThemeProvider>
  );
};
