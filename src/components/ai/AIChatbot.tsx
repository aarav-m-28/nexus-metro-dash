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
  Lightbulb,
  AlertCircle,
  ChevronDown,
  BookOpen,
  FileSearch,
  Sparkles
} from "lucide-react";
import { aiApi } from "@/lib/ai-api";

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
    content: 'Nexus AI Assistant initialized. Connected to document database.',
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
<<<<<<< HEAD
  const [isConnected, setIsConnected] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [availableDocuments, setAvailableDocuments] = useState<any[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
        setShowScrollButton(false);
      }
    }
  };

  const handleScroll = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
        setShowScrollButton(!isNearBottom);
      }
    }
  };
=======
  const viewportRef = useRef<HTMLDivElement>(null);
>>>>>>> cfd1ebe2a973c94df3d5a452d6505f2168c6e4e0

  useEffect(() => {
    // When new messages are added, scroll to the bottom of the viewport.
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Load available documents when chatbot opens
  useEffect(() => {
    if (isOpen) {
      loadAvailableDocuments();
    }
  }, [isOpen]);

  const loadAvailableDocuments = async () => {
    try {
      const summary = await aiApi.getDocumentsSummary();
      if (summary.documents) {
        setAvailableDocuments(summary.documents);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleAnalyzeDocument = async (documentId: string, documentTitle: string) => {
    setIsTyping(true);
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: `Analyze document: ${documentTitle}`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const analysis = await aiApi.analyzeDocument(documentId);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `## Document Analysis: ${documentTitle}\n\n${analysis.analysis}`,
        timestamp: new Date(),
        suggestions: ['Search for similar documents', 'Find related files', 'Get document summary']
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Sorry, I couldn't analyze the document "${documentTitle}". Please try again or check if the document is accessible.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSearchDocuments = async (query: string) => {
    setIsTyping(true);
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: `Search documents: ${query}`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const searchResults = await aiApi.searchDocuments(query, 5);
      
      let content = `## Search Results for "${query}"\n\n`;
      
      if (searchResults.documents.length === 0) {
        content += "No documents found matching your search criteria.";
      } else {
        content += `Found ${searchResults.documents.length} document(s):\n\n`;
        searchResults.documents.forEach((doc, index) => {
          content += `${index + 1}. **${doc.title}**\n`;
          content += `   - Department: ${doc.department || 'Unknown'}\n`;
          content += `   - Priority: ${doc.priority || 'Normal'}\n`;
          content += `   - Type: ${doc.file_type || 'Unknown'}\n`;
          if (doc.description) {
            content += `   - Description: ${doc.description}\n`;
          }
          content += `\n`;
        });
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: content,
        timestamp: new Date(),
        suggestions: ['Analyze first document', 'Search for more specific terms', 'Show all documents']
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Sorry, I couldn't search documents for "${query}". Please try again.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await aiApi.sendMessage(currentInput);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.response,
        timestamp: new Date(),
        suggestions: generateSuggestions(response.response)
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsConnected(true);
    } catch (error) {
      console.error('AI API Error:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `I'm having trouble connecting to the AI service. Please make sure the AI backend is running on port 8000. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      setIsConnected(false);
    } finally {
      setIsTyping(false);
    }
  };

  const generateSuggestions = (response: string): string[] => {
    const suggestions: string[] = [];
    
    if (response.toLowerCase().includes('safety') || response.toLowerCase().includes('protocol')) {
      suggestions.push('Show safety documents', 'Find emergency procedures', 'Safety training materials');
    }
    
    if (response.toLowerCase().includes('financial') || response.toLowerCase().includes('budget')) {
      suggestions.push('Show financial reports', 'Budget analysis', 'Revenue data');
    }
    
    if (response.toLowerCase().includes('urgent') || response.toLowerCase().includes('priority')) {
      suggestions.push('Show urgent documents', 'High priority items', 'Review deadlines');
    }
    
    if (response.toLowerCase().includes('maintenance')) {
      suggestions.push('Maintenance schedules', 'Equipment status', 'Inspection reports');
    }
    
    // Default suggestions if no specific context
    if (suggestions.length === 0) {
      suggestions.push('Search documents', 'Show recent uploads', 'Find by department', 'Get document summary');
    }
    
    return suggestions.slice(0, 4); // Limit to 4 suggestions
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
            {!isConnected && (
              <Badge variant="destructive" className="text-xs ml-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Offline
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        {/* Chat Messages */}
<<<<<<< HEAD
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden relative">
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 chatbot-scrollbar">
            <div className="space-y-4 pr-2 min-h-full">
=======
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4" viewportRef={viewportRef}>
            <div className="space-y-4">
>>>>>>> cfd1ebe2a973c94df3d5a452d6505f2168c6e4e0
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

          {/* Scroll to Bottom Button */}
          {showScrollButton && (
            <Button
              onClick={scrollToBottom}
              size="icon"
              className="absolute bottom-20 right-4 h-8 w-8 rounded-full shadow-lg bg-primary hover:bg-primary-hover z-10"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}

          {/* Document Actions */}
          {availableDocuments.length > 0 && (
            <div className="p-3 border-t bg-muted/30">
              <div className="text-xs text-muted-foreground mb-2 font-medium">Quick Actions</div>
              <div className="flex flex-wrap gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearchDocuments('urgent')}
                  className="text-xs h-7"
                >
                  <FileSearch className="w-3 h-3 mr-1" />
                  Urgent Docs
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearchDocuments('safety')}
                  className="text-xs h-7"
                >
                  <FileSearch className="w-3 h-3 mr-1" />
                  Safety
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearchDocuments('financial')}
                  className="text-xs h-7"
                >
                  <FileSearch className="w-3 h-3 mr-1" />
                  Financial
                </Button>
                {availableDocuments.slice(0, 2).map((doc) => (
                  <Button
                    key={doc.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAnalyzeDocument(doc.id, doc.title)}
                    className="text-xs h-7 max-w-[120px] truncate"
                    title={`Analyze: ${doc.title}`}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    {doc.title.length > 15 ? doc.title.substring(0, 15) + '...' : doc.title}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                id="ai-chat-input"
                name="chat-input"
                autoComplete="off"
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