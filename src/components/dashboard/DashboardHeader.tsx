import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Upload, Bell } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function DashboardHeader() {
  return (
    <div className="bg-card/80 backdrop-blur-sm border-b border-border/50 p-6 animate-fade-in-0 sticky top-0 z-10">
      {/* Page Title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, Finance Officer
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="relative group hover:scale-105 transition-all duration-200">
            <Bell className="w-5 h-5 transition-colors" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-urgent rounded-full animate-pulse"></span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-urgent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md" />
          </Button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-2xl group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
          <Input
            placeholder="Search documents by keyword, title, or content..."
            className="pl-10 h-11 bg-background/50 backdrop-blur-sm border-input focus:border-primary focus:ring-primary/20 focus:bg-background transition-all duration-300 hover:shadow-md focus:shadow-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 rounded-md pointer-events-none" />
        </div>
        
        <Button className="gap-2 h-11 px-6 bg-gradient-primary hover:shadow-lg text-primary-foreground font-medium transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 group relative overflow-hidden">
          <Upload className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
          Upload Document
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
        </Button>
      </div>
    </div>
  );
}