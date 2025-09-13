import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Share2, Copy, Mail, Link, Users, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
}

const departments = [
  "Finance Department",
  "Safety & Operations", 
  "Engineering",
  "Customer Relations",
  "Technical Services",
  "Safety & Security",
  "Management",
  "Human Resources"
];

const accessLevels = [
  { value: "view", label: "View Only", description: "Can view and download" },
  { value: "comment", label: "Comment", description: "Can view, download, and comment" },
  { value: "edit", label: "Edit", description: "Can view, download, comment, and edit" }
];

export function ShareDocumentModal({ isOpen, onClose, documentTitle }: ShareDocumentModalProps) {
  const [shareMethod, setShareMethod] = useState<"internal" | "external">("internal");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [externalEmails, setExternalEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [accessLevel, setAccessLevel] = useState("view");
  const [message, setMessage] = useState("");
  const [expireAfter, setExpireAfter] = useState("");
  const [requirePassword, setRequirePassword] = useState(false);
  const [allowDownload, setAllowDownload] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const { toast } = useToast();

  const handleAddDepartment = (dept: string) => {
    if (!selectedDepartments.includes(dept)) {
      setSelectedDepartments(prev => [...prev, dept]);
    }
  };

  const handleRemoveDepartment = (dept: string) => {
    setSelectedDepartments(prev => prev.filter(d => d !== dept));
  };

  const handleAddEmail = () => {
    const email = emailInput.trim();
    if (email && email.includes('@') && !externalEmails.includes(email)) {
      setExternalEmails(prev => [...prev, email]);
      setEmailInput("");
    }
  };

  const handleRemoveEmail = (email: string) => {
    setExternalEmails(prev => prev.filter(e => e !== email));
  };

  const generateShareLink = () => {
    const baseUrl = window.location.origin;
    const docId = documentTitle.toLowerCase().replace(/\s+/g, '-');
    return `${baseUrl}/shared/${docId}?access=${accessLevel}&expires=${expireAfter}`;
  };

  const handleShare = async () => {
    if (shareMethod === "internal" && selectedDepartments.length === 0) {
      toast({
        title: "Select departments",
        description: "Please select at least one department to share with",
        variant: "destructive"
      });
      return;
    }

    if (shareMethod === "external" && externalEmails.length === 0) {
      toast({
        title: "Add email addresses",
        description: "Please add at least one email address",
        variant: "destructive"
      });
      return;
    }

    setIsSharing(true);
    
    try {
      // Simulate sharing process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const link = generateShareLink();
      setShareLink(link);
      
      toast({
        title: "Document shared successfully",
        description: `${documentTitle} has been shared with the selected recipients`,
      });
    } catch (error) {
      toast({
        title: "Sharing failed",
        description: "There was an error sharing the document",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  const copyShareLink = async () => {
    if (shareLink) {
      await navigator.clipboard.writeText(shareLink);
      toast({
        title: "Link copied",
        description: "Share link has been copied to clipboard",
      });
    }
  };

  const handleClose = () => {
    setSelectedDepartments([]);
    setExternalEmails([]);
    setEmailInput("");
    setMessage("");
    setShareLink("");
    setIsSharing(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Document
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Sharing: <span className="font-medium">{documentTitle}</span>
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Share Method */}
          <div className="space-y-3">
            <Label>Share Method</Label>
            <div className="flex gap-4">
              <Button
                variant={shareMethod === "internal" ? "default" : "outline"}
                onClick={() => setShareMethod("internal")}
                className={`flex-1 gap-2 transition-all duration-200 ${shareMethod === 'internal' ? 'ring-2 ring-primary/50 ring-offset-2 ring-offset-background shadow-lg shadow-primary/20' : ''}`}
              >
                <Users className="w-4 h-4" />
                Internal (Departments)
              </Button>
              <Button
                variant={shareMethod === "external" ? "default" : "outline"}
                onClick={() => setShareMethod("external")}
                className={`flex-1 gap-2 transition-all duration-200 ${shareMethod === 'external' ? 'ring-2 ring-primary/50 ring-offset-2 ring-offset-background shadow-lg shadow-primary/20' : ''}`}
              >
                <Mail className="w-4 h-4" />
                External (Email)
              </Button>
            </div>
          </div>

          {/* Internal Sharing */}
          {shareMethod === "internal" && (
            <div className="space-y-3">
              <Label>Select Departments</Label>
              <Select onValueChange={handleAddDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Add departments to share with" />
                </SelectTrigger>
                <SelectContent>
                  {departments
                    .filter(dept => !selectedDepartments.includes(dept))
                    .map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
              
              {selectedDepartments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedDepartments.map((dept) => (
                    <Badge key={dept} variant="secondary" className="gap-1">
                      {dept}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleRemoveDepartment(dept)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* External Sharing */}
          {shareMethod === "external" && (
            <div className="space-y-3">
              <Label>Email Addresses</Label>
              <div className="flex gap-2">
                <Input
                  id="share-email-input"
                  name="email"
                  autoComplete="email"
                  placeholder="Enter email address"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
                />
                <Button onClick={handleAddEmail} disabled={!emailInput.trim()}>
                  Add
                </Button>
              </div>
              
              {externalEmails.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {externalEmails.map((email) => (
                    <Badge key={email} variant="secondary" className="gap-1">
                      {email}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleRemoveEmail(email)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Access Level */}
          <div className="space-y-2">
            <Label>Access Level</Label>
            <Select value={accessLevel} onValueChange={setAccessLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accessLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div>
                      <div className="font-medium">{level.label}</div>
                      <div className="text-xs text-muted-foreground">{level.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Settings */}
          <div className="space-y-4">
            <Label>Additional Settings</Label>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allow-download">Allow Download</Label>
                  <p className="text-xs text-muted-foreground">Recipients can download the document</p>
                </div>
                <Switch
                  id="allow-download"
                  checked={allowDownload}
                  onCheckedChange={setAllowDownload}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="require-password">Require Password</Label>
                  <p className="text-xs text-muted-foreground">Recipients need a password to access</p>
                </div>
                <Switch
                  id="require-password"
                  checked={requirePassword}
                  onCheckedChange={setRequirePassword}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expire-after">Link Expires After</Label>
              <Select value={expireAfter} onValueChange={setExpireAfter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select expiration time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1day">1 Day</SelectItem>
                  <SelectItem value="3days">3 Days</SelectItem>
                  <SelectItem value="1week">1 Week</SelectItem>
                  <SelectItem value="2weeks">2 Weeks</SelectItem>
                  <SelectItem value="1month">1 Month</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message for the recipients"
              rows={3}
            />
          </div>

          {/* Share Link Display */}
          {shareLink && (
            <div className="space-y-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input value={shareLink} readOnly className="font-mono text-xs" />
                <Button variant="outline" onClick={copyShareLink} className="gap-2">
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isSharing}>
            Cancel
          </Button>
          <Button onClick={handleShare} disabled={isSharing} className="gap-2">
            {isSharing ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Sharing...
              </>
            ) : shareLink ? (
              <>
                <Check className="w-4 h-4" />
                Shared
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Share Document
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}