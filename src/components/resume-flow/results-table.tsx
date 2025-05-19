
"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { EnrichedScreeningResult } from "@/lib/types";
import { ThumbsUp, ThumbsDown, FileSignature, Lightbulb, MessagesSquare } from "lucide-react";

interface ResultsTableProps {
  results: EnrichedScreeningResult[];
  selectedIds: Set<string>;
  onSelectionChange: (id: string, checked: boolean) => void;
  onSummarize: (result: EnrichedScreeningResult) => void;
  onSkillGap: (result: EnrichedScreeningResult) => void;
  onInterviewQuestions: (result: EnrichedScreeningResult) => void;
}

export function ResultsTable({ 
  results, 
  selectedIds,
  onSelectionChange,
  onSummarize,
  onSkillGap,
  onInterviewQuestions
}: ResultsTableProps) {
  if (results.length === 0) {
    return <p className="text-muted-foreground text-center py-4">No screening results to display yet.</p>;
  }

  const handleSelectAll = (checked: boolean) => {
    results.forEach(result => onSelectionChange(result.originalResumeId, checked));
  };
  
  const areAllSelected = results.length > 0 && results.every(r => selectedIds.has(r.originalResumeId));


  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox 
                checked={areAllSelected}
                onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                aria-label="Select all resumes"
              />
            </TableHead>
            <TableHead className="w-[200px]">Filename</TableHead>
            <TableHead className="w-[120px]">Match</TableHead>
            <TableHead>Screening Summary</TableHead>
            <TableHead className="w-[300px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result) => (
            <TableRow key={result.originalResumeId} data-state={selectedIds.has(result.originalResumeId) ? "selected" : ""}>
              <TableCell>
                <Checkbox 
                  checked={selectedIds.has(result.originalResumeId)}
                  onCheckedChange={(checked) => onSelectionChange(result.originalResumeId, Boolean(checked))}
                  aria-label={`Select ${result.filename}`}
                />
              </TableCell>
              <TableCell className="font-medium truncate max-w-[200px]">{result.filename}</TableCell>
              <TableCell>
                <Badge variant={result.match ? "default" : "destructive"} className="items-center gap-1">
                  {result.match ? 
                    <ThumbsUp className="h-3 w-3" /> : 
                    <ThumbsDown className="h-3 w-3" />}
                  {result.match ? "Match" : "No Match"}
                </Badge>
              </TableCell>
              <TableCell className="whitespace-normal min-w-[300px]">{result.summary}</TableCell>
              <TableCell className="text-right space-x-1">
                {result.resumeTextContent ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSummarize(result)}
                      className="text-xs"
                      title="Summarize Resume"
                    >
                      <FileSignature className="h-3.5 w-3.5 mr-1" />
                      Summary
                    </Button>
                     <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSkillGap(result)}
                      className="text-xs"
                      title="Skill Gap Analysis"
                    >
                      <Lightbulb className="h-3.5 w-3.5 mr-1" />
                      Skill Gap
                    </Button>
                     <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onInterviewQuestions(result)}
                      className="text-xs"
                      title="Generate Interview Questions"
                    >
                      <MessagesSquare className="h-3.5 w-3.5 mr-1" />
                      Questions
                    </Button>
                  </>
                ) : (
                   <span className="text-xs text-muted-foreground italic">Actions N/A (No .txt)</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
