import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { FileUploadModal } from "@/components/upload/FileUploadModal";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";

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
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">Welcome back, {profile?.display_name || user?.email}</h2>
          <p className="text-gray-400">Here's what's happening with your documents.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <NotificationPanel>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-colors relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            </button>
          </NotificationPanel>
          <div className="h-10 w-10 bg-indigo-500 rounded-full flex items-center justify-center font-bold text-white text-lg">
            {(profile?.display_name || user?.email || 'U').charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 border-b border-gray-700">
          <button onClick={() => onFilterChange('all')} className={`px-4 py-2 font-semibold ${filter === 'all' ? 'text-white border-b-2 border-indigo-400' : 'text-gray-400 hover:text-white transition-colors'}`}>All Documents</button>
          <button onClick={() => onFilterChange('sharedByMe')} className={`px-4 py-2 font-semibold ${filter === 'sharedByMe' ? 'text-white border-b-2 border-indigo-400' : 'text-gray-400 hover:text-white transition-colors'}`}>Shared By Me</button>
          <button onClick={() => onFilterChange('sharedWithMe')} className={`px-4 py-2 font-semibold ${filter === 'sharedWithMe' ? 'text-white border-b-2 border-indigo-400' : 'text-gray-400 hover:text-white transition-colors'}`}>Shared With Me</button>
        </div>
        <Button onClick={() => setUploadOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          <span>Upload Document</span>
        </Button>
      </div>
      <FileUploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} />
    </>
  );
}