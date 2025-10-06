import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { 
  LayoutDashboard, 
  Search, 
  Settings, 
  LogOut,
  Loader2,
  Shield,
  FileSignature,
  FilePlus,
} from "lucide-react";

const sidebarItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
    roles: ['student', 'faculty_advisor', 'hod'],
  },
  {
    title: "Permissions",
    icon: FilePlus,
    path: "/permissions",
    roles: ['student', 'faculty_advisor', 'hod'],
  },
  {
    title: "Search",
    icon: Search,
    path: "/search",
    roles: ['student', 'faculty_advisor', 'hod'],
  },
  {
    title: "Signature Requests",
    icon: FileSignature,
    path: "/signature-requests",
    roles: ['faculty_advisor', 'hod'],
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
    roles: ['student', 'faculty_advisor', 'hod'],
  },
  {
    title: "Faculty Assignments",
    icon: Shield,
    path: "/faculty-assignments",
    roles: ['hod'],
  }
];

export function DashboardSidebar() {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { state: sidebarState } = useSidebar();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      toast({ title: "Logging out...", description: "Please wait while we sign you out" });
      const { error } = await signOut();
      if (error) throw error;
      localStorage.clear();
      sessionStorage.clear();
      toast({ title: "Logged out successfully", description: "You have been signed out" });
      window.location.href = '/#/login';
    } catch (error) {
      console.error('[DashboardSidebar] Logout error:', error);
      localStorage.clear();
      sessionStorage.clear();
      toast({ title: "Logout completed", description: "You have been signed out" });
      window.location.href = '/#/login';
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getUserDisplayInfo = () => {
    if (profileLoading) return { name: "Loading...", initial: "L" };
    if (profile) return { name: profile.display_name || user?.email || "User", initial: (profile.display_name || user?.email || "U").charAt(0).toUpperCase() };
    if (user) return { name: user.email || "User", initial: (user.email || "U").charAt(0).toUpperCase() };
    return { name: "No profile", initial: "U" };
  };

  const userInfo = getUserDisplayInfo();

  const visibleSidebarItems = sidebarItems.filter(item => {
    if (!profile || !profile.role) return false;
    return item.roles.includes(profile.role.toLowerCase());
  });

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <SidebarHeader className="p-6 flex items-center gap-3">
        <svg className="h-8 w-8 text-sidebar-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
        <h1 className="text-2xl font-bold text-sidebar-foreground">Nexus</h1>
      </SidebarHeader>
      <SidebarContent className="flex-1 px-4 py-2 space-y-2">
        <SidebarMenu>
          {visibleSidebarItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <NavLink to={item.path} className="w-full">
                {({ isActive }) => (
                  <SidebarMenuButton isActive={isActive} className={cn("flex items-center gap-3 px-4 py-2 rounded-lg transition-colors", isActive ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary")}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                )}
              </NavLink>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center font-bold text-primary-foreground text-lg">{userInfo.initial}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">{userInfo.name}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full justify-center text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4 mr-2" />} 
          {isLoggingOut ? "Signing out..." : "Sign Out"}
        </Button>
      </SidebarFooter>
    </aside>
  );
}