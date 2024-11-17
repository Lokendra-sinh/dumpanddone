
import {
    Sidebar as ShadcnSidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    // SidebarTrigger,
  } from "@dumpanddone/ui"
  import { Calendar, Home, Inbox, Settings } from "lucide-react"
  
  const items = [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Inbox,
    },
    {
      title: "Your blogs",
      url: "/blogs",
      icon: Calendar,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
  ]
  
  export const Sidebar = () => {
  
  
    return (
      <SidebarProvider className="w-54 min-h-full bg-red-100">
        <ShadcnSidebar className="bg-black">
        <SidebarContent className=' '>
        {/* <SidebarTrigger /> */}
          <SidebarGroup className='w-full bg-black'>
            <SidebarGroupLabel className='text-gray'>Application</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </ShadcnSidebar>
      </SidebarProvider>
    )
  }
  
  export default Sidebar
  