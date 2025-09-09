import React from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DocumentList } from "@/components/dashboard/DocumentList";
import { AIChatFAB } from "@/components/ai/AIChatFAB";
import { AnimatedBackground } from "@/components/ui/animated-background";

const Index = () => {
  console.log('[Index] Component rendering');
  
  return (
    <>
      <AnimatedBackground />
  <div className="flex h-screen min-h-screen w-screen bg-gradient-to-br from-background via-background/95 to-accent/5">
        {/* Sidebar */}
  { <DashboardSidebar /> }
        
        {/* Main Content */}
  <main className="flex-1 h-screen min-h-screen overflow-y-auto">
          <DashboardHeader />
          <DocumentList />
        </main>
      </div>
      
      {/* AI Chat Assistant */}
      <AIChatFAB />
    </>
  );
};

export default Index;
