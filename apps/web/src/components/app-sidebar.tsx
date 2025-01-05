import * as React from "react";
import {
  Button,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@dumpanddone/ui";
import { Link } from "@tanstack/react-router";
import { 
  Home, 
  LayoutDashboard, 
  BookOpen, 
  Settings,
  Command,
  LogOut,
  Ellipsis
} from "lucide-react"; // Using Lucide icons for consistency
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@dumpanddone/ui";
import { Avatar, AvatarImage, AvatarFallback } from "@dumpanddone/ui";
import { useUserStore } from "@/store/useUserStore";


// Updated navigation data with icons
const navigationItems = [
  {
    title: "Home",
    url: "/",
    icon: Home
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Your blogs",
    url: "/dashboard/blogs",
    icon: BookOpen
  },
];


function UserDropdown() {
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);

  const handleLogout = () => {
    clearUser();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full flex items-center justify-between px-3 py-2 hover:bg-accent/5 rounded-md">
            <Avatar className="h-8 w-8 bg-purple-600">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="text-white text-sm">
                {user?.name ? getInitials(user.name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-[15px] text-foreground">
               User
            </span>
            <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[280px] p-0" align="end" side="right">
        {/* Email Section */}
        <div className="px-4 py-3 flex items-center gap-3 hover:bg-accent/5">
          <Avatar className="h-8 w-8 bg-purple-600">
            <AvatarFallback className="text-white text-sm">
              {getInitials(user?.name || 'U')}
            </AvatarFallback>
          </Avatar>
          <span className="text-[15px] text-foreground">
            {user?.email || 'user@example.com'}
          </span>
        </div>
        
        <DropdownMenuSeparator className="my-0" />
        
        {/* Menu Items */}
        <div className="py-1 px-1">
          <DropdownMenuItem asChild className="">
            <Link 
              to="/dashboard/settings" 
              className="px-4 py-2.5 flex items-center gap-3 hover:bg-accent/5 focus:bg-accent/5"
            >
              <Settings className="h-5 w-5 text-muted-foreground hover:bg-background" />
              <span className="text-[15px] text-foreground hover:text-accent">Account Settings</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleLogout} 
            className="px-4 py-2.5 flex items-center gap-3 hover:bg-accent/5 focus:bg-accent/5"
          >
            <LogOut className="h-5 w-5 text-muted-foreground" />
            <span className="text-[15px] text-foreground">Sign Out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Updated AppSidebar component
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="bg-background text-foreground flex flex-col" {...props}>
      {/* Logo Section */}
      <div className="h-12 flex items-center px-4 bg-background text-foreground border-b border-border">
        <Command className="w-6 h-6 mr-2" />
        <span className="text-xl font-bold text-foreground">dumpanddone</span>
      </div>

      {/* Main Navigation */}
      <SidebarContent className="bg-background py-4 flex-1">
        {navigationItems.map((item) => (
          <SidebarGroup className="my-0 py-0" key={item.title}>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className="flex items-center gap-3 px-4 py-2 hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* User Avatar Dropdown at bottom */}
      <div className="w-full bg-background mt-auto px-4 pb-4">
  <SidebarGroup className="w-full my-0 py-0">
    <SidebarGroupContent>
      <SidebarMenu>
        <SidebarMenuItem className="px-0">
          <UserDropdown />
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
</div>

      <SidebarRail />
    </Sidebar>
  );
}