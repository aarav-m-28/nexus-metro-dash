import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Share2, Users, X, User, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ShareDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentTitle: string;
}

interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  department: string;
  email: string;
}

const departments = [
  "Finance Department",
  "Safety & Operations", 
  "Engineering",
  "Customer Relations",
  "Technical Services",
  "Safety & Security",
  "Management",
  "Human Resources"
];

export function ShareDocumentModal({ isOpen, onClose, documentId, documentTitle }: ShareDocumentModalProps) {
  const [step, setStep] = useState(1);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Profile[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (isOpen && allProfiles.length === 0) {
      const fetchProfiles = async () => {
        const { data, error } = await supabase.from('profiles').select('*').returns<Profile[]>();
        if (error) console.error('Error fetching profiles:', error);
        else if (data) setAllProfiles(data);
      };
      fetchProfiles();
    }
  }, [isOpen, allProfiles.length]);

  const handleAddDepartment = (dept: string) => {
    if (!selectedDepartments.includes(dept)) {
      setSelectedDepartments(prev => [...prev, dept]);
    }
  };

  const handleRemoveDepartment = (dept: string) => {
    setSelectedDepartments(prev => prev.filter(d => d !== dept));
  };

  const handleAddUser = (user: Profile) => {
    if (!selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers(prev => [...prev, user]);
    }
    setUserSearch("");
  };

  const handleRemoveUser = (user: Profile) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
  };

  const filteredProfiles = allProfiles.filter(p => 
    p.display_name?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleShare = async () => {
    if (selectedDepartments.length === 0 && selectedUsers.length === 0) {
      toast({ title: "Select recipients", description: "Please select at least one department or user to share with", variant: "destructive" });
      return;
    }

    setIsSharing(true);
    try {
      const { error } = await supabase.rpc('share_document', {
        document_id: documentId,
        share_with: selectedDepartments,
        share_with_users: selectedUsers.map(u => u.user_id),
        subject,
        year,
        target_role: targetRole,
        category
      });
      if (error) throw error;
      
      toast({ title: "Document shared successfully", description: `${documentTitle} has been shared.` });
      setTimeout(handleClose, 1500);
    } catch (error) {
      console.error("Error sharing document:", error);
      toast({ title: "Sharing failed", description: "There was an error sharing the document.", variant: "destructive" });
    } finally {
      setIsSharing(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedDepartments([]);
    setSelectedUsers([]);
    setUserSearch("");
    setSubject("");
    setYear("");
    setTargetRole("");
    setCategory("");
    setIsSharing(false);
    onClose();
  };

  const renderStep1 = () => (
    <div className="space-y-6 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label>Subject</Label>
          <Input placeholder="Enter subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div className="space-y-3">
          <Label>Category</Label>
          <Select onValueChange={setCategory} value={category}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="internal">Internal</SelectItem>
              <SelectItem value="external">External</SelectItem>
              <SelectItem value="confidential">Confidential</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <Label>Year</Label>
          <Select onValueChange={setYear} value={year}>
            <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1st Year</SelectItem>
              <SelectItem value="2">2nd Year</SelectItem>
              <SelectItem value="3">3rd Year</SelectItem>
              <SelectItem value="4">4th Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <Label>Target Role</Label>
          <Select onValueChange={setTargetRole} value={targetRole}>
            <SelectTrigger><SelectValue placeholder="Select target role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="faculty">Faculty</SelectItem>
              <SelectItem value="hod">HOD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-3">
        <Label>Share with Departments</Label>
        <Select onValueChange={handleAddDepartment}>
          <SelectTrigger><SelectValue placeholder="Add departments" /></SelectTrigger>
          <SelectContent>
            {departments.filter(dept => !selectedDepartments.includes(dept)).map(dept => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
          </SelectContent>
        </Select>
        {selectedDepartments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedDepartments.map(dept => (
              <Badge key={dept} variant="secondary" className="gap-1">{dept}<Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => handleRemoveDepartment(dept)}><X className="w-3 h-3" /></Button></Badge>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-3">
        <Label>Share with Users</Label>
        <Input placeholder="Search for users..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
        {userSearch && (
          <div className="border rounded-md max-h-48 overflow-y-auto">
            {filteredProfiles.map(p => <div key={p.id} className="p-2 hover:bg-muted cursor-pointer" onClick={() => handleAddUser(p)}>{p.display_name}</div>)}
          </div>
        )}
        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map(user => (
              <Badge key={user.id} variant="secondary" className="gap-1">{user.display_name}<Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => handleRemoveUser(user)}><X className="w-3 h-3" /></Button></Badge>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={handleClose}>Cancel</Button>
        <Button onClick={handleShare} disabled={isSharing || (selectedDepartments.length === 0 && selectedUsers.length === 0)}>
          {isSharing ? 'Sharing...' : 'Share'}
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 py-4">
      <p>Step 2: Set permissions and share</p>
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
        <Button onClick={handleShare} disabled={isSharing}>Share</Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Document
          </DialogTitle>
          <p className="text-sm text-muted-foreground">Sharing: <span className="font-medium">{documentTitle}</span></p>
        </DialogHeader>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
      </DialogContent>
    </Dialog>
  );
}
