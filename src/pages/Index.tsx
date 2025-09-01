import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DocumentList } from "@/components/dashboard/DocumentList";
import { AIChatFAB } from "@/components/ai/AIChatFAB";

const Index = () => {
  return (
    <>
      <div className="min-h-screen bg-background flex">
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
