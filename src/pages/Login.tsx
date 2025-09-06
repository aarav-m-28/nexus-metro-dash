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
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/10 dark:via-background/90 dark:to-primary/10">
      <AnimatedBackground />
      
      {/* Vibrant floating elements for light mode */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-400/40 to-violet-500/30 dark:from-primary/20 dark:to-accent/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-gradient-to-br from-emerald-400/35 to-cyan-500/30 dark:from-accent/20 dark:to-primary/20 rounded-full blur-xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-br from-rose-400/25 to-orange-500/20 dark:from-primary/10 dark:to-accent/10 rounded-full blur-2xl animate-pulse delay-1000" />
        
        {/* Additional animated elements */}
        <div className="absolute top-16 right-1/3 w-20 h-20 bg-gradient-to-br from-purple-400/30 to-pink-500/25 rounded-full blur-lg animate-[pulse_3s_ease-in-out_infinite]" />
        <div className="absolute bottom-1/4 left-1/6 w-28 h-28 bg-gradient-to-br from-indigo-400/25 to-blue-500/20 rounded-full blur-xl animate-[pulse_4s_ease-in-out_infinite]" />
        
        {/* Subtle moving particles */}
        <div className="absolute top-1/3 right-1/5 w-4 h-4 bg-gradient-to-br from-yellow-400/60 to-amber-500/40 rounded-full animate-[bounce_2s_infinite] blur-sm" />
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-gradient-to-br from-teal-400/50 to-green-500/40 rounded-full animate-[bounce_3s_infinite] delay-500 blur-sm" />
      </div>

      <main className="relative z-10 w-full max-w-md p-4">
        <h1 className="sr-only">Login to Nexus</h1>
        <Card className="backdrop-blur-md supports-[backdrop-filter]:bg-card/90 border-border/40 shadow-2xl animate-fade-in hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
          <CardHeader className="text-center">
            <div className="mx-auto w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-blue-600 dark:from-primary dark:to-accent text-primary-foreground flex items-center justify-center shadow-lg animate-scale-in hover:rotate-3 transition-all duration-300">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <CardTitle className="text-gradient bg-gradient-to-r from-primary to-blue-600 dark:from-primary dark:to-accent bg-clip-text text-transparent">Login to Nexus</CardTitle>
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

              <Button type="submit" disabled={loading} className={cn("w-full gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary-hover hover:to-blue-700 dark:from-primary dark:to-accent dark:hover:from-primary dark:hover:to-accent/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]")}> 
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