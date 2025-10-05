import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CompleteProfile: React.FC = () => {
    const { role } = useParams<{ role: string }>();
    const navigate = useNavigate();
    const { profile, updateProfile, loading } = useProfile();

    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (profile) {
            setFormData({
                course: profile.course || '',
                section: profile.section || '',
                year: profile.year || '',
                subjects: profile.subjects?.join(', ') || '',
                classes: profile.classes?.join(', ') || '',
                class_subjects: JSON.stringify(profile.class_subjects, null, 2) || '',
                department: profile.department || '',
            });
        }
    }, [profile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let updates = { ...formData };
        if (updates.subjects) {
            updates.subjects = updates.subjects.split(',').map(s => s.trim());
        }
        if (updates.classes) {
            updates.classes = updates.classes.split(',').map(s => s.trim());
        }
        if (updates.class_subjects) {
            try {
                updates.class_subjects = JSON.parse(updates.class_subjects);
            } catch (error) {
                console.error('Invalid JSON for class_subjects', error);
                // Handle error, maybe show a toast
                return;
            }
        }

        await updateProfile(updates);
        navigate('/');
    };

    const renderStudentForm = () => (
        <div className="space-y-4">
            <div>
                <Label htmlFor="course">Course</Label>
                <Input id="course" name="course" value={formData.course || ''} onChange={handleChange} />
            </div>
            <div>
                <Label htmlFor="section">Section</Label>
                <Input id="section" name="section" value={formData.section || ''} onChange={handleChange} />
            </div>
            <div>
                <Label htmlFor="year">Year</Label>
                <Input id="year" name="year" type="number" value={formData.year || ''} onChange={handleChange} />
            </div>
        </div>
    );

    const renderTeacherForm = () => (
        <div className="space-y-4">
            <div>
                <Label htmlFor="subjects">Subjects (comma-separated)</Label>
                <Input id="subjects" name="subjects" value={formData.subjects || ''} onChange={handleChange} />
            </div>
            <div>
                <Label htmlFor="classes">Classes (comma-separated)</Label>
                <Input id="classes" name="classes" value={formData.classes || ''} onChange={handleChange} />
            </div>
            <div>
                <Label htmlFor="class_subjects">Class Subjects (JSON format)</Label>
                <textarea id="class_subjects" name="class_subjects" value={formData.class_subjects || ''} onChange={handleChange} className="w-full p-2 border rounded" rows={5} />
            </div>
        </div>
    );

    const renderHODForm = () => (
        <div className="space-y-4">
            <div>
                <Label htmlFor="department">Department</Label>
                <Input id="department" name="department" value={formData.department || ''} onChange={handleChange} />
            </div>
        </div>
    );

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Complete Your Profile</CardTitle>
                    <CardDescription>Please fill in the details for your role as a {role}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {role === 'student' && renderStudentForm()}
                        {role === 'teacher' && renderTeacherForm()}
                        {role === 'hod' && renderHODForm()}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Saving...' : 'Save and Continue'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default CompleteProfile;