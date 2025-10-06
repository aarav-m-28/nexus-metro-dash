import React, { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DocumentList } from "@/components/dashboard/DocumentList";
import { AIChatFAB } from "@/components/ai/AIChatFAB";
import { Sidebar, SidebarInset } from "@/components/ui/sidebar";

const Index = () => {
  const [filter, setFilter] = useState<'all' | 'sharedByMe' | 'sharedWithMe'>('all');
  
  return (
    <div className="flex h-screen bg-background">
      <Sidebar>
        <DashboardSidebar />
      </Sidebar>
      <SidebarInset>
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <DashboardHeader filter={filter} onFilterChange={setFilter} />
          <DocumentList filter={filter} />
        </main>
      </SidebarInset>
      <AIChatFAB />
    </div>
  );
};

export default Index;