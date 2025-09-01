import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  Send, 
  X, 
  MessageSquare,
  FileText,
  Search,
  Lightbulb
} from "lucide-react";

interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialMessages: ChatMessage[] = [
  {
    id: '1',
    type: 'system',
    content: 'AI Assistant initialized. Ready to help with document intelligence.',
    timestamp: new Date(),
  },
  {
    id: '2',
    type: 'ai',
    content: 'Hello! I\'m your Nexus AI assistant. I can help you find documents, analyze content, and answer questions about KMRL operations. How can I assist you today?',
    timestamp: new Date(),
    suggestions: [
      'Find safety protocols for metro operations',
      'Show me recent financial reports',
      'What are the urgent documents?',
      'Summarize maintenance schedules'
    ]
  }
];

export function AIChatbot({ isOpen, onClose }: AIChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse.content,
        timestamp: new Date(),
        suggestions: aiResponse.suggestions
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userQuery: string): { content: string; suggestions?: string[] } => {
    const query = userQuery.toLowerCase();
    
    if (query.includes('safety') || query.includes('protocol')) {
      return {
        content: 'I found several safety-related documents:\n\n• **Safety Protocol Amendment - Metro Line 1 Operations Manual** (URGENT)\n• **Emergency Response Drill Report - December 2024** (URGENT)\n\nThese documents contain critical safety procedures and recent drill results. Would you like me to open any of these or search for specific safety topics?',
        suggestions: ['Open safety protocol document', 'Show emergency procedures', 'Find safety training materials']
      };
    }
    
    if (query.includes('financial') || query.includes('budget')) {
      return {
        content: 'Here are the recent financial documents:\n\n• **Q4 2024 Financial Performance Analysis and Budget Variance Report** (HIGH)\n• **Energy Consumption Optimization Study - Phase 2 Results** (HIGH)\n\nThe Q4 report shows budget variance analysis and revenue performance. The energy study includes cost optimization insights. What specific financial information do you need?',
        suggestions: ['Show budget variance details', 'Energy cost savings', 'Revenue analysis']
      };
    }
    
    if (query.includes('urgent')) {
      return {
        content: 'Currently, there are **2 urgent documents** requiring attention:\n\n🚨 **Safety Protocol Amendment - Metro Line 1 Operations Manual**\n🚨 **Emergency Response Drill Report - December 2024**\n\nBoth are from Safety & Operations department and need immediate review. Should I prioritize one for you?',
        suggestions: ['Open first urgent document', 'Review emergency drill report', 'Show all urgent items']
      };
    }
    
    if (query.includes('maintenance')) {
      return {
        content: '**Infrastructure Maintenance Schedule - January 2025** is available from the Engineering department. This document covers:\n\n• Railway track maintenance\n• Electrical system servicing\n• Monthly inspection schedules\n\nWould you like me to extract specific maintenance activities or dates?',
        suggestions: ['Show January schedule', 'Find track maintenance', 'Electrical system updates']
      };
    }
    
    return {
      content: `I understand you're asking about "${userQuery}". Let me search through the document database for relevant information. I can help you find specific documents, analyze content, or provide summaries of KMRL operational data.`,
      suggestions: ['Search documents', 'Show recent uploads', 'Analyze document trends', 'Get document summary']
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4">
      <Card className="w-96 h-[600px] shadow-lg border border-border/50 flex flex-col">
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            Nexus AI Assistant
            <Badge variant="secondary" className="text-xs ml-1">BETA</Badge>
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        {/* Chat Messages */}
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  {message.type === 'system' && (
                    <div className="text-center">
                      <Badge variant="outline" className="text-xs">
                        {message.content}
                      </Badge>
                    </div>
                  )}
                  
                  {message.type === 'user' && (
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground px-3 py-2 rounded-lg max-w-[80%] text-sm">
                        {message.content}
                      </div>
                    </div>
                  )}
                  
                  {message.type === 'ai' && (
                    <div className="flex justify-start">
                      <div className="space-y-3 max-w-[85%]">
                        <div className="bg-muted px-3 py-2 rounded-lg text-sm whitespace-pre-line">
                          {message.content}
                        </div>
                        
                        {message.suggestions && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Lightbulb className="w-3 h-3" />
                              Suggestions:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {message.suggestions.map((suggestion, idx) => (
                                <Button
                                  key={idx}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-6 px-2"
                                  onClick={() => handleSuggestionClick(suggestion)}
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted px-3 py-2 rounded-lg text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Ask about documents, search for files..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage} 
                size="icon"
                disabled={!inputValue.trim() || isTyping}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}