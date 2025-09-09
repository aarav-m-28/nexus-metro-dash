import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Printer, Share2, Maximize2, Search, ZoomIn, ZoomOut, FileText } from "lucide-react";
import { TextTranslator } from "@/components/common/TextTranslator";

interface PDFViewerProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  priority: "URGENT" | "HIGH" | "ROUTINE";
  pdfUrl?: string | null;
}

// Mock PDF content for safety protocol
const mockPDFContent = `
KOCHI METRO RAIL LIMITED
SAFETY PROTOCOL AMENDMENT - METRO LINE 1 OPERATIONS MANUAL

Document ID: KMRL-SP-001-2024
Version: 2.1
Date: December 15, 2024
Approved By: Chief Safety Officer

SECTION 1: EMERGENCY PROCEDURES

1.1 EVACUATION PROTOCOLS
In case of emergency, all personnel must follow these steps:
• Immediately alert the Control Center
• Activate emergency lighting systems
• Guide passengers to nearest emergency exits
• Maintain calm and orderly evacuation
• Report to designated assembly points

1.2 FIRE SAFETY MEASURES
Fire detection systems are installed throughout:
• Automatic sprinkler systems in all coaches
• Fire extinguishers at 50-meter intervals
• Emergency communication systems
• Smoke detection in tunnels and stations

SECTION 2: OPERATIONAL SAFETY

2.1 SIGNAL SYSTEMS
The Automatic Train Protection (ATP) system ensures:
• Speed control and monitoring
• Collision prevention mechanisms  
• Real-time train location tracking
• Automatic brake application

2.2 PLATFORM SAFETY
Platform safety measures include:
• Platform screen doors at all stations
• Gap monitoring between train and platform
• Audio-visual passenger information systems
• Emergency stop buttons accessible to staff

SECTION 3: MAINTENANCE PROTOCOLS

3.1 DAILY INSPECTIONS
Required daily safety checks:
• Track condition assessment
• Signal system functionality
• Emergency equipment verification
• Communication system testing

3.2 WEEKLY MAINTENANCE
Comprehensive weekly procedures:
• Electrical system inspection
• Fire safety system testing
• Emergency evacuation drill simulation
• Equipment calibration verification

SECTION 4: INCIDENT REPORTING

4.1 IMMEDIATE RESPONSE
All incidents must be reported within 15 minutes to:
• Control Center: +91-484-2231234
• Emergency Services: 112
• KMRL Safety Hotline: +91-484-2235678

This document contains critical safety information for KMRL operations.
All staff must be familiar with these protocols and procedures.

Last Updated: December 15, 2024
Next Review: March 15, 2025
`;

export function PDFViewer({ isOpen, onClose, documentTitle, priority, pdfUrl }: PDFViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [selectedText, setSelectedText] = useState('');
  const [translatorPosition, setTranslatorPosition] = useState({ x: 0, y: 0 });
  const [showTranslator, setShowTranslator] = useState(false);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const text = selection.toString().trim();
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setSelectedText(text);
      setTranslatorPosition({ x: rect.left, y: rect.bottom });
      setShowTranslator(true);
    }
  };

  const priorityConfig = {
    URGENT: { className: "bg-urgent text-urgent-foreground", label: "URGENT" },
    HIGH: { className: "bg-high text-high-foreground", label: "HIGH" },
    ROUTINE: { className: "bg-routine text-routine-foreground", label: "ROUTINE" }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[90vh] p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <DialogTitle className="text-lg font-semibold pr-8">{documentTitle}</DialogTitle>
                <Badge className={`w-fit ${priorityConfig[priority].className}`}>
                  {priorityConfig[priority].label}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(50, zoom - 25))}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground px-2">{zoom}%</span>
                <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(200, zoom + 25))}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Maximize2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Printer className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6">
            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                title={documentTitle}
                width="100%"
                height="600px"
                style={{ border: 0 }}
              />
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

      {showTranslator && selectedText && (
        <TextTranslator
          selectedText={selectedText}
          position={translatorPosition}
          onClose={() => setShowTranslator(false)}
        />
      )}
    </>
  );
}