import React, { useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import styles from './LoginAnimated.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const LoginAnimated: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const loginContainerRef = useRef<HTMLDivElement>(null);
    const loginButtonRef = useRef<HTMLButtonElement>(null);
    const shockwaveRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { signIn } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Liquid Canvas Background (Original Version)
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

    // Button Click Shockwave
    const handleLoginClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
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
            alert(error.message || 'Login failed');
        } else {
            navigate('/'); // Redirect to dashboard or home page on successful login
        }
    };

    return (
        <body className={`${styles.body} flex items-center justify-center min-h-screen p-4`}>
            <div className={styles.stars}></div>
            <canvas id="liquid-canvas" ref={canvasRef} className={styles.liquidCanvas}></canvas>
            <div className={styles.blurOverlay}></div>
            <div id="login-container" ref={loginContainerRef} className={`${styles.loginContainer} w-full max-w-sm`}>
                <div className={`${styles.loginCard} p-8 md:p-10 space-y-8`}>
                    <div className="text-center">
                        <h1 className={`${styles.animatedTextGradient} text-3xl font-semibold tracking-wide`}>Nexus</h1>
                        <p className="text-indigo-200 text-sm mt-2 opacity-70">Enter the portal</p>
                    </div>

                    <form id="login-form" className="space-y-10">
                        <div className={styles.inputWrapper}>
                            <input
                                type="email"
                                id="email"
                                className={`${styles.inputField} w-full placeholder-transparent`}
                                placeholder="Email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <label htmlFor="email" className={styles.inputLabel}>Email</label>
                            <div className={styles.underline}></div>
                        </div>
                        <div className={styles.inputWrapper}>
                            <input
                                type="password"
                                id="password"
                                className={`${styles.inputField} w-full placeholder-transparent`}
                                placeholder="Password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <label htmlFor="password" className={styles.inputLabel}>Password</label>
                            <div className={styles.underline}></div>
                        </div>
                        <div>
                            <button
                                type="submit"
                                id="login-button"
                                ref={loginButtonRef}
                                className={`${styles.loginButton} w-full font-semibold text-gray-900 py-3 rounded-lg`}
                                onClick={handleLoginClick}
                            >
                                Login
                                <div ref={shockwaveRef} className={styles.shockwave}></div>
                            </button>
                        </div>
                        <p className="text-center text-sm text-indigo-200 opacity-70">
                            Don't have an account? {' '}
                            <Link to="/signup" className="text-purple-300 hover:underline">Sign Up</Link>
                        </p>
                    </form>
                </div>
            </div>
        </body>
    );
};

export default LoginAnimated;