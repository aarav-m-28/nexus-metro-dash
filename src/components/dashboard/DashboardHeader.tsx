import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { FileUploadModal } from "@/components/upload/FileUploadModal";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";
import { ThemeToggle } from "../theme/ThemeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface DashboardHeaderProps {
  filter: 'all' | 'sharedByMe' | 'sharedWithMe';
  onFilterChange: (filter: 'all' | 'sharedByMe' | 'sharedWithMe') => void;
}

export function DashboardHeader({ filter, onFilterChange }: DashboardHeaderProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const { profile } = useProfile();
  const { user } = useAuth();

  return (
    <>
      <header className="flex justify-between items-center mb-6 md:mb-8">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:hidden" />
          <div>
            <h2 className="text-xl md:text-3xl font-bold text-foreground">Welcome back, {profile?.display_name || user?.email}</h2>
            <p className="text-muted-foreground text-sm md:text-base">Here's what's happening with your documents.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          <NotificationPanel>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors relative">
              <Bell className="w-5 h-5 md:w-6 md:h-6" />
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            </button>
          </NotificationPanel>
        </div>
      </header>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 md:gap-0">
        <div className="flex items-center gap-2 border-b flex-wrap">
          <button onClick={() => onFilterChange('all')} className={`px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base font-semibold transition-colors ${filter === 'all' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-primary'}`}>All Documents</button>
          <button onClick={() => onFilterChange('sharedByMe')} className={`px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base font-semibold transition-colors ${filter === 'sharedByMe' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-primary'}`}>Shared By Me</button>
          <button onClick={() => onFilterChange('sharedWithMe')} className={`px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base font-semibold transition-colors ${filter === 'sharedWithMe' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-primary'}`}>Shared With Me</button>
        </div>
        <Button onClick={() => setUploadOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          <span className="hidden md:inline">Upload Document</span>
        </Button>
      </div>
      <FileUploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} />
    </>
  );
}