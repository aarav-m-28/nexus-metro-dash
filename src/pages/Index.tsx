import React, { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DocumentList } from "@/components/dashboard/DocumentList";
import { AIChatFAB } from "@/components/ai/AIChatFAB";
import { AnimatedBackground } from "@/components/ui/animated-background";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

const Index = () => {
  console.log('[Index] Component rendering');
  const [filter, setFilter] = useState<'all' | 'sharedByMe' | 'sharedWithMe'>('all');
  
  return (
    <SidebarProvider>
      <AnimatedBackground />
      <Sidebar collapsible="icon">
        <DashboardSidebar />
      </Sidebar>
      <SidebarInset>
        <main className="p-6 bg-background/80 backdrop-blur-sm h-full">
          <h1 className="text-3xl font-bold mb-6 text-foreground">Dashboard</h1>
          <DashboardHeader filter={filter} onFilterChange={setFilter} />
          <DocumentList filter={filter} />
        </main>
      </SidebarInset>
      <AIChatFAB />
    </SidebarProvider>
  );
};

export default Index;