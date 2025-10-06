import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Document {
  id: string;
  title: string;
  description: string | null;
  file_name: string;
  file_size: number | null;
  file_type: string | null;
  storage_path: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  user_id?: string;
  course?: string;
  category?: string;
  content?: string;
  language?: string;
  shared_with?: string[];
  subject?: string;
  year?: string;
  target_role?: string;
  section?: string;
}

export type DocumentUpdatePayload = Partial<
  Pick<
    Document,
    | "title"
    | "description"
    | "course"
    | "category"
    | "content"
    | "language"
    | "shared_with"
    | "subject"
    | "year"
    | "target_role"
    | "section"
  >
>;

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchDocuments = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  // Accepts extra metadata fields
  const uploadDocument = async (
    file: File | null,
    title: string,
    description?: string,
    course?: string,
    category?: string,
    sharedWith?: string[],
    is_public?: boolean,
    language?: string,
    subject?: string,
    year?: string,
    target_role?: string,
    section?: string,
    content?: string
  ) => {
    if (!user) return null;

    try {
      let filePath = null;
      let fileName = null;
      let fileSize = null;
      let fileType = null;

      if (file) {
        // Upload file to storage
        const fileExt = file.name.split('.').pop();
        filePath = `${user.id}/${Date.now()}.${fileExt}`;
        fileName = file.name;
        fileSize = file.size;
        fileType = file.type;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;
      }

      // Create document record with extra fields
      const { data, error: insertError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          title: title,
          description,
          course,
          category,
          shared_with: sharedWith, 
          file_name: fileName,
          file_size: fileSize,
          file_type: fileType,
          storage_path: filePath, 
          is_public: is_public || false,
          language: language,
          subject: subject,
          year: year,
          target_role: target_role,
          section: section,
          content: content,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Document uploaded successfully"
      });

      fetchDocuments();
      return true;
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateDocument = async (
    documentId: string,
    updates: DocumentUpdatePayload,
    newFile?: File | null,
    removeFile?: boolean
  ) => {
    if (!user) return false;

    try {
      let finalUpdates: Partial<Document> = { ...updates };

      // If a new file is provided, handle file replacement
      if (newFile) {
        // 1. Get the old file path to delete it later
        const { data: currentDoc } = await supabase
          .from("documents")
          .select("storage_path")
          .eq("id", documentId)
          .single();

        // 2. Upload the new file
        const fileExt = newFile.name.split(".").pop();
        const newFilePath = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(newFilePath, newFile);
        if (uploadError) throw uploadError;

        // 3. Add new file info to the updates
        finalUpdates = {
          ...finalUpdates,
          storage_path: newFilePath,
          file_name: newFile.name,
          file_size: newFile.size,
          file_type: newFile.type,
        };

        // 4. Delete the old file from storage
        if (currentDoc?.storage_path) {
          await supabase.storage.from("documents").remove([currentDoc.storage_path]);
        }
      } else if (removeFile) {
        // Handle file removal
        const { data: currentDoc } = await supabase
          .from("documents")
          .select("storage_path")
          .eq("id", documentId)
          .single();

        if (currentDoc?.storage_path) {
          await supabase.storage.from("documents").remove([currentDoc.storage_path]);
        }

        finalUpdates = { ...finalUpdates, storage_path: null, file_name: null, file_size: null, file_type: null };
      }

      const { error } = await supabase
        .from("documents")
        .update(finalUpdates)
        .eq("id", documentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document updated successfully",
      });

      fetchDocuments(); // Refetch to show updated data
      return true;
    } catch (error) {
      console.error("Error updating document:", error);
      toast({
        title: "Error",
        description: "Failed to update document",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteDocument = async (documentId: string, storagePath?: string | null) => {
    try {
      // Delete from storage if path exists
      if (storagePath) {
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([storagePath]);
        
        if (storageError) console.warn('Storage deletion error:', storageError);
      }

      // Delete document record
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document deleted successfully"
      });

      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive"
      });
    }
  };

  return {
    documents,
    loading,
    uploadDocument,
    updateDocument,
    deleteDocument,
    refetch: fetchDocuments,
  };
}