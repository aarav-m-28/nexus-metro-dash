import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Document } from "@/hooks/useDocuments";
import { FileText, Send } from "lucide-react";

interface SelectDocumentToShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  onSelect: (document: Document) => void;
}

export function SelectDocumentToShareModal({ isOpen, onClose, documents, onSelect }: SelectDocumentToShareModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Select a Document to Share</DialogTitle>
          <DialogDescription>
            Choose one of your documents to share with this user.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto py-4 pr-2 space-y-2">
          {documents.length > 0 ? (
            documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 rounded-md border hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-sm text-muted-foreground">{doc.department}</p>
                  </div>
                </div>
                <Button size="sm" onClick={() => onSelect(doc)} className="gap-2">
                  <Send className="w-4 h-4" /> Select
                </Button>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">You don't have any documents to share.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}