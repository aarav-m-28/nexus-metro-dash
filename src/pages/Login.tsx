import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { ShieldCheck, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

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

  useEffect(() => {
    if (user && !authLoading) {
      navigate("/dashboard");
    }
  }, [user, authLoading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);
        
      if (error) {
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: isSignUp ? "Account created!" : "Welcome back!",
          description: isSignUp 
            ? "Please check your email to confirm your account." 
            : "You are now logged in."
        });
        if (!isSignUp) {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    toast({
      title: "Feature not available",
      description: "Login with Google is not yet implemented.",
      variant: "destructive"
    });
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="hidden bg-muted lg:flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="text-center px-12">
            <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="animate-pulse">
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: 'rgb(99, 102, 241)', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: 'rgb(168, 85, 247)', stopOpacity: 1}} />
                </linearGradient>
                <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: 'rgb(59, 130, 246)', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: 'rgb(34, 211, 238)', stopOpacity: 1}} />
                </linearGradient>
              </defs>
              <g transform="translate(100, 100)">
                <circle cx="0" cy="0" r="80" fill="url(#grad1)" />
                <circle cx="-30" cy="-30" r="60" fill="url(#grad2)" style={{mixBlendMode: 'multiply'}} className="animate-bounce" />
              </g>
            </svg>
            <h1 className="text-4xl font-bold text-foreground mt-8">Welcome to Nexus</h1>
            <p className="mt-4 text-muted-foreground">Your unified hub for seamless document management and collaboration.</p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">{isSignUp ? 'Sign Up' : 'Login'}</h1>
            <p className="text-balance text-muted-foreground">
              {isSignUp ? 'Enter your information to create an account' : 'Enter your email below to login to your account'}
            </p>
          </div>
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                {!isSignUp && <a href="#" className="ml-auto inline-block text-sm underline">Forgot your password?</a>}
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || authLoading}>
              {loading ? (isSignUp ? 'Creating account...' : 'Logging in...') : (isSignUp ? 'Sign Up' : 'Login')}
            </Button>
            <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
              Login with Google
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{" "}
            <button onClick={() => setIsSignUp(!isSignUp)} className="underline">
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}