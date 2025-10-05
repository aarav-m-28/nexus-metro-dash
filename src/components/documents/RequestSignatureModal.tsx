import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface RequestSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
}

export function RequestSignatureModal({ isOpen, onClose, documentId }: RequestSignatureModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [facultyAdvisors, setFacultyAdvisors] = useState<{ id: string; display_name: string; }[]>([]);
  const [hods, setHods] = useState<{ id: string; display_name: string; }[]>([]);
  const [selectedFacultyAdvisor, setSelectedFacultyAdvisor] = useState<string | null>(null);
  const [selectedHod, setSelectedHod] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id, display_name, role');
        
        if (error) throw error;

        const advisors = data.filter(p => p.role === 'faculty_advisor').map(p => ({ id: p.user_id, display_name: p.display_name || 'Unnamed' }));
        const hods = data.filter(p => p.role === 'hod').map(p => ({ id: p.user_id, display_name: p.display_name || 'Unnamed' }));

        setFacultyAdvisors(advisors);
        setHods(hods);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch users for signature request.',
          variant: 'destructive',
        });
      }
    }

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, toast]);

  const handleSubmit = async () => {
    if (!user || !selectedFacultyAdvisor || !selectedHod) {
      toast({
        title: 'Incomplete Information',
        description: 'Please select a Faculty Advisor and an HOD.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('signature_requests').insert({
        document_id: documentId,
        requester_id: user.id,
        faculty_advisor_id: selectedFacultyAdvisor,
        hod_id: selectedHod,
        status: 'pending_faculty_advisor',
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Signature request sent successfully.',
      });
      onClose();
    } catch (error) {
      console.error('Error creating signature request:', error);
      toast({
        title: 'Error',
        description: 'Failed to send signature request.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Signature</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="faculty-advisor">Faculty Advisor</label>
            <Select onValueChange={setSelectedFacultyAdvisor} defaultValue={selectedFacultyAdvisor || undefined}>
              <SelectTrigger id="faculty-advisor">
                <SelectValue placeholder="Select a faculty advisor" />
              </SelectTrigger>
              <SelectContent>
                {facultyAdvisors.map(advisor => (
                  <SelectItem key={advisor.id} value={advisor.id}>
                    {advisor.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="hod">Head of Department (HOD)</label>
            <Select onValueChange={setSelectedHod} defaultValue={selectedHod || undefined}>
              <SelectTrigger id="hod">
                <SelectValue placeholder="Select an HOD" />
              </SelectTrigger>
              <SelectContent>
                {hods.map(hod => (
                  <SelectItem key={hod.id} value={hod.id}>
                    {hod.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
