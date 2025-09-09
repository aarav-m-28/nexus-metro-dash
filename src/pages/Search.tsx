import { useState, useMemo, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Drawer, DrawerTrigger, DrawerContent } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DocumentCard } from "@/components/dashboard/DocumentCard";
import { Card } from "@/components/ui/card";
import { Search as SearchIcon, Filter, SortAsc, X, Clock, FileText, Users, Building } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// No hardcoded documents - all data comes from Supabase

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("date");
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentSearches] = useState<string[]>([]);
  const { user } = useAuth();

  // Fetch documents from Supabase
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching documents:', error);
          setDocuments([]);
        } else {
          setDocuments(data || []);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [user]);

  // Enhanced search with multiple filters
  const filteredDocs = useMemo(() => {
    let filtered = documents;

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

    // Priority filter (if documents have priority field)
    if (selectedPriority !== "ALL") {
      filtered = filtered.filter(doc => doc.priority === selectedPriority);
    }

    // Department filter (if documents have department field)
    if (selectedDepartment !== "ALL") {
      filtered = filtered.filter(doc => 
        doc.department?.toLowerCase().includes(selectedDepartment.toLowerCase()) ||
        doc.sharedWith?.some(dept => dept.toLowerCase().includes(selectedDepartment.toLowerCase()))
      );
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
  }, [documents, searchQuery, selectedPriority, selectedDepartment, sortBy]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedPriority("ALL");
    setSelectedDepartment("ALL");
    setSortBy("date");
  };

  const departments = ["ALL", "Safety & Operations", "Finance Department", "Engineering", "Customer Relations", "Technical Services", "Safety & Security"];
  const priorities = ["ALL", "URGENT", "HIGH", "ROUTINE"];
  const sortOptions = [
    { value: "date", label: "Date" },
    { value: "title", label: "Title" },
    { value: "priority", label: "Priority" }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sliding Sidebar for Search */}
      <div className="block md:hidden">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" className="m-4">Open Sidebar</Button>
          </DrawerTrigger>
          <DrawerContent className="max-w-xs w-full">
            <DashboardSidebar />
          </DrawerContent>
        </Drawer>
      </div>
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>
      <main className="flex-1 overflow-y-auto">
        {/* Enhanced Search Header */}
        <div className="bg-gradient-to-r from-card to-card/80 border-b border-border/50 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Advanced Search</h1>
            <p className="text-sm text-muted-foreground">
              Intelligent search through {documents.length} documents across all departments
            </p>
          </div>

          {/* Enhanced Search Interface */}
          <div className="space-y-6">
            {/* Main Search Bar */}
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="search-input"
                name="search"
                placeholder="Search by keywords, title, content, department, or uploader..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                autoComplete="off"
                className="pl-12 h-14 text-base bg-background/80 backdrop-blur-sm border-2 border-border/50 focus:border-primary/50 transition-all duration-200"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0"
                  onClick={() => handleSearch("")}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Filter and Sort Controls */}
            <div className="flex items-center gap-3 flex-wrap">
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

              {(searchQuery || selectedPriority !== "ALL" || selectedDepartment !== "ALL" || sortBy !== "date") && (
                <Button variant="ghost" onClick={clearAllFilters} className="gap-2 text-muted-foreground">
                  <X className="w-4 h-4" />
                  Clear All
                </Button>
              )}
            </div>

            {/* Quick Search Suggestions */}
            {!searchQuery && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Recent searches:</p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, idx) => (
                    <Button
                      key={idx}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuickSearch(search)}
                      className="gap-2 text-xs bg-muted/50 hover:bg-muted"
                    >
                      <Clock className="w-3 h-3" />
                      {search}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results Summary */}
            {(searchQuery || selectedPriority !== "ALL" || selectedDepartment !== "ALL") && (
              <Card className="p-4 bg-primary/5 border-primary/20">
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
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
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
                      title={doc.title || doc.file_name || "Untitled"}
                      uploadDate={doc.created_at ? new Date(doc.created_at).toLocaleDateString() : "Unknown"}
                      uploader={doc.uploader || "Unknown"}
                      department={doc.department || "Unknown"}
                      sharedWith={doc.sharedWith || []}
                      priority={doc.priority || "ROUTINE"}
                      fileType={doc.file_type || "Unknown"}
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
                  <Button onClick={() => handleQuickSearch("safety")}>
                    Search "safety"
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}