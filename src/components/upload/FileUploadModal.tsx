import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, X, FileText, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDocuments } from "@/hooks/useDocuments";
import { useProfile } from "@/hooks/useProfile";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
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
const ALL_DEPARTMENTS = "All Departments";

const categories = [
  { value: "ACADEMIC", label: "Academic" },
  { value: "ADMINISTRATIVE", label: "Administrative" },
  { value: "CIRCULAR", label: "Circular" },
  { value: "NOTICE", label: "Notice" },
  { value: "OTHER", label: "Other" },
];

const years = [1, 2, 3, 4];
const roles = ["Student", "Faculty", "HOD"];
const sections = ["A", "B", "C", "D"];

export function FileUploadModal({ isOpen, onClose }: FileUploadModalProps) {
  const { profile } = useProfile();
  const { uploadDocument } = useDocuments();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    category: "ACADEMIC",
    description: "",
    sharedWith: [] as string[],
    language: "english",
    subject: "",
    year: "",
    target_role: "",
    section: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && profile?.department) {
      setFormData(prev => ({ ...prev, department: profile.department }));
    }
  }, [isOpen, profile]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length > 0) {
      const newFiles = files.filter(file => {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          toast({
            title: "File too large",
            description: `${file.name} is larger than 10MB and was not added.`,
            variant: "destructive"
          });
          return false;
        }
        return true;
      });
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (fileToRemove: File) => {
    setSelectedFiles(prev => prev.filter(file => file !== fileToRemove));
  };

  const handleAddDepartment = (dept: string) => {
    if (dept === ALL_DEPARTMENTS) {
      setFormData(prev => ({ ...prev, sharedWith: [...departments] }));
      return;
    }
    if (!formData.sharedWith.includes(dept)) {
      setFormData(prev => ({ ...prev, sharedWith: [...prev.sharedWith, dept] }));
    }
  };

  const handleRemoveDepartment = (dept: string) => {
    setFormData(prev => ({ ...prev, sharedWith: prev.sharedWith.filter(d => d !== dept) }));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
        toast({ title: "No files selected", description: "Please select at least one file to upload.", variant: "destructive" });
        return;
    }
    if (!formData.title || !formData.department) {
      toast({ title: "Missing information", description: "Please provide a title and select a department.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const uploadPromises = selectedFiles.map(file => 
        uploadDocument(
          file,
          formData.title || file.name.replace(/\.[^/.]+$/, ""),
          formData.description,
          formData.department,
          formData.category,
          formData.sharedWith,
          true,
          formData.language,
          formData.subject,
          formData.year,
          formData.target_role,
          formData.section
        )
      );

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(r => r).length;

      if (successfulUploads > 0) {
        setUploadComplete(true);
        toast({ title: "Upload successful", description: `${successfulUploads} of ${selectedFiles.length} document(s) created.` });
        setTimeout(() => { handleClose(); }, 1500);
      } else {
        throw new Error("Upload failed for all files.");
      }

    } catch (error) {
      toast({ title: "Upload failed", description: "There was an error uploading your files.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFiles([]);
    setIsUploading(false);
    setUploadComplete(false);
    setFormData({
      title: "",
      department: "",
      category: "ACADEMIC",
      description: "",
      sharedWith: [],
      language: "english",
      subject: "",
      year: "",
      target_role: "",
      section: "",
    });
    onClose();
  };

  if (uploadComplete) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="sr-only">Upload Successful</DialogTitle>
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Upload Successful!</h3>
              <p className="text-muted-foreground">Your document(s) have been uploaded.</p>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Upload className="w-5 h-5" />Upload New Document(s)</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
          <div className="space-y-6">
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              {selectedFiles.length > 0 ? (
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between gap-3 bg-muted p-2 rounded-md">
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-primary" />
                        <div className="text-left">
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveFile(file)}><X className="w-4 h-4" /></Button>
                    </div>
                  ))}
                  <Button variant="outline" className="mt-4 w-full" onClick={() => document.getElementById('file-upload')?.click()}>Add more files...</Button>
                </div>
              ) : (
                <div className="cursor-pointer" onClick={() => document.getElementById('file-upload')?.click()}>
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Drop your files here or click to browse</p>
                  <p className="text-sm text-muted-foreground">Supports PDF, DOCX, XLSX files up to 10MB</p>
                </div>
              )}
              <input id="file-upload" type="file" multiple className="hidden" accept=".pdf,.docx,.xlsx,.doc,.xls" onChange={handleFileSelect} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Add a brief description..." />
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g., Q2 Financial Reports" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Input id="department" value={formData.department} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" value={formData.subject} onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))} placeholder="e.g., Computer Science" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={formData.language} onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}>
                  <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="hindi">Hindi</SelectItem>
                    <SelectItem value="malayalam">Malayalam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Select value={formData.year} onValueChange={(value) => setFormData(prev => ({ ...prev, year: value }))}>
                        <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                        <SelectContent>
                            {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="section">Section</Label>
                    <Select value={formData.section} onValueChange={(value) => setFormData(prev => ({ ...prev, section: value }))}>
                        <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                        <SelectContent>
                            {sections.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="target_role">Target Audience</Label>
                    <Select value={formData.target_role} onValueChange={(value) => setFormData(prev => ({ ...prev, target_role: value }))}>
                        <SelectTrigger><SelectValue placeholder="Select target audience" /></SelectTrigger>
                        <SelectContent>
                            {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-3">
              <Label>Share with Departments</Label>
              <Select onValueChange={handleAddDepartment}>
                <SelectTrigger><SelectValue placeholder="Add departments to share with" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_DEPARTMENTS}>{ALL_DEPARTMENTS}</SelectItem>
                  {departments.filter(dept => !formData.sharedWith.includes(dept)).map((dept) => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                </SelectContent>
              </Select>
              {formData.sharedWith.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.sharedWith.map((dept) => (
                    <Badge key={dept} variant="secondary" className="gap-1">{dept}<Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => handleRemoveDepartment(dept)}><X className="w-3 h-3" /></Button></Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>Cancel</Button>
          <Button onClick={handleUpload} disabled={isUploading || selectedFiles.length === 0 || !formData.title || !formData.department}>Upload</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}