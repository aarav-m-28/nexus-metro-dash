import { DocumentCard } from "./DocumentCard";
import { Document, useDocuments } from "@/hooks/useDocuments";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditDocumentModal } from "@/components/documents/EditDocumentModal";

interface DocumentListProps {
  filter: 'all' | 'sharedByMe' | 'sharedWithMe';
}

export function DocumentList({ filter }: DocumentListProps) {
  const { documents, loading, deleteDocument, updateDocument } = useDocuments();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [deletingDocument, setDeletingDocument] = useState<Document | null>(null);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);

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
      </div>
    );
  }

  // Filtering logic
  const accessibleDocs = documents.filter(doc => {
    const isOwner = doc.user_id === user?.id;
    const isSharedWithUserCourse = profile?.course && Array.isArray(doc.shared_with) && doc.shared_with.includes(profile.course);
    const isSharedWithUser = user?.id && Array.isArray(doc.shared_with_users) && doc.shared_with_users.includes(user.id);

    // A document is accessible if you own it, or it's shared with you or your course.
    return isOwner || isSharedWithUserCourse || isSharedWithUser;
  });

  let filteredDocs = accessibleDocs;
  if (filter === 'sharedByMe' && user) {
    filteredDocs = accessibleDocs.filter(doc => doc.user_id === user?.id);
  } else if (filter === 'sharedWithMe' && profile && profile.course) {
    // "Shared with me" is simply all accessible documents that the user does not own.
    filteredDocs = accessibleDocs.filter(doc => doc.user_id !== user?.id);
  }

  return (
    <>
    <div className="p-6 animate-fade-in-0 relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Recent Documents</h2>
            <p className="text-sm text-muted-foreground">
              {filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''} found
            </p>
          </div>
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
              id={doc.id}
              title={doc.title}
              uploadDate={new Date(doc.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
              uploader={doc.user_id === user?.id ? "You" : (doc.uploader || "Unknown")}
              course={doc.course || "-"}
              sharedWith={Array.isArray(doc.shared_with) && doc.shared_with.length > 0 ? doc.shared_with : (doc.is_public ? ["Public"] : ["Personal"])}
              priority={doc.priority as 'URGENT' | 'HIGH' | 'ROUTINE' || "ROUTINE"}
              fileType={doc.file_type?.split('/')[1]?.toUpperCase() || 'FILE'}
              storagePath={doc.storage_path}
              isOwner={doc.user_id === user?.id}
              onEdit={() => setEditingDocument(doc)} 
              onDelete={() => setDeletingDocument(doc)}
              content={doc.content}
              language={doc.language}
            />
          </div>
        ))}
      </div>
    </div>
    <EditDocumentModal
        isOpen={!!editingDocument}
        onClose={() => setEditingDocument(null)}
        document={editingDocument}
        onUpdate={(id, updates, file, remove) =>
          updateDocument(id, updates, file, remove)
        }
      />
      <AlertDialog
        open={!!deletingDocument}
        onOpenChange={(open) => !open && setDeletingDocument(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              document "{deletingDocument?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (deletingDocument) deleteDocument(deletingDocument.id, deletingDocument.storage_path);
              setDeletingDocument(null);
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}