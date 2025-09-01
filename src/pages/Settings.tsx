import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Bell, 
  Shield, 
  Database, 
  Palette, 
  Globe,
  Save,
  RefreshCw
} from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      urgent: true,
      weekly: true
    },
    ai: {
      enabled: true,
      suggestions: true,
      autoTag: false
    },
    privacy: {
      shareAnalytics: false,
      trackActivity: true
    }
  });

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      
      <div className="flex-1 ml-60">
        {/* Settings Header */}
        <div className="bg-card border-b border-border/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Settings</h1>
              <p className="text-sm text-muted-foreground">
                Manage your account preferences and system configuration
              </p>
            </div>
            
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="p-6 max-w-4xl">
          <div className="space-y-8">
            
            {/* Profile Settings */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <User className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details and role</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue="Finance Officer" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" defaultValue="finance@kmrl.co.in" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input id="department" defaultValue="Finance Department" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" defaultValue="Senior Finance Officer" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose how you want to be notified</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notif">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive updates via email</p>
                    </div>
                    <Switch 
                      id="email-notif" 
                      checked={settings.notifications.email}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, email: checked }
                        }))
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="urgent-notif">Urgent Document Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified immediately for urgent documents</p>
                    </div>
                    <Switch 
                      id="urgent-notif" 
                      checked={settings.notifications.urgent}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, urgent: checked }
                        }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="weekly-notif">Weekly Summary</Label>
                      <p className="text-sm text-muted-foreground">Receive weekly activity reports</p>
                    </div>
                    <Switch 
                      id="weekly-notif" 
                      checked={settings.notifications.weekly}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, weekly: checked }
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Assistant Settings */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <RefreshCw className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle className="flex items-center gap-2">
                    AI Assistant Features
                    <Badge variant="secondary" className="text-xs">BETA</Badge>
                  </CardTitle>
                  <CardDescription>Configure AI-powered document intelligence</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="ai-enabled">Enable AI Assistant</Label>
                      <p className="text-sm text-muted-foreground">Get AI-powered document insights and search</p>
                    </div>
                    <Switch 
                      id="ai-enabled" 
                      checked={settings.ai.enabled}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({
                          ...prev,
                          ai: { ...prev.ai, enabled: checked }
                        }))
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="ai-suggestions">Smart Suggestions</Label>
                      <p className="text-sm text-muted-foreground">Get relevant document recommendations</p>
                    </div>
                    <Switch 
                      id="ai-suggestions" 
                      checked={settings.ai.suggestions}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({
                          ...prev,
                          ai: { ...prev.ai, suggestions: checked }
                        }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="ai-autotag">Auto Priority Tagging</Label>
                      <p className="text-sm text-muted-foreground">Automatically assign priority levels to new documents</p>
                    </div>
                    <Switch 
                      id="ai-autotag" 
                      checked={settings.ai.autoTag}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({
                          ...prev,
                          ai: { ...prev.ai, autoTag: checked }
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security & Privacy */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle>Security & Privacy</CardTitle>
                  <CardDescription>Manage your data privacy and security preferences</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="analytics">Share Usage Analytics</Label>
                      <p className="text-sm text-muted-foreground">Help improve Nexus by sharing anonymous usage data</p>
                    </div>
                    <Switch 
                      id="analytics" 
                      checked={settings.privacy.shareAnalytics}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, shareAnalytics: checked }
                        }))
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="activity">Activity Tracking</Label>
                      <p className="text-sm text-muted-foreground">Track document access for audit purposes</p>
                    </div>
                    <Switch 
                      id="activity" 
                      checked={settings.privacy.trackActivity}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, trackActivity: checked }
                        }))
                      }
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="pt-4">
                  <Button variant="outline" className="w-full">
                    <Database className="w-4 h-4 mr-2" />
                    Export My Data
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}