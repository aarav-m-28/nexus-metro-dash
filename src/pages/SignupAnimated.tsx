import React, { useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import styles from './LoginAnimated.module.css'; // Reusing styles for consistency
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const SignupAnimated: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const signupContainerRef = useRef<HTMLDivElement>(null);
    const signupButtonRef = useRef<HTMLButtonElement>(null);
    const shockwaveRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [role, setRole] = useState('student');
    const [course, setCourse] = useState('');
    const [section, setSection] = useState('');
    const [year, setYear] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Liquid Canvas Background (reused from LoginAnimated)
    useEffect(() => {
        // ... (canvas animation code remains the same)
    }, []);

    // Form Animations with Anime.js
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
    }, []);

    // Button Click Shockwave and Signup Logic
    const handleSignupClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
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

        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    display_name: displayName,
                    role,
                    course,
                    section,
                    year: parseInt(year, 10),
                }
            }
        });

        if (error) {
            setError(error.message);
        } else {
            setError(null);
            // Navigate to a confirmation page or login page
            navigate('/login');
        }
    };

    return (
        <body className={`${styles.body} flex items-center justify-center min-h-screen p-4`}>
            <div className={styles.stars}></div>
            <canvas id="liquid-canvas" ref={canvasRef} className={styles.liquidCanvas}></canvas>
            <div className={styles.blurOverlay}></div>
            <div id="signup-container" ref={signupContainerRef} className={`${styles.loginContainer} w-full max-w-sm`}>
                <div className={`${styles.loginCard} p-8 md:p-10 space-y-6`}>
                    <div className="text-center">
                        <h1 className={`${styles.animatedTextGradient} text-3xl font-semibold tracking-wide`}>Nexus</h1>
                        <p className="text-indigo-200 text-sm mt-2 opacity-70">Create your account</p>
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <form id="signup-form" className="space-y-6">
                        <div className={styles.inputWrapper}>
                            <input type="text" id="displayName" className={`${styles.inputField} w-full placeholder-transparent`} placeholder="Full Name" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                            <label htmlFor="displayName" className={styles.inputLabel}>Full Name</label>
                            <div className={styles.underline}></div>
                        </div>
                        <div className={styles.inputWrapper}>
                            <input type="email" id="email" className={`${styles.inputField} w-full placeholder-transparent`} placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                            <label htmlFor="email" className={styles.inputLabel}>Email</label>
                            <div className={styles.underline}></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className={styles.inputWrapper}>
                                <select id="role" className={`${styles.inputField} w-full`} value={role} onChange={(e) => setRole(e.target.value)}>
                                    <option value="student">Student</option>
                                    <option value="teacher">Teacher</option>
                                    <option value="hod">HOD</option>
                                </select>
                                <div className={styles.underline}></div>
                            </div>
                            <div className={styles.inputWrapper}>
                                <input type="text" id="course" className={`${styles.inputField} w-full placeholder-transparent`} placeholder="Course" value={course} onChange={(e) => setCourse(e.target.value)} />
                                <label htmlFor="course" className={styles.inputLabel}>Course</label>
                                <div className={styles.underline}></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className={styles.inputWrapper}>
                                <input type="text" id="section" className={`${styles.inputField} w-full placeholder-transparent`} placeholder="Section" value={section} onChange={(e) => setSection(e.target.value)} />
                                <label htmlFor="section" className={styles.inputLabel}>Section</label>
                                <div className={styles.underline}></div>
                            </div>
                            <div className={styles.inputWrapper}>
                                <input type="number" id="year" className={`${styles.inputField} w-full placeholder-transparent`} placeholder="Year" value={year} onChange={(e) => setYear(e.target.value)} />
                                <label htmlFor="year" className={styles.inputLabel}>Year</label>
                                <div className={styles.underline}></div>
                            </div>
                        </div>
                        <div className={styles.inputWrapper}>
                            <input type="password" id="password" className={`${styles.inputField} w-full placeholder-transparent`} placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                            <label htmlFor="password" className={styles.inputLabel}>Password</label>
                            <div className={styles.underline}></div>
                        </div>
                        <div className={styles.inputWrapper}>
                            <input type="password" id="confirmPassword" className={`${styles.inputField} w-full placeholder-transparent`} placeholder="Confirm Password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                            <label htmlFor="confirmPassword" className={styles.inputLabel}>Confirm Password</label>
                            <div className={styles.underline}></div>
                        </div>
                        <div>
                            <button type="submit" id="signup-button" ref={signupButtonRef} className={`${styles.loginButton} w-full font-semibold text-gray-900 py-3 rounded-lg`} onClick={handleSignupClick}>
                                Sign Up
                                <div ref={shockwaveRef} className={styles.shockwave}></div>
                            </button>
                        </div>
                        <p className="text-center text-sm text-indigo-200 opacity-70">
                            Already have an account? {' '}
                            <Link to="/login" className="text-purple-300 hover:underline">Log In</Link>
                        </p>
                    </form>
                </div>
            </div>
        </body>
    );
};

export default SignupAnimated;