import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { 
  LayoutDashboard, 
  Search, 
  Settings, 
  FileText,
  LogOut,
  User,
  Loader2,
  Database,
  RefreshCw,
  ChevronRight,
  Shield,
  FileSignature,
  FilePlus,
} from "lucide-react";


const sidebarItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
    badge: null,
    roles: ['student', 'faculty_advisor', 'hod'],
  },
  {
    title: "Permissions",
    icon: FilePlus,
    path: "/permissions",
    badge: null,
    roles: ['student'],
  },
  {
    title: "Search",
    icon: Search,
    path: "/search",
    badge: null,
    roles: ['student', 'faculty_advisor', 'hod'],
  },
  {
    title: "Signature Requests",
    icon: FileSignature,
    path: "/signature-requests",
    badge: null,
    roles: ['faculty_advisor', 'hod'],
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
    badge: null,
    roles: ['student', 'faculty_advisor', 'hod'],
  }
];

export function DashboardSidebar() {
  interface Profile {
    id: string;
    user_id: string;
    display_name: string;
    email: string;
    role: string;
  }
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading, clearAndRecreateProfile } = useProfile();
  const { state: sidebarState } = useSidebar();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      // Show loading state
      toast({
        title: "Logging out...",
        description: "Please wait while we sign you out",
      });

      // Call the auth signOut function
      const { error } = await signOut();
      
      if (error) {
        console.error('[DashboardSidebar] SignOut error:', error);
        throw error;
      }

      // Clear all local storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Show success message
    toast({
      title: "Logged out successfully",
        description: "You have been signed out",
      });

      // Force navigation to login page
      window.location.href = '/#/login';
      
    } catch (error) {
      console.error('[DashboardSidebar] Logout error:', error);
      
      // Even if signOut fails, clear local data and redirect
      localStorage.clear();
      sessionStorage.clear();
      
      toast({
        title: "Logout completed",
        description: "You have been signed out",
      });
      
      // Force navigation to login page
      window.location.href = '/#/login';
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Get user display info
  const getUserDisplayInfo = () => {
    if (profileLoading) {
      return {
        name: "Loading...",
        subtitle: "Loading...",
        initial: "L"
      };
    }

    if (profile) {
      return {
        name: profile.display_name || user?.email || "User",
        subtitle: user?.email?.split('@')[0] || "User",
        initial: (profile.display_name || user?.email || "U").charAt(0).toUpperCase()
      };
    }

    if (user) {
      return {
        name: user.email || "User",
        subtitle: user.email?.split('@')[0] || "User",
        initial: (user.email || "U").charAt(0).toUpperCase()
      };
    }

    return {
      name: "No profile",
      subtitle: "User",
      initial: "U"
    };
  };

  const userInfo = getUserDisplayInfo();

  const visibleSidebarItems = sidebarItems.filter(item => {
    if (!profile || !profile.role) return false;
    return item.roles.includes(profile.role.toLowerCase());
  });

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg group-data-[collapsible=icon]:hidden">
              Nexus
            </span>
          </div>
          <SidebarTrigger className="hidden md:flex" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        

        <SidebarMenu>
          {visibleSidebarItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <NavLink to={item.path} className="w-full">
                {({ isActive }) => (
                  <SidebarMenuButton
                    isActive={isActive}
                    tooltip={{ children: item.title, side: "right" }}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto group-data-[collapsible=icon]:hidden">
                        <div className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full">
                          {item.badge}
                        </div>
                      </span>
                    )}
                  </SidebarMenuButton>
                )}
              </NavLink>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-md font-bold text-white">
                {userInfo.initial}
              </span>
            </div>
          </div>
          <div
            className={cn(
              "flex-1 min-w-0 group-data-[collapsible=icon]:hidden",
              { "hidden": sidebarState === "collapsed" }
            )}
          >
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {userInfo.name}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {userInfo.subtitle}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full justify-center text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/50 dark:hover:text-red-300"
          aria-label="Sign Out"
        >
          {sidebarState === "expanded" ? (
            <div className="flex w-full items-center justify-between px-2">
              <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
            </div>
          ) : isLoggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
        </Button>
      </SidebarFooter>
    </>
  );
}
