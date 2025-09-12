import React from "react";
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
  
  return (
    <SidebarProvider>
      <AnimatedBackground />
      <Sidebar collapsible="icon">
        <DashboardSidebar />
      </Sidebar>
      <SidebarInset>
        <DashboardHeader />
        <DocumentList />
      </SidebarInset>
      <AIChatFAB />
    </SidebarProvider>
  );
};

export default Index;
