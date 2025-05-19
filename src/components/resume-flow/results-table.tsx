
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { EnrichedScreeningResult } from "@/lib/types";
import { ThumbsUp, ThumbsDown, FileSignature } from "lucide-react";

interface ResultsTableProps {
  results: EnrichedScreeningResult[];
  onSummarize: (result: EnrichedScreeningResult) => void;
}

export function ResultsTable({ results, onSummarize }: ResultsTableProps) {
  if (results.length === 0) {
    return <p className="text-muted-foreground text-center py-4">No screening results to display yet.</p>;
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Filename</TableHead>
            <TableHead className="w-[100px]">Match</TableHead>
            <TableHead>Screening Summary</TableHead>
            <TableHead className="w-[150px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result) => (
            <TableRow key={result.originalResumeId}>
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
              <TableCell className="text-right">
                {result.resumeTextContent && ( // Only show summarize if text content is available
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSummarize(result)}
                    className="flex items-center gap-1.5"
                  >
                    <FileSignature className="h-4 w-4" />
                    Summarize
                  </Button>
                )}
                 {!result.resumeTextContent && (
                   <span className="text-xs text-muted-foreground italic">Summarize N/A (No .txt)</span>
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
