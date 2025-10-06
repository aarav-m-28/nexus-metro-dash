

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  FileText,
  Users,
  Calendar,
  User,
  Download,
  Share2,
  MoreHorizontal,
  Edit,
  Trash2,
  FileSignature,
} from "lucide-react";
import { PDFViewer } from "@/components/documents/PDFViewer";
import { getDocumentUrl } from "@/lib/getDocumentUrl";
import { ShareDocumentModal } from "@/components/share/ShareDocumentModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { RequestSignatureModal } from "@/components/documents/RequestSignatureModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Priority = "URGENT" | "HIGH" | "ROUTINE";

interface DocumentCardProps {
  id: string;
  title: string;
  uploadDate: string;
  uploader: string;
  course: string;
  sharedWith: string[];
  priority: Priority;
  fileType?: string;
  storagePath?: string | null;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
  language?: string;
  content?: string | null;
}

const priorityConfig = {
  URGENT: {
    className: "bg-urgent/10 text-urgent",
    label: "URGENT"
  },
  HIGH: {
    className: "bg-high/10 text-high",
    label: "HIGH"
  },
  ROUTINE: {
    className: "bg-routine/10 text-routine",
    label: "ROUTINE"
  }
};

export function DocumentCard({
  id,
  title,
  uploadDate,
  uploader,
  course,
  sharedWith,
  priority,
  fileType = "PDF",
  storagePath,
  isOwner,
  onEdit,
  onDelete,
  language,
  content,
}: DocumentCardProps) {
  const config = priorityConfig[priority];
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRequestSignatureModal, setShowRequestSignatureModal] = useState(false);
  const { toast } = useToast();
  const { profile } = useProfile();

  const handleViewDocument = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (storagePath) {
      const url = await getDocumentUrl(storagePath);
      setPdfUrl(url);
    }
    setShowPDFViewer(true);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "Download not available",
      description: "File download feature will be implemented with Supabase storage",
      variant: "destructive"
    });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareModal(true);
  };

  const handleRequestSignature = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRequestSignatureModal(true);
  };
  
  return (
    <>
      <div className="bg-card border border-card p-4 rounded-xl flex flex-col gap-4 hover:border-primary transition-all duration-300 group overflow-hidden relative" onClick={handleViewDocument}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <FileText className="h-7 w-7 md:h-8 md:w-8 text-primary" />
            <span className="text-xs md:text-sm font-medium text-muted-foreground">{fileType}</span>
          </div>
          <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full", config.className)}>{config.label}</span>
        </div>
        
        <h4 className="text-base md:text-lg font-bold text-card-foreground truncate pr-10">{title}</h4>
        
        <div className="border-t border-card pt-3 space-y-2 text-sm">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Calendar className="h-4 w-4 md:h-5 md:w-5" />
            <span className="text-xs md:text-sm">{uploadDate}</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <User className="h-4 w-4 md:h-5 md:w-5" />
            <span className="text-xs md:text-sm">{uploader}</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <FileText className="h-4 w-4 md:h-5 md:w-5" />
            <span className="text-xs md:text-sm">Course: <span className="font-medium text-card-foreground">{course}</span></span>
          </div>
          {language && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Users className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-xs md:text-sm">Language: <span className="font-medium text-card-foreground">{language}</span></span>
            </div>
          )}
        </div>

        <div className="border-t border-card pt-3 mt-auto">
          <Dialog>
            <DialogTrigger asChild>
              <span className="text-sm text-muted-foreground cursor-pointer">Shared with: <span className="font-semibold text-primary">{sharedWith.length} Department{sharedWith.length !== 1 ? 's' : ''}</span></span>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Shared with</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-2 pt-4">
                {sharedWith.map((dept, idx) => <div key={idx} className="bg-muted/50 p-2 rounded-md">{dept}</div>)}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwner && <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>}
              <DropdownMenuItem onClick={handleDownload}><Download className="mr-2 h-4 w-4" />Download</DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare}><Share2 className="mr-2 h-4 w-4" />Share</DropdownMenuItem>
              {profile?.role === 'student' && <DropdownMenuItem onClick={handleRequestSignature}><FileSignature className="mr-2 h-4 w-4" />Request Signature</DropdownMenuItem>}
              {isOwner && <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <PDFViewer
        isOpen={showPDFViewer}
        onClose={() => setShowPDFViewer(false)}
        documentTitle={title}
        priority={priority}
        pdfUrl={pdfUrl}
        languageTag={language}
        content={content}
      />

      <ShareDocumentModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        documentTitle={title}
      />

      <RequestSignatureModal
        isOpen={showRequestSignatureModal}
        onClose={() => setShowRequestSignatureModal(false)}
        documentId={id}
      />
    </>
  );
}