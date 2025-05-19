
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";

interface SaveTemplateDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (templateName: string) => void;
}

export function SaveTemplateDialog({
  isOpen,
  onOpenChange,
  onSave,
}: SaveTemplateDialogProps) {
  const [templateName, setTemplateName] = useState("");

  const handleSave = () => {
    if (!templateName.trim()) {
      alert("Template name cannot be empty."); // Or use toast
      return;
    }
    onSave(templateName);
    setTemplateName(""); // Reset for next time
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) setTemplateName(""); // Reset on close
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5 text-primary" />
            Save Screening Criteria
          </DialogTitle>
          <DialogDescription>
            Enter a name for this screening criteria template.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <Label htmlFor="template-name">Template Name</Label>
          <Input
            id="template-name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="e.g., Senior Developer Template"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!templateName.trim()}>
            <Save className="mr-2 h-4 w-4" />
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
