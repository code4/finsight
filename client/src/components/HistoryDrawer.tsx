import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, Calendar, ExternalLink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HistoryEntry {
  id: string;
  question: string;
  timestamp: string;
  accounts: string[];
  timeframe: string;
  isStale?: boolean;
}

interface HistoryDrawerProps {
  entries?: HistoryEntry[];
  onEntryClick?: (entry: HistoryEntry) => void;
}

// todo: remove mock functionality
const mockEntries: HistoryEntry[] = [
  {
    id: "1",
    question: "What's the YTD performance vs S&P 500?",
    timestamp: "2024-12-10 14:30",
    accounts: ["Growth Portfolio", "Conservative Fund"],
    timeframe: "YTD"
  },
  {
    id: "2", 
    question: "Show me the top 10 holdings by weight",
    timestamp: "2024-12-10 13:15",
    accounts: ["Growth Portfolio"],
    timeframe: "Current",
    isStale: true
  },
  {
    id: "3",
    question: "What's the portfolio's beta and volatility?",
    timestamp: "2024-12-10 11:45", 
    accounts: ["Conservative Fund"],
    timeframe: "1Y"
  }
];

export default function HistoryDrawer({ 
  entries = mockEntries,
  onEntryClick 
}: HistoryDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleEntryClick = (entry: HistoryEntry) => {
    onEntryClick?.(entry);
    console.log('History entry clicked:', entry.question);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" data-testid="button-history-trigger">
          <History className="h-4 w-4 mr-2" />
          History
        </Button>
      </SheetTrigger>
      <SheetContent className="w-96">
        <SheetHeader>
          <SheetTitle>Query History</SheetTitle>
          <SheetDescription>
            Past questions with context snapshots and auditability
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="h-full mt-6">
          <div className="space-y-4">
            {entries.map((entry) => (
              <div 
                key={entry.id}
                className="p-3 rounded-md border border-border hover-elevate cursor-pointer"
                onClick={() => handleEntryClick(entry)}
                data-testid={`history-entry-${entry.id}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium line-clamp-2">
                    {entry.question}
                  </h4>
                  <ExternalLink className="h-3 w-3 text-muted-foreground ml-2 flex-shrink-0" />
                </div>
                
                <div className="flex items-center gap-1 mb-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {entry.timestamp}
                  {entry.isStale && (
                    <Badge variant="destructive" className="ml-1 text-xs h-4">
                      Stale
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {entry.accounts.map((account, index) => (
                    <Badge key={index} variant="outline" className="text-xs h-4">
                      {account}
                    </Badge>
                  ))}
                  <Badge variant="secondary" className="text-xs h-4">
                    {entry.timeframe}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}