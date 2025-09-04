import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NavLink, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  LayoutDashboard, 
  Search, 
  Settings, 
  LogOut,
  Building2
} from "lucide-react";

const sidebarItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    title: "Search",
    icon: Search,
    path: "/search",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
  }
];

export function DashboardSidebar() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    toast({
      title: "Logged out successfully",
      description: "You have been securely logged out of the system",
    });
    
    // Simulate logout process
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  return (
    <div className="fixed left-0 top-0 h-full w-60 bg-sidebar/80 backdrop-blur-sm border-r border-sidebar-border flex flex-col animate-slide-in-from-bottom-4 z-20">
      {/* Logo Section */}
      <div className="p-6 border-b border-sidebar-border group">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-md flex items-center justify-center group-hover:rotate-12 transition-all duration-300 hover:shadow-lg">
            <Building2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-lg text-sidebar-foreground group-hover:text-primary transition-colors duration-200">Nexus</h1>
            <p className="text-xs text-muted-foreground">KMRL Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-300 group relative overflow-hidden",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-md hover:scale-105",
              isActive
                ? "bg-gradient-primary text-primary-foreground shadow-lg scale-105"
                : "text-sidebar-foreground"
            )}
          >
            <item.icon className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
            {item.title}
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary">FO</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              Finance Officer
            </p>
            <p className="text-xs text-muted-foreground truncate">
              KMRL Finance Dept.
            </p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout}
          className="w-full justify-start gap-2 text-muted-foreground hover:text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}