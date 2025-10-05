import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check, X, FileText, Users, AlertTriangle, Clock, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: "document" | "system" | "approval" | "deadline";
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  priority: "low" | "medium" | "high";
  action_required?: boolean;
}

const notificationIcons = {
  document: FileText,
  system: AlertTriangle,
  approval: Users,
  deadline: Clock
};

const priorityColors = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning text-warning-foreground",
  high: "bg-urgent text-urgent-foreground"
};

interface NotificationPanelProps {
  children: React.ReactNode;
}

export function NotificationPanel({ children }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to fetch notifications.", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      if (error) throw error;
      fetchNotifications();
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to mark notification as read.", variant: "destructive" });
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
      if (error) throw error;
      fetchNotifications();
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to mark all notifications as read.", variant: "destructive" });
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw error;
      fetchNotifications();
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to delete notification.", variant: "destructive" });
    }
  };

  const clearAll = async () => {
    try {
      const { error } = await supabase.from('notifications').delete().neq('id', '0'); // Hack to delete all rows
      if (error) throw error;
      setNotifications([]);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to clear all notifications.", variant: "destructive" });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-96 p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="bg-urgent text-urgent-foreground ml-2">
                  {unreadCount}
                </Badge>
              )}
            </SheetTitle>
            {notifications.length > 0 && (
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="text-xs text-destructive hover:text-destructive"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(100vh-120px)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
              <Bell className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-2">All caught up!</h3>
              <p className="text-muted-foreground text-sm">You have no new notifications</p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {notifications.map((notification) => {
                const Icon = notificationIcons[notification.type];
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "group relative p-4 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer",
                      notification.is_read 
                        ? "bg-background border-border/50" 
                        : "bg-card border-primary/20 hover:border-primary/40"
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    {!notification.is_read && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse" />
                    )}
                    
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-lg flex-shrink-0",
                        priorityColors[notification.priority]
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className={cn(
                            "font-medium text-sm leading-tight",
                            notification.is_read ? "text-muted-foreground" : "text-foreground"
                          )}>
                            {notification.title}
                          </h4>
                          {notification.action_required && (
                            <Badge className="bg-warning text-warning-foreground text-xs">
                              Action needed
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.created_at).toLocaleString()}
                          </span>
                          
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
