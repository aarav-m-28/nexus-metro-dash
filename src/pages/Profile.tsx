import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { AIChatFAB } from "@/components/ai/AIChatFAB";
import { AnimatedBackground } from "@/components/ui/animated-background";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Building2, AlertTriangle, FileUp, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Document, useDocuments } from "@/hooks/useDocuments";
import { SelectDocumentToShareModal } from "@/components/share/SelectDocumentToShareModal";
import { ShareDocumentModal } from "@/components/share/ShareDocumentModal";
import { FileUploadModal } from "@/components/upload/FileUploadModal";

interface ProfileData {
  id: string;
  user_id: string;
  display_name: string;
  email: string;
  department: string;
  job_title: string;
  avatar_url: string;
}

const ProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [isSelectDocModalOpen, setSelectDocModalOpen] = useState(false);
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [documentToShare, setDocumentToShare] = useState<Document | null>(null);

  const { documents: allDocuments } = useDocuments();
  const myDocuments = useMemo(() => allDocuments.filter(doc => doc.user_id === user?.id), [allDocuments, user]);

  const handleSelectDocument = (doc: Document) => {
    setDocumentToShare(doc);
    setSelectDocModalOpen(false);
    setShareModalOpen(true);
  };
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setError("No user ID provided.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error: dbError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (dbError) {
        console.error("Error fetching profile:", dbError);
        setError("Could not find a profile for this user.");
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [userId]);

  return (
    <SidebarProvider>
      <AnimatedBackground />
      <Sidebar collapsible="icon">
        <DashboardSidebar />
      </Sidebar>
      <SidebarInset>
        <div className="bg-card/80 backdrop-blur-sm border-b border-border/50 p-6 animate-fade-in-0 sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <div className="md:hidden">
                    <SidebarTrigger />
                </div>
                <h1 className="text-2xl font-bold text-foreground">User Profile</h1>
            </div>
        </div>
        <div className="p-6">
          {loading && (
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 mt-4">
                <div className="flex items-center gap-3"><Skeleton className="h-5 w-5 rounded-full" /><Skeleton className="h-5 w-64" /></div>
                <div className="flex items-center gap-3"><Skeleton className="h-5 w-5 rounded-full" /><Skeleton className="h-5 w-48" /></div>
              </CardContent>
            </Card>
          )}
          {error && (
            <Card className="border-destructive"><CardHeader><CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle /> Error</CardTitle><CardDescription>{error}</CardDescription></CardHeader></Card>
          )}
          {profile && (
            <Card className="animate-fade-in-0">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 border-2 border-primary">
                      <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
                      <AvatarFallback className="text-2xl">{profile.display_name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-3xl">{profile.display_name}</CardTitle>
                      <CardDescription className="text-md">{profile.job_title || 'No title specified'}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setSelectDocModalOpen(true)} className="gap-2">
                      <FileUp className="w-4 h-4" /> Share Document
                    </Button>
                    <Button type="button" onClick={() => setUploadOpen(true)} className="gap-2">
                      <Upload className="w-4 h-4" /> Upload Document
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 mt-4">
                <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-muted-foreground" /><span>{profile.email}</span></div>
                <div className="flex items-center gap-3"><Building2 className="w-5 h-5 text-muted-foreground" /><span>{profile.department || 'No department specified'}</span></div>
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
      <FileUploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} />
      <SelectDocumentToShareModal
        isOpen={isSelectDocModalOpen}
        onClose={() => setSelectDocModalOpen(false)}
        documents={myDocuments}
        onSelect={handleSelectDocument}
      />
      {documentToShare && profile && (
        <ShareDocumentModal
          isOpen={isShareModalOpen}
          onClose={() => setShareModalOpen(false)}
          documentId={documentToShare.id}
          documentTitle={documentToShare.title}
          preselectedUser={profile}
        />
      )}
      <AIChatFAB />
    </SidebarProvider>
  );
};

export default ProfilePage;