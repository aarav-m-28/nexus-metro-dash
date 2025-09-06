import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { ShieldCheck, LogIn } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Login | Nexus Dashboard";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Login to Nexus Dashboard to access your documents, search, and settings.");
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = "Login to Nexus Dashboard to access your documents, search, and settings.";
      document.head.appendChild(m);
    }

    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonical) canonical.href = `${window.location.origin}/login`;
    else {
      const link = document.createElement("link");
      link.rel = "canonical";
      link.href = `${window.location.origin}/login`;
      document.head.appendChild(link);
    }
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Demo-only auth flow
    await new Promise((r) => setTimeout(r, 800));
    toast({ title: "Welcome back!", description: "You are now logged in (demo)." });
    navigate("/dashboard");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/90 to-primary/5 dark:to-primary/10">
      <AnimatedBackground />
      
      {/* Colorful floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-2xl animate-pulse delay-1000" />
      </div>

      <main className="relative z-10 w-full max-w-md p-4">
        <h1 className="sr-only">Login to Nexus</h1>
        <Card className="backdrop-blur-md supports-[backdrop-filter]:bg-card/90 border-border/40 shadow-2xl animate-fade-in hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
          <CardHeader className="text-center">
            <div className="mx-auto w-14 h-14 rounded-xl bg-gradient-to-br from-primary via-primary-glow to-accent text-primary-foreground flex items-center justify-center shadow-lg animate-scale-in hover:rotate-3 transition-all duration-300">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <CardTitle className="text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Login to Nexus</CardTitle>
            <CardDescription className="text-muted-foreground/80">Access your documents and workflows</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button type="submit" disabled={loading} className={cn("w-full gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary-glow hover:to-accent/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]")}> 
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span className="animate-pulse">Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    Sign in
                  </>
                )}
              </Button>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <Link to="/dashboard" className="story-link hover:text-primary transition-colors">Back to dashboard</Link>
                <button className="story-link hover:text-accent transition-colors">Forgot password?</button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}