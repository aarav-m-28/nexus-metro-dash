import React, { useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import styles from './LoginAnimated.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const LoginAnimated: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const loginContainerRef = useRef<HTMLDivElement>(null);
    const loginButtonRef = useRef<HTMLButtonElement>(null);
    const shockwaveRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { signIn } = useAuth();
    const { toast } = useToast();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    // Liquid Canvas Background
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const mouse = { x: 0, y: 0 };
        let particles: Particle[] = [];

        class Particle {
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            color: string;
            life: number;

            constructor() {
                this.x = mouse.x;
                this.y = mouse.y;
                this.size = Math.random() * 5 + 1;
                this.speedX = Math.random() * 3 - 1.5;
                this.speedY = Math.random() * 3 - 1.5;
                this.color = `hsl(${Math.random() * 50 + 250}, 100%, 70%)`;
                this.life = 1;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.size *= 0.97;
                this.life -= 0.02;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = this.life;
                ctx.fill();
            }
        };

        const handleParticles = () => {
            for (let i = 0; i < 5; i++) {
                if (mouse.x && mouse.y) particles.push(new Particle());
            }
            for (let i = particles.length - 1; i >= 0; i--) {
                particles[i].update();
                particles[i].draw();
                if (particles[i].life <= 0 || particles[i].size <= 0.2) {
                    particles.splice(i, 1);
                }
            }
        };

        const animate = () => {
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'rgba(13, 11, 31, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            handleParticles();
            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const handleMouseOut = () => {
            mouse.x = 0;
            mouse.y = 0;
        };

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', handleMouseOut);
        window.addEventListener('resize', handleResize);

        handleResize(); // Initial canvas size
        animate();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseOut);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // Form Animations with Anime.js
    useEffect(() => {
        if (loginContainerRef.current) {
            anime({
                targets: loginContainerRef.current,
                opacity: [0, 1],
                translateY: [20, 0],
                scale: [0.95, 1],
                duration: 800,
                easing: 'easeOutCubic'
            });
        }
    }, []);

    const handleLoginClick = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;
        setIsLoading(true);

        if (shockwaveRef.current) {
            anime({
                targets: shockwaveRef.current,
                scale: [0, 10],
                opacity: [0.5, 0],
                duration: 500,
                easing: 'easeOutQuad',
            });
        }
        const { error } = await signIn(email, password);
        if (error) {
            console.error('Login error:', error);
            toast({
                title: "Login Failed",
                description: error.message || "Please check your credentials and try again.",
                variant: "destructive",
            });
        } else {
            toast({
                title: "Login Successful",
                description: "Welcome back! Redirecting you to the dashboard...",
            });
            navigate('/');
        }
        setIsLoading(false);
    };

    const handleGoogleLogin = () => {
        toast({
          title: "Feature not available",
          description: "Login with Google is not yet implemented.",
          variant: "destructive"
        });
    };

    return (
        <div className={`${styles.body} w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen`}>
            <div className={styles.stars}></div>
            <canvas id="liquid-canvas" ref={canvasRef} className={styles.liquidCanvas}></canvas>
            <div className={styles.blurOverlay}></div>

            <div className="hidden bg-muted lg:flex items-center justify-center relative z-10">
                <div className="text-center px-12">
                    <h1 className={`${styles.animatedTextGradient} text-4xl font-bold`}>Welcome to Nexus</h1>
                    <p className="mt-4 text-indigo-200 opacity-70">Your unified hub for seamless document management and collaboration.</p>
                </div>
            </div>

            <div className="flex items-center justify-center py-12 relative z-10" ref={loginContainerRef}>
                <div className="mx-auto grid w-[350px] gap-6">
                    <div className="grid gap-2 text-center">
                        <h1 className="text-3xl font-bold text-white">{isSignUp ? 'Create Account' : 'Login'}</h1>
                        <p className="text-balance text-indigo-200 opacity-70">
                            {isSignUp ? 'Enter your details to create an account' : 'Enter your email below to login to your account'}
                        </p>
                    </div>
                    <form onSubmit={handleLoginClick} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-indigo-200 opacity-70">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`${styles.inputField} w-full placeholder-transparent`}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password" className="text-indigo-200 opacity-70">Password</Label>
                                {!isSignUp && <Link to="#" className="ml-auto inline-block text-sm text-purple-300 hover:underline">Forgot your password?</Link>}
                            </div>
                            <Input 
                                id="password" 
                                type="password" 
                                required 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`${styles.inputField} w-full placeholder-transparent`}
                                disabled={isLoading}
                            />
                        </div>
                        <Button type="submit" className={`${styles.loginButton} w-full`} disabled={isLoading} ref={loginButtonRef}>
                            {isLoading ? <Loader2 className="animate-spin"/> : (isSignUp ? 'Sign Up' : 'Login')}
                            <div ref={shockwaveRef} className={styles.shockwave}></div>
                        </Button>
                        <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
                            Login with Google
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm text-indigo-200 opacity-70">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{" "}
                        <button onClick={() => setIsSignUp(!isSignUp)} className="underline text-purple-300 hover:underline">
                            {isSignUp ? 'Sign in' : 'Sign up'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginAnimated;