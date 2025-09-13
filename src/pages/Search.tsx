import { useState, useMemo, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Input } from "@/components/ui/input"; 
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DocumentCard } from "@/components/dashboard/DocumentCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search as SearchIcon, Filter, SortAsc, X, Clock, FileText, Users, Building, Languages } from "lucide-react";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Document, useDocuments } from "@/hooks/useDocuments";
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

// No hardcoded documents - all data comes from Supabase

export default function Search() {
  const { documents, loading, deleteDocument, updateDocument } = useDocuments();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("ALL");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("ALL");
  const [selectedVisibility, setSelectedVisibility] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("date");
  const [recentSearches] = useState<string[]>([]);
  const [deletingDocument, setDeletingDocument] = useState<Document | null>(null);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const { profile } = useProfile();
  const { user } = useAuth();

  // Enhanced search with multiple filters
  const filteredDocs = useMemo(() => {
    // Start with documents visible to the user: either they created them, they are public, or they are shared with the user's department.
    let filtered = documents.filter(doc => {
      const isOwner = doc.user_id === user?.id;
      const isSharedWithUserDept = profile?.department && Array.isArray(doc.shared_with) && doc.shared_with.includes(profile.department);
      const isSharedWithUser = user?.id && Array.isArray(doc.shared_with_users) && doc.shared_with_users.includes(user.id);
      
      // A document is accessible if you own it, or it's shared with you or your department.
      return isOwner || isSharedWithUserDept || isSharedWithUser;
    });

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.title?.toLowerCase().includes(query) ||
        doc.description?.toLowerCase().includes(query) ||
        doc.file_name?.toLowerCase().includes(query) ||
        doc.file_type?.toLowerCase().includes(query)
      );
    }

    // Visibility filter
    if (selectedVisibility !== "ALL") {
      const isPublic = selectedVisibility === "Public";
      filtered = filtered.filter(doc => (doc.is_public || false) === isPublic);
    }

    // Priority filter (if documents have priority field)
    if (selectedPriority !== "ALL") {
      filtered = filtered.filter(doc => doc.priority === selectedPriority);
    }

    // Department filter (if documents have department field)
    if (selectedDepartment !== "ALL") {
      filtered = filtered.filter(doc => 
        (doc.department?.toLowerCase() === selectedDepartment.toLowerCase()) ||
        (Array.isArray(doc.shared_with) && doc.shared_with.some(dept => dept.toLowerCase() === selectedDepartment.toLowerCase()))
      );
    }

    // Language filter
    if (selectedLanguage !== "ALL") {
      filtered = filtered.filter(doc => doc.language === selectedLanguage);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return (a.title || "").localeCompare(b.title || "");
        case "priority":
          const priorityOrder = { "URGENT": 3, "HIGH": 2, "ROUTINE": 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case "date":
        default:
          return new Date(b.created_at || b.uploadDate || 0).getTime() - new Date(a.created_at || a.uploadDate || 0).getTime();
      }
    });

    return filtered;
  }, [documents, searchQuery, selectedPriority, selectedDepartment, selectedLanguage, selectedVisibility, sortBy, user, profile]);

  const clearAllFilters = () => {
    setSelectedPriority("ALL");
    setSearchQuery("");
    setSelectedDepartment("ALL");
    setSelectedLanguage("ALL");
    setSelectedVisibility("ALL");
    setSortBy("date");
  };

  const departments = ["ALL", "Safety & Operations", "Finance Department", "Engineering", "Customer Relations", "Technical Services", "Safety & Security"];
  const priorities = ["ALL", "URGENT", "HIGH", "ROUTINE"];
  const visibilities = ["ALL", "Public", "Private"];
  const languages = ["ALL", "english", "hindi", "malayalam"];
  const sortOptions = [
    { value: "date", label: "Date" },
    { value: "title", label: "Title" },
    { value: "priority", label: "Priority" }
  ];

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <DashboardSidebar />
      </Sidebar>
      <SidebarInset>
        
        {/* Enhanced Search Header */}
        <div className="bg-gradient-to-r from-card to-card/80 border-b border-border/50 p-6">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="md:hidden">
                <SidebarTrigger />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Advanced Search</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Search and filter through {documents.length} documents across all departments
            </p>
          </div>

          <div className="relative mb-4">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="search-input"
              name="search"
              placeholder="Search by keywords, title, content, department, or uploader..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
              className="pl-12 h-14 text-base bg-background/80 backdrop-blur-sm border-2 border-border/50 focus:border-primary/50 transition-all duration-200"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0"
                onClick={() => setSearchQuery("")}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
            <div className="flex items-center gap-3 flex-wrap mt-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 h-10">
                    <Filter className="w-4 h-4" />
                    Priority: {selectedPriority}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {priorities.map(priority => (
                    <DropdownMenuItem key={priority} onClick={() => setSelectedPriority(priority)}>
                      {priority}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 h-10">
                    <Users className="w-4 h-4" />
                    Visibility: {selectedVisibility}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {visibilities.map(visibility => (
                    <DropdownMenuItem key={visibility} onClick={() => setSelectedVisibility(visibility)}>
                      {visibility}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 h-10">
                    <Languages className="w-4 h-4" />
                    Language: {selectedLanguage === "ALL" ? "All" : <span className="capitalize">{selectedLanguage}</span>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {languages.map(lang => (
                    <DropdownMenuItem key={lang} onClick={() => setSelectedLanguage(lang)}>
                      <span className="capitalize">{lang}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 h-10">
                    <Building className="w-4 h-4" />
                    Department: {selectedDepartment === "ALL" ? "All" : selectedDepartment}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-w-xs">
                  {departments.map(dept => (
                    <DropdownMenuItem key={dept} onClick={() => setSelectedDepartment(dept)}>
                      {dept}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 h-10">
                    <SortAsc className="w-4 h-4" />
                    Sort by: {sortOptions.find(opt => opt.value === sortBy)?.label}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {sortOptions.map(option => (
                    <DropdownMenuItem key={option.value} onClick={() => setSortBy(option.value)}>
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {(searchQuery || selectedPriority !== "ALL" || selectedDepartment !== "ALL" || selectedLanguage !== "ALL" || sortBy !== "date" || selectedVisibility !== "ALL") && (
                <Button variant="ghost" onClick={clearAllFilters} className="gap-2 text-muted-foreground">
                  <X className="w-4 h-4" />
                  Clear All
                </Button>
              )}
            </div>

            {/* Search Results Summary */}
            {(searchQuery || selectedPriority !== "ALL" || selectedDepartment !== "ALL" || selectedLanguage !== "ALL" || selectedVisibility !== "ALL") && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">
                        Found {filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {searchQuery && `Matching "${searchQuery}"`}
                        {selectedPriority !== "ALL" && ` • ${selectedPriority} priority`}
                        {selectedDepartment !== "ALL" && ` • ${selectedDepartment}`}
                        {selectedVisibility !== "ALL" && ` • ${selectedVisibility} documents`}
                        {selectedLanguage !== "ALL" && ` • ${selectedLanguage} language`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
        </div>

        {/* Enhanced Search Results */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-in fade-in-0 zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <SearchIcon className="w-10 h-10 text-muted-foreground animate-spin" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Loading documents...</h3>
                <p className="text-muted-foreground">Fetching data from Supabase</p>
              </div>
            </div>
          ) : filteredDocs.length > 0 ? (
            <div className="space-y-6">
              {/* Results Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  Search Results ({filteredDocs.length})
                </h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>Showing results from all accessible departments</span>
                </div>
              </div>

              {/* Documents Grid */}
              <div className="grid gap-6">
                {filteredDocs.map((doc, index) => (
                  <div key={doc.id || index} className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300" style={{animationDelay: `${index * 100}ms`}}>
                    <DocumentCard
                      id={doc.id}
                      title={doc.title || doc.file_name || "Untitled"}
                      uploadDate={doc.created_at ? new Date(doc.created_at).toLocaleDateString() : "Unknown"}
                      uploader={doc.uploader || "Unknown"}
                      department={doc.department || "Unknown"}
                      sharedWith={Array.isArray(doc.shared_with) && doc.shared_with.length > 0 ? doc.shared_with : (doc.is_public ? ["Public"] : ["Personal"])}
                      priority={doc.priority || "ROUTINE"}
                      fileType={doc.file_type || "Unknown"}
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
          ) : (
            <div className="text-center py-20">
              <div className="animate-in fade-in-0 zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <SearchIcon className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">No documents found</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  We couldn't find any documents matching your search criteria. Try adjusting your filters or search terms.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" onClick={clearAllFilters}>
                    Clear all filters
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
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
    </SidebarProvider>
  );
}