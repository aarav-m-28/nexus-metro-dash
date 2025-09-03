import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DocumentList } from "@/components/dashboard/DocumentList";
import { AIChatFAB } from "@/components/ai/AIChatFAB";
import { AnimatedBackground } from "@/components/ui/animated-background";

const Index = () => {
  return (
    <>
      <AnimatedBackground />
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/5 flex relative z-10">
        {/* Sidebar */}
        <DashboardSidebar />
        
        {/* Main Content */}
        <div className="flex-1 ml-60">
          <DashboardHeader />
          <DocumentList />
        </div>
      </div>
      
      {/* AI Chat Assistant */}
      <AIChatFAB />
    </>
  );
};

export default Index;
