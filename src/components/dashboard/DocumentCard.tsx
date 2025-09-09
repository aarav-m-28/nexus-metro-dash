import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileText, Users, Calendar, User, Eye, Download, Share2, MoreHorizontal } from "lucide-react";
import { PDFViewer } from "@/components/documents/PDFViewer";
import { getDocumentUrl } from "@/lib/getDocumentUrl";
import { ShareDocumentModal } from "@/components/share/ShareDocumentModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

type Priority = "URGENT" | "HIGH" | "ROUTINE";

interface DocumentCardProps {
  title: string;
  uploadDate: string;
  uploader: string;
  department: string;
  sharedWith: string[];
  priority: Priority;
  fileType?: string;
  storagePath?: string | null;
}

const priorityConfig = {
  URGENT: {
    className: "bg-urgent text-urgent-foreground hover:bg-urgent/90",
    label: "URGENT"
  },
  HIGH: {
    className: "bg-high text-high-foreground hover:bg-high/90",
    label: "HIGH"
  },
  ROUTINE: {
    className: "bg-routine text-routine-foreground hover:bg-routine/90",
    label: "ROUTINE"
  }
};

export function DocumentCard({
  title,
  uploadDate,
  uploader,
  department,
  sharedWith,
  priority,
  fileType = "PDF",
  storagePath
}: DocumentCardProps) {
  const config = priorityConfig[priority];
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();

  const handleViewDocument = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (storagePath) {
      console.log('[DocumentCard] storagePath:', storagePath);
      const url = await getDocumentUrl(storagePath);
      setPdfUrl(url);
    }
    setShowPDFViewer(true);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // For now, show a message that download is not implemented
    // In a real app, this would download from Supabase storage
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
  
  return (
    <>
      <Card 
        className={cn(
          "group relative overflow-hidden border border-border/50 transition-all duration-300 cursor-pointer",
          "hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-1",
          "bg-gradient-to-br from-card to-card/80 backdrop-blur-sm"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleViewDocument}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <CardContent className="relative p-5">
          <div className="space-y-4">
            {/* Priority Badge and Actions */}
            <div className="flex items-start justify-between">
              <Badge className={cn(
                "text-xs font-medium px-2 py-1 transition-transform duration-200", 
                config.className,
                "group-hover:scale-105"
              )}>
                {config.label}
              </Badge>
              
              <div className={cn(
                "flex items-center gap-1 transition-all duration-200",
                isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
              )}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:bg-primary/10"
                  onClick={handleViewDocument}
                >
                  <Eye className="w-3 h-3" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 hover:bg-primary/10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 bg-background border-border shadow-lg">
                    <DropdownMenuItem onClick={handleDownload} className="hover:bg-accent">
                      <Download className="w-3 h-3 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleShare} className="hover:bg-accent">
                      <Share2 className="w-3 h-3 mr-2" />
                      Share
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* File Type Indicator */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className={cn(
                "p-2 rounded-lg bg-primary/5 border border-primary/10 transition-colors duration-200",
                "group-hover:bg-primary/10 group-hover:border-primary/20"
              )}>
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-medium bg-muted px-2 py-1 rounded">{fileType}</span>
            </div>

            {/* Document Title */}
            <div className="space-y-1">
              <h3 className={cn(
                "font-semibold text-base leading-tight transition-colors duration-200 line-clamp-2",
                "text-card-foreground group-hover:text-primary"
              )}>
                {title}
              </h3>
            </div>

            {/* Metadata */}
            <div className="space-y-3 text-sm text-muted-foreground">
              {/* Upload Info */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-muted">
                    <Calendar className="w-3 h-3" />
                  </div>
                  <span className="text-xs">{uploadDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-muted">
                    <User className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-medium">{uploader}</span>
                </div>
              </div>

              {/* Department and Sharing */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">Department:</span>
                  <Badge variant="secondary" className="text-xs">{department}</Badge>
                </div>
                
                <div className="flex items-start gap-2">
                  <Users className="w-3 h-3 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <span className="text-xs font-medium text-foreground">Shared with: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {sharedWith.map((dept, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {dept}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        {/* Animated border */}
        <div className="absolute inset-0 rounded-lg border-2 border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Card>

      <PDFViewer
        isOpen={showPDFViewer}
        onClose={() => setShowPDFViewer(false)}
        documentTitle={title}
        priority={priority}
        pdfUrl={pdfUrl}
      />

      <ShareDocumentModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        documentTitle={title}
      />
    </>
  );
}