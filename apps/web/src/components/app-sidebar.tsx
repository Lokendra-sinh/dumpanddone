import * as React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@dumpanddone/ui"
import { Link } from "@tanstack/react-router"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Home",
      url: "/",
    },
    {
      title: "Dashboard",
      url: "/dashboard",
    },
    {
      title: "Your blogs",
      url: "/blogs",
    },
    {
      title: "Settings",
      url: "/settings",
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="bg-background text-foreground" {...props}>
      <div className="h-16 flex items-center px-2 bg-background text-foreground">
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 60 60" 
    className="w-8 h-8"
  >
    <defs>
      <linearGradient id="themeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" className="text-foreground" stopColor="currentColor" stopOpacity="1" />
        <stop offset="100%" className="text-foreground" stopColor="currentColor" stopOpacity="0.8" />
      </linearGradient>
    </defs>
    
    <path 
      d="M 15,30
         C 15,22 22,15 30,15
         L 45,15
         C 40,15 35,20 35,25
         C 35,35 45,35 45,45
         C 45,50 40,45 30,45
         L 15,45
         Z" 
      fill="url(#themeGradient)"
      className="text-foreground"
    />
  </svg>
  <span className="text-xl font-bold text-foreground">dumpanddone</span>
</div>
      <SidebarContent className="bg-background py-4">
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup className="my-0 py-0" key={item.title}>
             <SidebarGroupContent>
              <SidebarMenu>
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.url}>{item.title}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
