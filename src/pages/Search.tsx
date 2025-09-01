import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DocumentCard } from "@/components/dashboard/DocumentCard";
import { Search as SearchIcon, Filter, SortAsc } from "lucide-react";

// Extended sample documents with search-friendly content
const allDocuments = [
  {
    title: "Safety Protocol Amendment - Metro Line 1 Operations Manual",
    uploadDate: "Dec 15, 2024",
    uploader: "Raj Kumar",
    department: "Safety & Operations",
    sharedWith: ["Engineering", "Operations", "Finance"],
    priority: "URGENT" as const,
    fileType: "PDF",
    content: "safety emergency protocol operations manual metro line evacuation procedures"
  },
  {
    title: "Q4 2024 Financial Performance Analysis and Budget Variance Report",
    uploadDate: "Dec 14, 2024", 
    uploader: "Priya Nair",
    department: "Finance Department",
    sharedWith: ["Management", "Board"],
    priority: "HIGH" as const,
    fileType: "XLSX",
    content: "financial budget variance analysis revenue expenses quarterly report"
  },
  {
    title: "Infrastructure Maintenance Schedule - January 2025",
    uploadDate: "Dec 13, 2024",
    uploader: "Arun Menon",
    department: "Engineering",
    sharedWith: ["Operations", "Maintenance"],
    priority: "ROUTINE" as const,
    fileType: "PDF",
    content: "infrastructure maintenance schedule railway tracks electrical systems"
  },
  {
    title: "Passenger Feedback Analysis Report - November 2024",
    uploadDate: "Dec 12, 2024",
    uploader: "Sita Devi",
    department: "Customer Relations",
    sharedWith: ["Management", "Operations"],
    priority: "ROUTINE" as const,
    fileType: "DOCX",
    content: "passenger feedback customer satisfaction survey analysis complaints"
  },
  {
    title: "Energy Consumption Optimization Study - Phase 2 Results",
    uploadDate: "Dec 11, 2024",
    uploader: "Dr. Kumar",
    department: "Technical Services",
    sharedWith: ["Engineering", "Finance"],
    priority: "HIGH" as const,
    fileType: "PDF",
    content: "energy consumption optimization electricity power efficiency metro"
  },
  {
    title: "Emergency Response Drill Report - December 2024",
    uploadDate: "Dec 10, 2024",
    uploader: "Security Team",
    department: "Safety & Security",
    sharedWith: ["All Departments"],
    priority: "URGENT" as const,
    fileType: "PDF",
    content: "emergency response drill safety security evacuation training"
  }
];

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDocs, setFilteredDocs] = useState(allDocuments);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredDocs(allDocuments);
      return;
    }

    const filtered = allDocuments.filter(doc => 
      doc.title.toLowerCase().includes(query.toLowerCase()) ||
      doc.content.toLowerCase().includes(query.toLowerCase()) ||
      doc.department.toLowerCase().includes(query.toLowerCase()) ||
      doc.uploader.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredDocs(filtered);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      
      <div className="flex-1 ml-60">
        {/* Search Header */}
        <div className="bg-card border-b border-border/50 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Advanced Search</h1>
            <p className="text-sm text-muted-foreground">
              Search through {allDocuments.length} documents across all departments
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <div className="space-y-4">
            <div className="relative flex gap-3">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, content, department, or uploader..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
              <Button variant="outline" size="lg" className="gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <SortAsc className="w-4 h-4" />
                Sort
              </Button>
            </div>

            {/* Search Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {searchQuery && (
                  <Badge variant="secondary" className="text-xs">
                    "{searchQuery}" - {filteredDocs.length} results
                  </Badge>
                )}
              </div>
              
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleSearch("")}
                  className="text-muted-foreground"
                >
                  Clear search
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="p-6">
          {filteredDocs.length > 0 ? (
            <div className="grid gap-4">
              {filteredDocs.map((doc, index) => (
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
          ) : (
            <div className="text-center py-12">
              <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No documents found</h3>
              <p className="text-muted-foreground">
                Try searching with different keywords or check your spelling.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}