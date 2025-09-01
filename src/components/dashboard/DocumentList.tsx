import { DocumentCard } from "./DocumentCard";

// Sample document data
const sampleDocuments = [
  {
    title: "Safety Protocol Amendment - Metro Line 1 Operations Manual",
    uploadDate: "Dec 15, 2024",
    uploader: "Raj Kumar",
    department: "Safety & Operations",
    sharedWith: ["Engineering", "Operations", "Finance"],
    priority: "URGENT" as const,
    fileType: "PDF"
  },
  {
    title: "Q4 2024 Financial Performance Analysis and Budget Variance Report",
    uploadDate: "Dec 14, 2024", 
    uploader: "Priya Nair",
    department: "Finance Department",
    sharedWith: ["Management", "Board"],
    priority: "HIGH" as const,
    fileType: "XLSX"
  },
  {
    title: "Infrastructure Maintenance Schedule - January 2025",
    uploadDate: "Dec 13, 2024",
    uploader: "Arun Menon",
    department: "Engineering",
    sharedWith: ["Operations", "Maintenance"],
    priority: "ROUTINE" as const,
    fileType: "PDF"
  },
  {
    title: "Passenger Feedback Analysis Report - November 2024",
    uploadDate: "Dec 12, 2024",
    uploader: "Sita Devi",
    department: "Customer Relations",
    sharedWith: ["Management", "Operations"],
    priority: "ROUTINE" as const,
    fileType: "DOCX"
  },
  {
    title: "Energy Consumption Optimization Study - Phase 2 Results",
    uploadDate: "Dec 11, 2024",
    uploader: "Dr. Kumar",
    department: "Technical Services",
    sharedWith: ["Engineering", "Finance"],
    priority: "HIGH" as const,
    fileType: "PDF"
  },
  {
    title: "Emergency Response Drill Report - December 2024",
    uploadDate: "Dec 10, 2024",
    uploader: "Security Team",
    department: "Safety & Security",
    sharedWith: ["All Departments"],
    priority: "URGENT" as const,
    fileType: "PDF"
  }
];

export function DocumentList() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Recent Documents</h2>
          <p className="text-sm text-muted-foreground">
            {sampleDocuments.length} documents found
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {sampleDocuments.map((doc, index) => (
          <DocumentCard
            key={index}
            title={doc.title}
            uploadDate={doc.uploadDate}
            uploader={doc.uploader}
            department={doc.department}
            sharedWith={doc.sharedWith}
            priority={doc.priority}
            fileType={doc.fileType}
          />
        ))}
      </div>
    </div>
  );
}