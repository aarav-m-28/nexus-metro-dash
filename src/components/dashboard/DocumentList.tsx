import { DocumentCard } from "./DocumentCard";
import { useDocuments } from "@/hooks/useDocuments";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Upload } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { FileUploadModal } from "@/components/upload/FileUploadModal";

export function DocumentList() {
  const { documents, loading } = useDocuments();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'sharedByMe' | 'sharedWithMe'>('all');

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
          <button type="button" onClick={() => setUploadOpen(true)} className="gap-2">
            Upload Document
          </button>
          <FileUploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} />
        </div>
      </div>
    );
  }

  // Filtering logic
  let filteredDocs = documents;
  if (filter === 'sharedByMe' && user) {
    filteredDocs = documents.filter(doc => doc.user_id === user.id);
  } else if (filter === 'sharedWithMe' && profile && profile.department) {
    filteredDocs = documents.filter(doc => {
      // Only show if user's department is in shared_with
      return Array.isArray(doc.shared_with) && doc.shared_with.includes(profile.department!);
    });
  }

  return (
    <div className="p-6 animate-fade-in-0 relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Recent Documents</h2>
          <p className="text-sm text-muted-foreground">
            {filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-green-600 text-white' : 'bg-muted'}`}>All</button>
          <button onClick={() => setFilter('sharedByMe')} className={`px-3 py-1 rounded ${filter === 'sharedByMe' ? 'bg-green-600 text-white' : 'bg-muted'}`}>Shared By Me</button>
          <button onClick={() => setFilter('sharedWithMe')} className={`px-3 py-1 rounded ${filter === 'sharedWithMe' ? 'bg-green-600 text-white' : 'bg-muted'}`}>Shared With Me</button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredDocs.map((doc, index) => (
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
              uploader={doc.user_id || "You"}
              department={doc.department || "-"}
              sharedWith={Array.isArray(doc.shared_with) && doc.shared_with.length > 0 ? doc.shared_with : (doc.is_public ? ["Public"] : ["Personal"])}
              priority={doc.priority as 'URGENT' | 'HIGH' | 'ROUTINE' || "ROUTINE"}
              fileType={doc.file_type?.split('/')[1]?.toUpperCase() || 'FILE'}
              storagePath={doc.storage_path}
            />
          </div>
        ))}
      </div>
    </div>
  );
}