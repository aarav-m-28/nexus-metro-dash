import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Upload, Bell } from "lucide-react";

export function DashboardHeader() {
  return (
    <div className="bg-card border-b border-border/50 p-6">
      {/* Page Title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, Finance Officer
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-urgent rounded-full"></span>
          </Button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search documents by keyword, title, or content..."
            className="pl-10 h-11 bg-background border-input focus:border-primary focus:ring-primary/20"
          />
        </div>
        
        <Button className="gap-2 h-11 px-6 bg-primary hover:bg-primary-hover text-primary-foreground font-medium">
          <Upload className="w-4 h-4" />
          Upload Document
        </Button>
      </div>
    </div>
  );
}