import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FileText, Users, Calendar, User } from "lucide-react";

type Priority = "URGENT" | "HIGH" | "ROUTINE";

interface DocumentCardProps {
  title: string;
  uploadDate: string;
  uploader: string;
  department: string;
  sharedWith: string[];
  priority: Priority;
  fileType?: string;
}

const priorityConfig = {
  URGENT: {
    className: "bg-urgent text-urgent-foreground hover:bg-urgent/90",
    label: "URGENT"
  },
  HIGH: {
    className: "bg-high text-high-foreground hover:bg-high/90",
    label: "HIGH"
  },
  ROUTINE: {
    className: "bg-routine text-routine-foreground hover:bg-routine/90",
    label: "ROUTINE"
  }
};

export function DocumentCard({
  title,
  uploadDate,
  uploader,
  department,
  sharedWith,
  priority,
  fileType = "PDF"
}: DocumentCardProps) {
  const config = priorityConfig[priority];
  
  return (
    <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer border border-border/50 hover:border-border">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Priority Badge and File Type */}
          <div className="flex items-center justify-between">
            <Badge className={cn("text-xs font-medium", config.className)}>
              {config.label}
            </Badge>
            <div className="flex items-center gap-1 text-muted-foreground">
              <FileText className="w-3 h-3" />
              <span className="text-xs">{fileType}</span>
            </div>
          </div>

          {/* Document Title */}
          <div>
            <h3 className="font-semibold text-base text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
              {title}
            </h3>
          </div>

          {/* Metadata */}
          <div className="space-y-2 text-sm text-muted-foreground">
            {/* Upload Info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span className="text-xs">{uploadDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span className="text-xs">{uploader}</span>
              </div>
            </div>

            {/* Department and Sharing */}
            <div className="flex flex-col gap-1">
              <div className="text-xs">
                <span className="font-medium">Uploader:</span> {department}
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Users className="w-3 h-3" />
                <span className="font-medium">Shared with:</span> 
                <span className="truncate">{sharedWith.join(", ")}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}