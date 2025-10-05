import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, FileUp, Check, X, Eye, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Sidebar, SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { useProfile } from "@/hooks/useProfile";
import { Input } from "@/components/ui/input";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const StudentPermissionForm = () => {
  const [requestType, setRequestType] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [reason, setReason] = useState<string>("");
  const [proof, setProof] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile } = useProfile();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !startDate || !endDate || !requestType || !reason) {
      toast({ title: "Error", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      let proof_url = null;
      if (proof) {
        const fileExt = proof.name.split('.').pop();
        const fileName = `${profile.user_id}-${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('proofs')
          .upload(fileName, proof);

        if (uploadError) throw uploadError;
        proof_url = uploadData?.path;
      }

      const { data: request, error } = await supabase.from('permission_requests').insert({
        user_id: profile.user_id,
        request_type,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        reason,
        proof_url,
      }).select().single();

      if (error) throw error;

      // Create notifications for faculty advisor and HOD
      const { data: facultyAssignments, error: facultyError } = await supabase
        .from('faculty_assignments')
        .select('faculty_id')
        .eq('course', profile.course)
        .eq('year', profile.year)
        .eq('section', profile.section);

      if (facultyError) console.error("Error fetching faculty advisor:", facultyError);

      const { data: hod, error: hodError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('department', profile.department)
        .eq('role', 'hod')
        .single();

      if (hodError) console.error("Error fetching HOD:", hodError);

      const recipients = [
        ...(facultyAssignments?.map(fa => fa.faculty_id) || []),
        hod?.user_id
      ].filter(Boolean);

      const notificationPromises = recipients.map(recipientId => 
        supabase.from('notifications').insert({
          user_id: recipientId,
          type: 'approval',
          title: 'New Permission Request',
          message: `${profile.display_name} has submitted a new permission request.`,
          priority: 'medium',
          action_required: true,
        })
      );

      await Promise.all(notificationPromises);

      toast({ title: "Success", description: "Permission request submitted successfully." });
      // Reset form
      setRequestType("");
      setStartDate(undefined);
      setEndDate(undefined);
      setReason("");
      setProof(null);
    } catch (error: any) {
      console.error("Error submitting permission request:", error);
      toast({ title: "Error", description: error.message || "Failed to submit request.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto bg-background/80 backdrop-blur-sm border-2 border-purple-500/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white">Submit a Permission Request</CardTitle>
        <CardDescription className="text-gray-300">Request for leave or on-duty permissions. Fill out the form below.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6" id="permission-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="request-type" className="text-white">Request Type</Label>
              <Select onValueChange={setRequestType} value={requestType}>
                <SelectTrigger id="request-type" className="bg-gray-900/50 border-gray-700 text-white">
                  <SelectValue placeholder="Select a request type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 text-white">
                  <SelectItem value="leave">Leave</SelectItem>
                  <SelectItem value="on-duty">On-Duty</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="proof" className="text-white">Proof (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input id="proof" type="file" onChange={(e) => setProof(e.target.files?.[0] || null)} className="bg-gray-900/50 border-gray-700 text-white file:text-white" />
                <Button variant="ghost" size="icon" onClick={() => setProof(null)} className={!proof ? 'hidden' : ''}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-white">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="start-date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal bg-gray-900/50 border-gray-700 text-white hover:text-white",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-700">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-white">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="end-date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal bg-gray-900/50 border-gray-700 text-white hover:text-white",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-700">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="reason" className="text-white">Reason</Label>
              <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Briefly explain the reason for your request..." className="bg-gray-900/50 border-gray-700 text-white" />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button type="submit" form="permission-form" className="bg-primary hover:bg-primary/90 text-white font-bold" disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : 'Submit Request'}
        </Button>
      </CardFooter>
    </Card>
  );
};

const PermissionRequestList = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('permission_requests')
        .select(`
          *,
          profiles:user_id ( display_name, email, role, course, section, year )
        `);
      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to fetch permission requests.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateRequest = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data: request, error } = await supabase
        .from('permission_requests')
        .update({ status, approved_by: user.user?.id })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Create a notification for the student
      await supabase.from('notifications').insert({
        user_id: request.user_id,
        type: 'approval',
        title: `Permission Request ${status}`,
        message: `Your permission request for ${request.request_type} has been ${status}.`,
        priority: 'medium',
      });

      toast({ title: "Success", description: `Request ${status}.` });
      fetchRequests(); // Refetch requests
    } catch (error: any) {
      toast({ title: "Error", description: `Failed to ${status} request.`, variant: "destructive" });
    }
  };

  const renderRequests = (status: string) => {
    const filteredRequests = requests.filter(req => req.status === status);
    if (loading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    if (filteredRequests.length === 0) return <div className="text-center text-gray-400 p-8">No {status} requests.</div>;

    return (
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="border-gray-700">
              <TableHead className="text-white">Student</TableHead>
              <TableHead className="text-white">Type</TableHead>
              <TableHead className="text-white">Dates</TableHead>
              <TableHead className="text-white">Reason</TableHead>
              <TableHead className="text-right text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map(req => (
              <TableRow key={req.id} className="border-gray-800 hover:bg-gray-900/50">
                <TableCell className="font-medium text-white">{req.profiles.display_name}</TableCell>
                <TableCell className="text-gray-300">{req.request_type}</TableCell>
                <TableCell className="text-gray-300">{format(new Date(req.start_date), 'MMM d, yyyy')} - {format(new Date(req.end_date), 'MMM d, yyyy')}</TableCell>
                <TableCell className="text-gray-300 truncate max-w-xs">{req.reason}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="hover:bg-gray-700"><Eye className="h-4 w-4 text-primary" /></Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 text-white border-gray-700">
                      <DialogHeader>
                        <DialogTitle>Request Details</DialogTitle>
                        <DialogDescription>From: {req.profiles.display_name} ({req.profiles.email})</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <p><strong>Reason:</strong> {req.reason}</p>
                        {req.proof_url && 
                          <a href={supabase.storage.from('proofs').getPublicUrl(req.proof_url).data.publicUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                            <FileUp className="h-4 w-4" /> View Proof
                          </a>
                        }
                      </div>
                    </DialogContent>
                  </Dialog>
                  {status === 'pending' && (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => handleUpdateRequest(req.id, 'approved')} className="hover:bg-green-500/10"><Check className="h-4 w-4 text-green-500" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleUpdateRequest(req.id, 'rejected')} className="hover:bg-red-500/10"><X className="h-4 w-4 text-red-500" /></Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <Card className="bg-background/80 backdrop-blur-sm border-2 border-purple-500/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white">Review Permission Requests</CardTitle>
        <CardDescription className="text-gray-300">Review and approve permission requests from students.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900/50 text-gray-300">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-4">{renderRequests('pending')}</TabsContent>
          <TabsContent value="approved" className="mt-4">{renderRequests('approved')}</TabsContent>
          <TabsContent value="rejected" className="mt-4">{renderRequests('rejected')}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const PermissionsPage: React.FC = () => {
  const { profile } = useProfile();

  const renderContent = () => {
    if (!profile) return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    const role = profile.role?.toLowerCase();

    if (role === 'student') {
      return <StudentPermissionForm />;
    } else if (role === 'faculty_advisor' || role === 'hod') {
      return <PermissionRequestList />;
    } else {
      return (
        <div className="text-center text-lg text-muted-foreground bg-background/80 backdrop-blur-sm p-8 rounded-lg">
          You do not have permission to view this page.
        </div>
      );
    }
  };

  return (
    <SidebarProvider>
      <AnimatedBackground />
      <Sidebar collapsible="icon">
        <DashboardSidebar />
      </Sidebar>
      <SidebarInset>
        <main className="p-4 sm:p-6 md:p-8 bg-transparent h-full overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Permission Management
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-300 max-w-3xl">
                {profile?.role?.toLowerCase() === 'student' 
                  ? "Request leave or on-duty permissions and track their status."
                  : "Review, approve, or reject permission requests from students."
                }
              </p>
            </header>
            {renderContent()}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default PermissionsPage;