
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SavedScreeningTemplate } from "@/lib/types";
import { BookOpenCheck, Trash2 } from "lucide-react";

interface LoadTemplateDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  templates: SavedScreeningTemplate[];
  onLoad: (templateId: string) => void;
  onDelete: (templateId: string) => void;
}

export function LoadTemplateDialog({
  isOpen,
  onOpenChange,
  templates,
  onLoad,
  onDelete,
}: LoadTemplateDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpenCheck className="h-5 w-5 text-primary" />
            Load Screening Criteria Template
          </DialogTitle>
          <DialogDescription>
            Select a saved template to apply its criteria.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {templates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center">No saved templates yet.</p>
          ) : (
            <ScrollArea className="h-[200px] border rounded-md p-2">
              <ul className="space-y-2">
                {templates.map((template) => (
                  <li key={template.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                    <span className="text-sm">{template.name}</span>
                    <div className="flex items-center gap-2">
                       <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onLoad(template.id)}
                        aria-label={`Load ${template.name}`}
                      >
                        Load
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive/80"
                        onClick={() => onDelete(template.id)}
                        aria-label={`Delete ${template.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
