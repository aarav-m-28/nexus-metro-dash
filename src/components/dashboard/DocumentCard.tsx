import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
    className: "bg-red-500/10 text-red-400",
    label: "URGENT"
  },
  HIGH: {
    className: "bg-yellow-500/10 text-yellow-400",
    label: "HIGH"
  },
  ROUTINE: {
    className: "bg-blue-500/10 text-blue-400",
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
      <div className="bg-gray-800/50 border border-gray-700/80 p-5 rounded-xl flex flex-col gap-4 hover:border-indigo-500/50 transition-all duration-300 group overflow-hidden" onClick={handleViewDocument}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-400" />
            <span className="text-sm font-medium text-gray-400">{fileType}</span>
          </div>
          <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full", config.className)}>{config.label}</span>
        </div>
        
        <h4 className="text-lg font-bold text-white truncate">{title}</h4>
        
        <div className="border-t border-gray-700/60 pt-4 space-y-3 text-sm">
          <div className="flex items-center gap-3 text-gray-300">
            <Calendar className="h-5 w-5 text-gray-500" />
            <span>{uploadDate}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <User className="h-5 w-5 text-gray-500" />
            <span>{uploader}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <FileText className="h-5 w-5 text-gray-500" />
            <span>Course: <span className="font-medium text-gray-200">{course}</span></span>
          </div>
          {language && (
            <div className="flex items-center gap-3 text-gray-300">
              <Users className="h-5 w-5 text-gray-500" />
              <span>Language: <span className="font-medium text-gray-200">{language}</span></span>
            </div>
          )}
        </div>

        <div className="border-t border-gray-700/60 pt-4 mt-auto">
          <div className="tooltip">
            <span className="text-sm text-gray-400">Shared with: <span className="font-semibold text-indigo-400 cursor-pointer">{sharedWith.length} Department{sharedWith.length !== 1 ? 's' : ''}</span></span>
            <div className="tooltip-text">
              <span className="font-bold mb-1 block">Departments</span>
              {sharedWith.map((dept, idx) => <span key={idx}>{dept}</span>)}
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
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
              {isOwner && <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-red-500"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>}
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