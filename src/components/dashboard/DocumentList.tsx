import { DocumentCard } from "./DocumentCard";
import { useDocuments } from "@/hooks/useDocuments";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Upload } from "lucide-react";
import { FileUpload } from "@/components/upload/FileUpload";

export function DocumentList() {
  const { documents, loading } = useDocuments();

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Recent Documents</h2>
            <p className="text-sm text-muted-foreground">Loading documents...</p>
          </div>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 rounded-lg border">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Recent Documents</h2>
            <p className="text-sm text-muted-foreground">No documents found</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted/50 p-6 mb-4">
            <FileText className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No documents yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Get started by uploading your first document to the system.
          </p>
          <FileUpload />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in-0 relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Recent Documents</h2>
          <p className="text-sm text-muted-foreground">
            {documents.length} document{documents.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {documents.map((doc, index) => (
          <div 
            key={doc.id}
            className="animate-fade-in-0"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <DocumentCard
              title={doc.title}
              uploadDate={new Date(doc.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
              uploader="You"
              department="Personal"
              sharedWith={doc.is_public ? ["Public"] : ["Personal"]}
              priority="ROUTINE"
              fileType={doc.file_type?.split('/')[1]?.toUpperCase() || 'FILE'}
            />
          </div>
        ))}
      </div>
    </div>
  );
}