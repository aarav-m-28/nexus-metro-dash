import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface SignatureRequest {
  id: string;
  document_id: string;
  requester_id: string;
  faculty_advisor_id: string;
  hod_id: string;
  status: string;
  documents: { title: string } | null;
  requester: { display_name: string } | null;
}

export function SignatureRequests() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [requests, setRequests] = useState<SignatureRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRequests() {
      if (!user || !profile) return;

      try {
        const { data, error } = await supabase
          .from('signature_requests')
          .select(`
            id,
            document_id,
            requester_id,
            faculty_advisor_id,
            hod_id,
            status,
            documents (title),
            requester:profiles!requester_id (display_name)
          `)
          .or(`faculty_advisor_id.eq.${user.id},hod_id.eq.${user.id}`);

        if (error) throw error;

        setRequests(data as SignatureRequest[]);
      } catch (error) {
        console.error('Error fetching signature requests:', error);
        toast({ title: 'Error', description: 'Failed to fetch signature requests.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }

    fetchRequests();
  }, [user, profile, toast]);

  const handleApprove = async (requestId: string, currentStatus: string) => {
    if (!profile) return;

    const nextStatus = profile.role === 'faculty_advisor' ? 'pending_hod' : 'approved';
    
    try {
      const { error } = await supabase
        .from('signature_requests')
        .update({ status: nextStatus, faculty_advisor_approved_at: profile.role === 'faculty_advisor' ? new Date() : undefined, hod_approved_at: profile.role === 'hod' ? new Date() : undefined })
        .eq('id', requestId);

      if (error) throw error;

      setRequests(requests.map(r => r.id === requestId ? { ...r, status: nextStatus } : r));
      toast({ title: 'Success', description: 'Request approved.' });
    } catch (error) {
      console.error('Error approving request:', error);
      toast({ title: 'Error', description: 'Failed to approve request.', variant: 'destructive' });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('signature_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      setRequests(requests.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r));
      toast({ title: 'Success', description: 'Request rejected.' });
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({ title: 'Error', description: 'Failed to reject request.', variant: 'destructive' });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Signature Requests</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document</TableHead>
            <TableHead>Requester</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map(request => (
            <TableRow key={request.id}>
              <TableCell>{request.documents?.title || 'Untitled'}</TableCell>
              <TableCell>{request.requester?.display_name || 'Unnamed'}</TableCell>
              <TableCell><Badge>{request.status}</Badge></TableCell>
              <TableCell>
                {((profile?.role === 'faculty_advisor' && request.status === 'pending_faculty_advisor') || (profile?.role === 'hod' && request.status === 'pending_hod')) && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleApprove(request.id, request.status)}>Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleReject(request.id)}>Reject</Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
