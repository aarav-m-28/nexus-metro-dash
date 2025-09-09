import { useState } from "react";
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

const urgencyOptions = [
  { value: "NORMAL", label: "Normal", color: "bg-green-100 text-green-800" },
  { value: "URGENT", label: "Urgent", color: "bg-yellow-100 text-yellow-800" },
  { value: "CRITICAL", label: "Critical", color: "bg-red-100 text-red-800" }
];

export function FileUploadModal({ isOpen, onClose }: FileUploadModalProps) {
  const { uploadDocument } = useDocuments();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    priority: "ROUTINE",
    urgency: "NORMAL",
    description: "",
    sharedWith: [] as string[]
  });
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive"
        });
        return;
      }
      setSelectedFile(file);
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, "") }));
      }
    }
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
    if (!selectedFile || !formData.title || !formData.department) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadDocument(
        selectedFile,
        formData.title,
        formData.description,
        formData.department,
        formData.priority,
        formData.urgency,
        formData.sharedWith
      );
      if (result) {
        setUploadComplete(true);
        toast({
          title: "Upload successful",
          description: `${selectedFile.name} has been uploaded successfully`,
        });
        setTimeout(() => {
          handleClose();
        }, 1500);
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setIsUploading(false);
    setUploadComplete(false);
    setFormData({
      title: "",
      department: "",
      priority: "ROUTINE",
      urgency: "NORMAL",
      description: "",
      sharedWith: []
    });
    onClose();
  };

  if (uploadComplete) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Successful!</h3>
            <p className="text-muted-foreground">Your document has been uploaded and shared with the selected departments.</p>
          </div>
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
            Upload New Document
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* File Upload Area */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Select File *</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Drop your file here or click to browse</p>
                  <p className="text-sm text-muted-foreground">Supports PDF, DOCX, XLSX files up to 10MB</p>
                </div>
              )}
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.docx,.xlsx,.doc,.xls"
                onChange={handleFileSelect}
              />
              {!selectedFile && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  Choose File
                </Button>
              )}
            </div>
          </div>

          {/* Document Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="title">Document Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter document title"
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
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
              <Label htmlFor="urgency">Urgency Status</Label>
              <Select
                value={formData.urgency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {urgencyOptions.map((urgency) => (
                    <SelectItem key={urgency.value} value={urgency.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${urgency.color}`} />
                        {urgency.label}
                      </div>
                    </SelectItem>
                  ))}
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
              placeholder="Add a brief description of the document"
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
          <Button onClick={handleUpload} disabled={isUploading} className="gap-2">
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Document
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}