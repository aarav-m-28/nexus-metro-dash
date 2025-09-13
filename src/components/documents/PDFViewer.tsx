import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Printer, Share2, Maximize2, Search, ZoomIn, ZoomOut, FileText } from "lucide-react";
import { ShareDocumentModal } from "@/components/share/ShareDocumentModal";


interface PDFViewerProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  priority: "URGENT" | "HIGH" | "ROUTINE";
  pdfUrl?: string | null;
  languageTag?: string;
  content?: string | null;
};

export function PDFViewer({ isOpen, onClose, documentTitle, priority, pdfUrl, languageTag, content }: PDFViewerProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  const [showShareModal, setShowShareModal] = useState(false);
  const viewerContainerRef = useRef<HTMLDivElement>(null);

  // Download PDF
  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = documentTitle + '.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Print PDF
  const handlePrint = () => {
    if (pdfUrl) {
      const win = window.open(pdfUrl, '_blank');
      if (win) {
        win.onload = () => win.print();
      }
    }
  };
  const [zoom, setZoom] = useState(100);

  // Share PDF
  const handleShare = () => {
    setShowShareModal(true);
  };

  // Zoom logic for iframe
  const getIframeStyle = () => {
    const style: React.CSSProperties = {
      border: 0,
      width: '100%',
      height: '600px',
      transform: 'scale(' + (zoom / 100) + ')',
      transformOrigin: 'top left',
      pointerEvents: 'auto'
    };
    return style;
  };

  const priorityConfig = {
    URGENT: { className: "bg-urgent text-urgent-foreground", label: "URGENT" },
    HIGH: { className: "bg-high text-high-foreground", label: "HIGH" },
    ROUTINE: { className: "bg-routine text-routine-foreground", label: "ROUTINE" }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent
            className="p-0"
            style={{ maxWidth: '98vw', maxHeight: '98vh', borderRadius: 12, overflow: 'auto' }}
          >
            <DialogHeader className="p-6 pb-4 border-b">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <DialogTitle className="text-lg font-semibold pr-8">{documentTitle}</DialogTitle>
                  <div className="flex gap-2 items-center">
                    <Badge className={"w-fit " + priorityConfig[priority].className}>
                      {priorityConfig[priority].label}
                    </Badge>
                    {languageTag && (
                      <Badge className="w-fit bg-blue-100 text-blue-800 border border-blue-200" title="Language Tag">
                        {languageTag}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Search is a placeholder, real search needs PDF.js */}
                  <Button variant="outline" size="sm" title="Search (coming soon)" disabled>
                    <Search className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(50, zoom - 25))} title="Zoom Out">
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">{zoom}%</span>
                  <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(200, zoom + 25))} title="Zoom In">
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare} title="Share">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePrint} title="Print">
                    <Printer className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload} title="Download">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <ScrollArea className="flex-1 p-6">
              {pdfUrl ? (
                <div
                  ref={viewerContainerRef}
                  style={{
                    overflow: 'auto',
                    width: '100%',
                    height: '600px',
                    background: '#111',
                  }}
                > 
                  <iframe
                    src={pdfUrl}
                    title={documentTitle}
                    width="100%"
                    height={520}
                    style={getIframeStyle()}
                  />
                </div>
              ) : content ? (
                <div className="bg-background p-6 rounded-lg border">
                  <pre className="text-sm whitespace-pre-wrap font-sans">
                    {content}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-20">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">PDF Viewer</h3>
                  <p className="text-gray-500 mb-4">Document: {documentTitle}</p>
                  <p className="text-sm text-gray-400">
                    PDF not available or loading...
                  </p>
                </div>
              )}
            </ScrollArea>
          </DialogContent>
      </Dialog>
      <ShareDocumentModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        documentTitle={documentTitle}
      />
    </>
  );
}
