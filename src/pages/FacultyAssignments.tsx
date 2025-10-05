import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Sidebar, SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { Loader2, Plus, Trash2 } from 'lucide-react';

const FacultyAssignmentsPage: React.FC = () => {
  const { profile } = useProfile();
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFacultyAndAssignments = async () => {
    setLoading(true);
    try {
      const { data: faculty, error: facultyError } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['faculty_advisor', 'hod']);
      if (facultyError) throw facultyError;
      setFacultyList(faculty || []);

      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('faculty_assignments')
        .select('*');
      if (assignmentsError) throw assignmentsError;
      setAssignments(assignmentsData || []);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to fetch data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.role === 'hod') {
      fetchFacultyAndAssignments();
    }
  }, [profile]);

  const handleAddAssignment = async (facultyId: string, course: string, year: string, section: string) => {
    try {
      const { error } = await supabase.from('faculty_assignments').insert({
        faculty_id: facultyId,
        course,
        year: parseInt(year),
        section,
      });
      if (error) throw error;
      toast({ title: "Success", description: "Assignment added successfully." });
      fetchFacultyAndAssignments();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to add assignment.", variant: "destructive" });
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase.from('faculty_assignments').delete().eq('id', assignmentId);
      if (error) throw error;
      toast({ title: "Success", description: "Assignment deleted successfully." });
      fetchFacultyAndAssignments();
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to delete assignment.", variant: "destructive" });
    }
  };

  if (profile?.role !== 'hod') {
    return (
      <SidebarProvider>
        <AnimatedBackground />
        <Sidebar collapsible="icon">
          <DashboardSidebar />
        </Sidebar>
        <SidebarInset>
          <main className="p-6 bg-transparent h-full overflow-y-auto">
            <div className="text-center text-lg text-muted-foreground bg-background/80 backdrop-blur-sm p-8 rounded-lg">
              You do not have permission to view this page.
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AnimatedBackground />
      <Sidebar collapsible="icon">
        <DashboardSidebar />
      </Sidebar>
      <SidebarInset>
        <main className="p-6 bg-transparent h-full overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight text-white mb-8">Faculty Assignments</h1>
            {loading ? (
              <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <div className="grid gap-8">
                {facultyList.map(faculty => (
                  <Card key={faculty.id} className="bg-background/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>{faculty.display_name}</CardTitle>
                      <CardDescription>{faculty.email}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <h3 className="font-semibold mb-2">Assignments:</h3>
                      <div className="space-y-2">
                        {assignments.filter(a => a.faculty_id === faculty.user_id).map(assignment => (
                          <div key={assignment.id} className="flex items-center justify-between bg-gray-900/50 p-2 rounded-md">
                            <span>{assignment.course} - Year {assignment.year} - Section {assignment.section}</span>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteAssignment(assignment.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                          </div>
                        ))}
                      </div>
                      <AddAssignmentForm facultyId={faculty.user_id} onAddAssignment={handleAddAssignment} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

const AddAssignmentForm = ({ facultyId, onAddAssignment }) => {
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');
  const [section, setSection] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!course || !year || !section) return;
    onAddAssignment(facultyId, course, year, section);
    setCourse('');
    setYear('');
    setSection('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-4">
      <Input placeholder="Course" value={course} onChange={e => setCourse(e.target.value)} className="bg-gray-900/50" />
      <Input placeholder="Year" type="number" value={year} onChange={e => setYear(e.target.value)} className="bg-gray-900/50" />
      <Input placeholder="Section" value={section} onChange={e => setSection(e.target.value)} className="bg-gray-900/50" />
      <Button type="submit" size="icon"><Plus className="h-4 w-4" /></Button>
    </form>
  );
};

export default FacultyAssignmentsPage;