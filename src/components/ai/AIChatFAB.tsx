import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AIChatbot } from "./AIChatbot";
import { Bot, MessageSquare } from "lucide-react";

export function AIChatFAB() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary-hover group relative"
          size="icon"
        >
          {isChatOpen ? (
            <MessageSquare className="w-6 h-6 text-primary-foreground" />
          ) : (
            <Bot className="w-6 h-6 text-primary-foreground group-hover:scale-110 transition-transform" />
          )}
          
          {/* Notification Badge */}
          {!isChatOpen && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center bg-urgent text-urgent-foreground border-2 border-background">
              2
            </Badge>
          )}
        </Button>
        
        {/* Tooltip */}
        {!isChatOpen && (
          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
            <div className="bg-card text-card-foreground px-3 py-2 rounded-lg shadow-md border text-sm whitespace-nowrap">
              Ask Nexus AI Assistant
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-border"></div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Interface */}
      <AIChatbot 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </>
  );
}