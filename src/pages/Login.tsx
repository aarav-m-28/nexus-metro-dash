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
    navigate("/");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/40">
      <AnimatedBackground />

      <main className="relative z-10 w-full max-w-md p-4">
        <h1 className="sr-only">Login to Nexus</h1>
        <Card className="backdrop-blur supports-[backdrop-filter]:bg-card/80 border-border/60 shadow-lg animate-fade-in">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-lg bg-gradient-primary text-primary-foreground flex items-center justify-center shadow">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <CardTitle>Login to Nexus</CardTitle>
            <CardDescription>Access your documents and workflows</CardDescription>
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

              <Button type="submit" disabled={loading} className={cn("w-full gap-2")}> 
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign in
                  </>
                )}
              </Button>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <Link to="/" className="story-link">Back to dashboard</Link>
                <span>Forgot password?</span>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}