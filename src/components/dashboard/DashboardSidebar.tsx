import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NavLink, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { 
  LayoutDashboard, 
  Search, 
  Settings, 
  LogOut,
  Building2,
  User,
  Loader2,
  Database,
  RefreshCw,
  ChevronRight,
  Zap,
  Shield
} from "lucide-react";
import { Input } from "@/components/ui/input";


const sidebarItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
    badge: null
  },
  {
    title: "Search",
    icon: Search,
    path: "/search",
    badge: "New"
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
    badge: null
  }
];

export function DashboardSidebar() {
  const [sidebarSearch, setSidebarSearch] = useState("");
  const handleSidebarSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sidebarSearch.trim()) {
      navigate(`/search?query=${encodeURIComponent(sidebarSearch)}`);
      setSidebarSearch("");
    }
  };
  console.log('[DashboardSidebar] Component starting to render');
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading, clearAndRecreateProfile } = useProfile();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  console.log('[DashboardSidebar] Hooks initialized:', { 
    hasUser: !!user, 
    hasProfile: !!profile, 
    profileLoading 
  });

  // Debug logging
  console.log('[DashboardSidebar] Component render:', { 
    user: user?.email,
    profile: profile ? {
      display_name: profile.display_name,
      department: profile.department,
      job_title: profile.job_title,
      email: profile.email,
      id: profile.id,
      user_id: profile.user_id
    } : null,
    profileLoading
  });

  // Additional debug: Check if profile has hardcoded values
  if (profile) {
    console.log('[DashboardSidebar] Profile details:', {
      fullProfile: profile,
      isHardcoded: profile.display_name?.includes('Finance') || 
                  profile.department?.includes('Finance') || 
                  profile.job_title?.includes('Officer')
    });
  }

  // Force refresh profile data if user exists but profile is null
  useEffect(() => {
    if (user && !profile && !profileLoading) {
      console.log('[DashboardSidebar] User exists but no profile, forcing refresh');
      // This will trigger useProfile to refetch
    }
  }, [user, profile, profileLoading]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    console.log('[DashboardSidebar] Logout initiated');
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

      console.log('[DashboardSidebar] SignOut successful');
      
      // Clear all local storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Show success message
    toast({
      title: "Logged out successfully",
        description: "You have been signed out",
      });

      // Force navigation to login page
      console.log('[DashboardSidebar] Redirecting to login');
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

  const handleClearProfile = async () => {
    console.log('[DashboardSidebar] Clear profile initiated');
    
    try {
      await clearAndRecreateProfile();
      toast({
        title: "Profile cleared",
        description: "Profile has been reset and recreated",
      });
    } catch (error) {
      console.error('[DashboardSidebar] Clear profile error:', error);
      toast({
        title: "Error",
        description: "Failed to clear profile",
        variant: "destructive"
      });
    }
  };

  const debugDatabase = async () => {
    if (!user) return;
    
    console.log('[DashboardSidebar] Debugging database for user:', user.id);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id);
      
      console.log('[DashboardSidebar] Database query result:', { data, error });
      
      if (data && data.length > 0) {
        console.log('[DashboardSidebar] Found profiles in database:', data);
        data.forEach((profile, index) => {
          console.log(`[DashboardSidebar] Profile ${index + 1}:`, {
            id: profile.id,
            display_name: profile.display_name,
            department: profile.department,
            job_title: profile.job_title,
            email: profile.email,
            created_at: profile.created_at
          });
        });
      } else {
        console.log('[DashboardSidebar] No profiles found in database');
      }
    } catch (error) {
      console.error('[DashboardSidebar] Database debug error:', error);
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
        subtitle: profile.department && profile.job_title 
          ? `${profile.department} - ${profile.job_title}`
          : profile.department || profile.job_title || user?.email?.split('@')[0] || "User",
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

  return (
    <div 
      className="w-80 h-screen min-h-screen border-r border-slate-200 flex flex-col flex-shrink-0 relative z-10 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800"
      style={{ 
        position: 'relative',
        zIndex: 10,
        width: '320px'
      }}
    >
      {/* Header */}
  <div className="p-6 border-b border-slate-200 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-white dark:to-slate-300 dark:bg-gradient-to-r dark:text-transparent">
              Nexus Metro
            </h1>
            <p className="text-sm text-slate-500 font-medium">Document Intelligence</p>
          </div>
        </div>
        
        {/* Status Bar */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-200">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-emerald-700">Online</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-200">
            <Shield className="w-3 h-3 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Secure</span>
          </div>
        </div>
      </div>

      {/* Sidebar Search */}
      <form onSubmit={handleSidebarSearch} className="px-4 pt-4 pb-2">
        <Input
          type="text"
          placeholder="Search documents..."
          value={sidebarSearch}
          onChange={e => setSidebarSearch(e.target.value)}
          className="h-10 text-sm bg-background/80 border border-border/50 focus:border-primary/50 transition-all duration-200 dark:bg-slate-900 dark:text-slate-100"
        />
      </form>
      {/* Navigation */}
  <nav className="flex-1 p-4">
        <div className="space-y-1">
        {sidebarItems.map((item) => (
          <NavLink
              key={item.path}
            to={item.path}
              className={({ isActive }) =>
                cn(
                  "group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative",
                  isActive
                    ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200 shadow-sm dark:bg-gradient-to-r dark:from-indigo-900 dark:to-purple-900 dark:text-indigo-200 dark:border-indigo-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
              isActive
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md" 
                        : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700"
                    )}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-slate-800 dark:text-slate-100">{item.title}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <ChevronRight className="h-4 w-4 text-indigo-500" />
                    )}
                  </div>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-r-full"></div>
                  )}
                </>
              )}
          </NavLink>
        ))}
        </div>
      </nav>

      {/* User Profile */}
  <div className="p-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-600 rounded-2xl flex items-center justify-center shadow-md">
              <span className="text-lg font-bold text-white">
                {userInfo.initial}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {userInfo.name}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {userInfo.subtitle}
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-2">
          {/* Debug Database and Clear Profile buttons removed */}
        
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="w-full justify-start gap-2 text-xs h-8 border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-red-400 dark:text-red-300 dark:hover:border-red-500 dark:hover:bg-red-900 dark:hover:text-red-200"
    >
            {isLoggingOut ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <LogOut className="h-3 w-3" />
            )}
            {isLoggingOut ? "Signing out..." : "Sign Out"}
        </Button>
        </div>
      </div>
    </div>
  );
}