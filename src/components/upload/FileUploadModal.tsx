import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge"; 
import { Switch } from "@/components/ui/switch";
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

const priorities = [
  { value: "ROUTINE", label: "Routine", color: "bg-blue-100 text-blue-800" },
  { value: "HIGH", label: "High Priority", color: "bg-yellow-100 text-yellow-800" },
  { value: "URGENT", label: "Urgent", color: "bg-red-100 text-red-800" }
];

export function FileUploadModal({ isOpen, onClose }: FileUploadModalProps) {
  const { profile } = useProfile();
  const { uploadDocument } = useDocuments();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isNoFile, setIsNoFile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    priority: "ROUTINE",
    description: "",
    sharedWith: [] as string[],
    language: "english",
    content: "",
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
      if (newFiles.length === 1 && !formData.title) {
        setFormData(prev => ({ ...prev, title: newFiles[0].name.replace(/\.[^/.]+$/, "") }));
      }
    }
  };

  const handleNoFileChange = (checked: boolean) => {
    setIsNoFile(checked);
    if (checked) {
      setSelectedFiles([]);
    }
  };

  const handleRemoveFile = (fileToRemove: File) => {
    setSelectedFiles(prev => prev.filter(file => file !== fileToRemove));
  };

  const handleAddDepartment = (dept: string) => {
    if (dept === ALL_DEPARTMENTS) {
      setFormData(prev => ({
        ...prev,
        sharedWith: [...departments]
      }));
      return;
    }
    if (!formData.sharedWith.includes(dept)) {
      setFormData(prev => ({
        ...prev,
        sharedWith: [...prev.sharedWith, dept]
      }));
    }
  };

  const handleRemoveDepartment = (dept: string) => {
    setFormData(prev => ({
      ...prev,
      sharedWith: prev.sharedWith.filter(d => d !== dept)
    }));
  };

  const handleUpload = async () => {
    if (!formData.title || !formData.department) {
      toast({
        title: "Missing information",
        description: "Please provide a title and select a department.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const uploadPromises = selectedFiles.map(file => 
        uploadDocument(
          file,
          formData.title || file.name.replace(/\.[^/.]+$/, ""), // Use batch title or file name
          formData.description,
          formData.department,
          formData.priority,
          formData.sharedWith,
          true, // All documents are public by default in the DB
          formData.language
        )
      );

      if (selectedFiles.length === 0) {
        uploadPromises.push(
          uploadDocument(
            null,
            formData.title,
            formData.description,
            formData.department,
            formData.priority,
            formData.sharedWith,
            true, // All documents are public by default in the DB
            formData.language
          )
        );
      }

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(r => r).length;
      const totalToUpload = selectedFiles.length > 0 ? selectedFiles.length : 1;

      if (successfulUploads > 0) {
        setUploadComplete(true);
        toast({
          title: "Upload successful",
          description: `${successfulUploads} of ${totalToUpload} document(s) created.`,
        });
        setTimeout(() => {
          handleClose();
        }, 1500);
      }

      if (successfulUploads < selectedFiles.length) {
        toast({
          title: "Some uploads failed",
          description: "Please check the console for more details.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files.",
        variant: "destructive"
      });
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
      priority: "ROUTINE",
      description: "",
      sharedWith: [],
      language: "english",
      content: "",
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload New Document(s)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* File Upload Area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="file-upload">File Attachment</Label>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="no-file-checkbox" checked={isNoFile} onChange={(e) => handleNoFileChange(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                <Label htmlFor="no-file-checkbox" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Create without a file
                </Label>
              </div>
            </div>
            {!isNoFile && (
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                {selectedFiles.length > 0 ? (
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between gap-3 bg-muted p-2 rounded-md">
                        <div className="flex items-center gap-3">
                          <FileText className="w-6 h-6 text-primary" />
                          <div className="text-left">
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(file)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                     <Button
                      variant="outline"
                      className="mt-4 w-full"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      Add more files...
                    </Button>
                  </div>
                ) : (
                  <div className="cursor-pointer" onClick={() => document.getElementById('file-upload')?.click()}>
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Drop your files here or click to browse</p>
                    <p className="text-sm text-muted-foreground">Supports PDF, DOCX, XLSX files up to 10MB</p>
                  </div>
                )}
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  accept=".pdf,.docx,.xlsx,.doc,.xls"
                  onChange={handleFileSelect}
                />
              </div>
            )}
          </div>
          
          {isNoFile && (
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your document content here..."
                rows={10}
                className="min-h-[200px]"
              />
            </div>
          )}

          {/* Document Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2"> 
              <Label htmlFor="title">Batch Title (Optional)</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Q2 Financial Reports"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">Title is required. If uploading files, this can be a batch title, otherwise filenames will be used.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                name="department"
                value={formData.department}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Urgency</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${priority.color}`} />
                        {priority.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="hindi">Hindi</SelectItem>
                  <SelectItem value="malayalam">Malayalam</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add a brief description for all documents in this batch"
              rows={3}
            />
          </div>

          {/* Share With */}
          <div className="space-y-3">
            <Label>Share with Departments</Label>
            <Select onValueChange={handleAddDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Add departments to share with" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key={ALL_DEPARTMENTS} value={ALL_DEPARTMENTS}>{ALL_DEPARTMENTS}</SelectItem>
                {departments
                  .filter(dept => !formData.sharedWith.includes(dept))
                  .map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
            
            {formData.sharedWith.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.sharedWith.map((dept) => (
                  <Badge key={dept} variant="secondary" className="gap-1">
                    {dept}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleRemoveDepartment(dept)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={isUploading || !formData.title || !formData.department} className="gap-2">
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload {selectedFiles.length > 0 ? selectedFiles.length : ''} Document{selectedFiles.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}