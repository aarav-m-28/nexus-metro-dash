import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Document, DocumentUpdatePayload } from "@/hooks/useDocuments"; 
import { Upload, FileText, X } from "lucide-react";

const departments = [
  "Finance Department",
  "Safety & Operations",
  "Engineering",
  "Customer Relations",
  "Technical Services",
  "Safety & Security",
  "Management",
  "Human Resources",
];
const ALL_DEPARTMENTS = "All Departments";

interface EditDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  onUpdate: (
    documentId: string,
    updates: DocumentUpdatePayload,
    newFile?: File | null,
    removeFile?: boolean
  ) => Promise<boolean>;
}

export function EditDocumentModal({
  isOpen,
  onClose,
  document,
  onUpdate,
}: EditDocumentModalProps) {
  const [formData, setFormData] = useState<DocumentUpdatePayload>({});
  const [newFile, setNewFile] = useState<File | null>(null);
  const [fileRemoved, setFileRemoved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (document) {
      setFormData({
        title: document.title,
        description: document.description,
        priority: document.priority,
        department: document.department,
        shared_with: document.shared_with || [],
      });
      setFileRemoved(false);
      setNewFile(null); // Reset file on new document
    }
  }, [document]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!document) return;

    setIsSubmitting(true);
    const success = await onUpdate(document.id, formData, newFile, fileRemoved);
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  const handleAddDepartment = (dept: string) => {
    if (dept === ALL_DEPARTMENTS) {
      setFormData((prev) => ({
        ...prev,
        shared_with: [...departments],
      }));
      return;
    }
    if (!formData.shared_with?.includes(dept)) {
      setFormData((prev) => ({
        ...prev,
        shared_with: [...(prev.shared_with || []), dept],
      }));
    }
  };

  const handleRemoveDepartment = (dept: string) => {
    setFormData((prev) => ({
      ...prev,
      shared_with: prev.shared_with?.filter((d) => d !== dept),
    }));
  };

  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Document</DialogTitle>
          <DialogDescription>
            Make changes to your document details here. Click save when you're
            done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ROUTINE">Routine</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Share with Departments</Label>
              <Select onValueChange={handleAddDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Add departments to share with" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_DEPARTMENTS}>
                    {ALL_DEPARTMENTS}
                  </SelectItem>
                  {departments
                    .filter((dept) => !formData.shared_with?.includes(dept))
                    .map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {formData.shared_with && formData.shared_with.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {formData.shared_with.map((dept) => (
                    <Badge key={dept} variant="secondary" className="gap-1">
                      {dept}
                      <button
                        type="button"
                        className="h-4 w-4 p-0 rounded-full hover:bg-destructive/50 hover:text-destructive-foreground flex items-center justify-center"
                        onClick={() => handleRemoveDepartment(dept)}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="file-upload">File Attachment</Label>
              <div
                className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors min-h-[120px] flex items-center justify-center"
              >
                {newFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="w-8 h-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">{newFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(newFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setNewFile(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (document.file_name && !fileRemoved) ? (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="flex items-center justify-center gap-3 text-left">
                      <FileText className="w-8 h-8 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="font-medium truncate">{document.file_name}</p>
                        {document.file_size && (
                          <p className="text-sm text-muted-foreground">
                            {(document.file_size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('edit-file-upload')?.click()}>
                        Change File
                      </Button>
                      <Button type="button" variant="destructive" size="sm" onClick={() => setFileRemoved(true)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground cursor-pointer" onClick={() => document.getElementById('edit-file-upload')?.click()}>
                    <Upload className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-medium">Add a file</p>
                    <p className="text-xs">Click here to select a file</p>
                    {fileRemoved && (
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); setFileRemoved(false); }}
                      >
                        Undo remove
                      </Button>
                    )}
                  </div>
                )}
                <input
                  id="edit-file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={(e) => {
                    setNewFile(e.target.files?.[0] || null);
                    setFileRemoved(false);
                  }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}