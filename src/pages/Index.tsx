import React, { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DocumentList } from "@/components/dashboard/DocumentList";
import { AIChatFAB } from "@/components/ai/AIChatFAB";

const Index = () => {
  const [filter, setFilter] = useState<'all' | 'sharedByMe' | 'sharedWithMe'>('all');
  
  return (
    <div className="flex h-screen bg-gray-900 text-gray-300">
      <DashboardSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <DashboardHeader filter={filter} onFilterChange={setFilter} />
        <DocumentList filter={filter} />
      </main>
      <AIChatFAB />
    </div>
  );
};

export default Index;