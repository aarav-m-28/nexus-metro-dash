import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Bell, LogOut, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { FileUploadModal } from "@/components/upload/FileUploadModal";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface DashboardHeaderProps {
  filter: 'all' | 'sharedByMe' | 'sharedWithMe';
  onFilterChange: (filter: 'all' | 'sharedByMe' | 'sharedWithMe') => void;
}

export function DashboardHeader({ filter, onFilterChange }: DashboardHeaderProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    console.log('[DashboardHeader] logout click - current user:', user?.email);
    try {
      const { error } = await signOut();
      console.log('[DashboardHeader] signOut result:', { error });
      
      if (error) {
        console.warn('[DashboardHeader] logout error', error);
      }

      console.log('[DashboardHeader] logout successful, forcing page reload');
      
      // Clear all auth-related data
      localStorage.clear();
      sessionStorage.clear();
      
      // Force complete page reload to reset all state
      window.location.href = '/#/login';
      
    } catch (e) {
      console.error('[DashboardHeader] logout unexpected error', e);
      // Even on error, force reload to reset state
      window.location.href = '/#/login';
    }
  };

  return (
    <div className="bg-card/80 backdrop-blur-sm border-b border-border/50 p-6 animate-fade-in-0 sticky top-0 z-10">
      {/* Page Title */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {user?.email || "User"}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <NotificationPanel>
            <Button variant="ghost" size="icon" className="relative group hover:scale-105 transition-all duration-200">
              <Bell className="w-5 h-5 transition-colors" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-urgent rounded-full animate-pulse"></span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-urgent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md" />
            </Button>
          </NotificationPanel>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={user?.email || ""} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2">
          <Button onClick={() => onFilterChange('all')} variant={filter === 'all' ? 'secondary' : 'ghost'} size="sm">All Documents</Button>
          <Button onClick={() => onFilterChange('sharedByMe')} variant={filter === 'sharedByMe' ? 'secondary' : 'ghost'} size="sm">Shared By Me</Button>
          <Button onClick={() => onFilterChange('sharedWithMe')} variant={filter === 'sharedWithMe' ? 'secondary' : 'ghost'} size="sm">Shared With Me</Button>
        </div>
          <Button type="button" onClick={() => setUploadOpen(true)} className="gap-2">
            Upload Document
          </Button>
          <FileUploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} />
      </div>
    </div>
  );
}