import { useState, useEffect } from "react";
import { Drawer, DrawerTrigger, DrawerContent } from "@/components/ui/drawer";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { 
  User, 
  Bell, 
  Shield, 
  Database, 
  Save,
  RefreshCw,
  Key
} from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile, loading, updateProfile, changePassword } = useProfile();
  
  const [profileForm, setProfileForm] = useState({
    display_name: '',
    department: '',
    job_title: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });

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

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setProfileForm({
        display_name: profile.display_name || '',
        department: profile.department || '',
        job_title: profile.job_title || '',
      });
    }
  }, [profile]);

  const handleProfileSave = async () => {
    const success = await updateProfile(profileForm);
    if (success) {
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
      });
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    const success = await changePassword(passwordForm.newPassword);
    if (success) {
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    }
  };

  const handleSettingsSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar: sliding on mobile, fixed on desktop */}
      <div className="block md:hidden">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" className="m-4">Open Sidebar</Button>
          </DrawerTrigger>
          <DrawerContent className="max-w-xs w-full">
            <DashboardSidebar />
          </DrawerContent>
        </Drawer>
      </div>
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>
      <main className="flex-1 overflow-y-auto">
        {/* Settings Header */}
        <div className="bg-card border-b border-border/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Settings</h1>
              <p className="text-sm text-muted-foreground">
                Manage your account preferences and system configuration
              </p>
            </div>
            
            <Button onClick={handleSettingsSave} className="gap-2">
              <Save className="w-4 h-4" />
              Save Preferences
            </Button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="p-6 w-full max-w-4xl mx-auto">
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
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="display_name">Full Name</Label>
                    <Input 
                      id="display_name" 
                      value={profileForm.display_name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, display_name: e.target.value }))}
                      placeholder="Enter your full name"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      value={user?.email || ''} 
                      disabled 
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input 
                      id="department" 
                      value={profileForm.department}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="Enter your department"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job_title">Job Title</Label>
                    <Input 
                      id="job_title" 
                      value={profileForm.job_title}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, job_title: e.target.value }))}
                      placeholder="Enter your job title"
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleProfileSave} disabled={loading} className="gap-2">
                    <Save className="w-4 h-4" />
                    Save Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Password Settings */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <Key className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input 
                      id="new-password" 
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handlePasswordChange} 
                    disabled={!passwordForm.newPassword || !passwordForm.confirmPassword}
                    className="gap-2"
                  >
                    <Key className="w-4 h-4" />
                    Change Password
                  </Button>
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
      </main>
    </div>
  );
}