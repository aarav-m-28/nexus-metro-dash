import React, { useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import styles from './LoginAnimated.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Signup: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const signupContainerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { signUp } = useAuth();

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [department, setDepartment] = useState('');
    const [subjects, setSubjects] = useState('');
    const [classes, setClasses] = useState('');

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

        handleResize();
        animate();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseOut);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    useEffect(() => {
        if (signupContainerRef.current) {
            anime({
                targets: signupContainerRef.current,
                opacity: [0, 1],
                translateY: [20, 0],
                scale: [0.95, 1],
                duration: 800,
                easing: 'easeOutCubic'
            });
        }
    }, [step]);

    const handleRoleSelection = (selectedRole: string) => {
        setRole(selectedRole);
        setStep(2);
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        const metadata: { role: string; department?: string; subjects?: string; classes?: string } = { role };
        if (role === 'hod') {
            metadata.department = department;
        } else if (role === 'teacher') {
            metadata.subjects = subjects;
            metadata.classes = classes;
        }

        const { error } = await signUp(email, password, metadata);
        if (error) {
            console.error('Signup error:', error);
            alert(error.message || 'Signup failed');
        } else {
            navigate('/');
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="text-center space-y-4">
                        <h2 className={`${styles.animatedTextGradient} text-2xl font-semibold`}>Choose Your Role</h2>
                        <div className="flex flex-col space-y-4">
                            <button onClick={() => handleRoleSelection('student')} className={`${styles.loginButton} w-full font-semibold text-gray-900 py-3 rounded-lg`}>Student</button>
                            <button onClick={() => handleRoleSelection('teacher')} className={`${styles.loginButton} w-full font-semibold text-gray-900 py-3 rounded-lg`}>Teacher</button>
                            <button onClick={() => handleRoleSelection('hod')} className={`${styles.loginButton} w-full font-semibold text-gray-900 py-3 rounded-lg`}>HOD</button>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <form onSubmit={handleSignup} className="space-y-6">
                        <div className={styles.inputWrapper}>
                            <input type="email" id="email" className={`${styles.inputField} w-full placeholder-transparent`} placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                            <label htmlFor="email" className={styles.inputLabel}>Email</label>
                            <div className={styles.underline}></div>
                        </div>
                        <div className={styles.inputWrapper}>
                            <input type="password" id="password" className={`${styles.inputField} w-full placeholder-transparent`} placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                            <label htmlFor="password" className={styles.inputLabel}>Password</label>
                            <div className={styles.underline}></div>
                        </div>

                        {role === 'hod' && (
                            <div className={styles.inputWrapper}>
                                <input type="text" id="department" className={`${styles.inputField} w-full placeholder-transparent`} placeholder="Department" required value={department} onChange={(e) => setDepartment(e.target.value)} />
                                <label htmlFor="department" className={styles.inputLabel}>Department</label>
                                <div className={styles.underline}></div>
                            </div>
                        )}

                        {role === 'teacher' && (
                            <>
                                <div className={styles.inputWrapper}>
                                    <input type="text" id="subjects" className={`${styles.inputField} w-full placeholder-transparent`} placeholder="Subjects (comma-separated)" required value={subjects} onChange={(e) => setSubjects(e.target.value)} />
                                    <label htmlFor="subjects" className={styles.inputLabel}>Subjects</label>
                                    <div className={styles.underline}></div>
                                </div>
                                <div className={styles.inputWrapper}>
                                    <input type="text" id="classes" className={`${styles.inputField} w-full placeholder-transparent`} placeholder="Classes (comma-separated)" required value={classes} onChange={(e) => setClasses(e.target.value)} />
                                    <label htmlFor="classes" className={styles.inputLabel}>Classes</label>
                                    <div className={styles.underline}></div>
                                </div>
                            </>
                        )}

                        <div>
                            <button type="submit" className={`${styles.loginButton} w-full font-semibold text-gray-900 py-3 rounded-lg`}>Sign Up</button>
                        </div>
                    </form>
                );
        }
    };

    return (
        <body className={`${styles.body} flex items-center justify-center min-h-screen p-4`}>
            <div className={styles.stars}></div>
            <canvas id="liquid-canvas" ref={canvasRef} className={styles.liquidCanvas}></canvas>
            <div className={styles.blurOverlay}></div>
            <div id="signup-container" ref={signupContainerRef} className={`${styles.loginContainer} w-full max-w-sm`}>
                <div className={`${styles.loginCard} p-8 md:p-10 space-y-8`}>
                    <div className="text-center">
                        <h1 className={`${styles.animatedTextGradient} text-3xl font-semibold tracking-wide`}>Create Account</h1>
                        <p className="text-indigo-200 text-sm mt-2 opacity-70">Join the Nexus</p>
                    </div>
                    {renderStep()}
                    <p className="text-center text-sm text-indigo-200 opacity-70">
                        Already have an account?{' '}
                        <Link to="/login" className="text-purple-300 hover:underline">Login</Link>
                    </p>
                </div>
            </div>
        </body>
    );
};

export default Signup;
