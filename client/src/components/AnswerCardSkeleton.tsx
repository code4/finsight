import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Loader2, Clock } from "lucide-react";

interface AnswerCardSkeletonProps {
  loadingStage?: string;
  loadingProgress?: number;
  estimatedTime?: number;
  selectedAccounts?: Array<{
    id: string;
    name: string;
    alias?: string;
    accountNumber: string;
  }>;
  timeframe?: string;
}

export default function AnswerCardSkeleton({ 
  loadingStage = "Analyzing portfolio data...",
  loadingProgress = 0,
  estimatedTime = 0,
  selectedAccounts = [],
  timeframe = "YTD"
}: AnswerCardSkeletonProps) {
  return (
    <Card className="mb-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Question skeleton */}
            <Skeleton className="h-6 w-4/5 mb-3" />
            
            {/* Context badges showing actual account/timeframe info */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                {timeframe === 'mtd' ? 'Month to Date' : 
                 timeframe === 'ytd' ? 'Year to Date' :
                 timeframe === 'prev_month' ? 'Previous Month' :
                 timeframe === 'prev_quarter' ? 'Previous Quarter' :
                 timeframe === 'prev_year' ? 'Previous Year' :
                 timeframe === '1m' ? 'One Month' :
                 timeframe === '1y' ? 'One Year' :
                 timeframe}
              </div>
              <div className="px-2 py-1 bg-muted/50 text-muted-foreground rounded-md text-xs">
                {selectedAccounts.length} account{selectedAccounts.length !== 1 ? 's' : ''}
              </div>
              {selectedAccounts.slice(0, 2).map((account, index) => (
                <div key={account.id} className="px-2 py-1 bg-muted/30 text-muted-foreground rounded-md text-xs truncate max-w-32">
                  {account.alias || account.name}
                </div>
              ))}
              {selectedAccounts.length > 2 && (
                <div className="px-2 py-1 bg-muted/30 text-muted-foreground rounded-md text-xs">
                  +{selectedAccounts.length - 2} more
                </div>
              )}
            </div>
          </div>
          
          {/* Action buttons skeleton */}
          <div className="flex gap-1">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>

        {/* Loading Progress Section */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm font-medium text-foreground">
                {loadingStage}
              </span>
            </div>
            {estimatedTime > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>~{estimatedTime}s remaining</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Progress value={loadingProgress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{loadingProgress}% complete</span>
              <span>Processing {loadingProgress < 50 ? 'data' : 'analysis'}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Content paragraph skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        
        {/* KPIs skeleton - match real dimensions */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-muted/50 rounded-lg p-4 text-center space-y-1">
              <Skeleton className="h-8 lg:h-10 w-16 mx-auto" /> {/* KPI value */}
              <Skeleton className="h-3 w-full" /> {/* KPI label */}
              <Skeleton className="h-3 w-8 mx-auto" /> {/* KPI change */}
            </div>
          ))}
        </div>
        
        {/* Chart skeleton - match real chart container */}
        <div>
          <Skeleton className="h-4 w-32 mb-3" /> {/* Chart title */}
          <div className="rounded-lg border border-border/50 p-4 bg-muted/30">
            <Skeleton className="h-64 w-full rounded" />
          </div>
        </div>
        
        {/* Follow-up questions skeleton - match FollowUpChips exactly */}
        <div>
          <Skeleton className="h-4 w-32 mb-3" /> {/* Title: "Follow-up Questions" */}
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-40 rounded-md" />
            <Skeleton className="h-8 w-32 rounded-md" />
            <Skeleton className="h-8 w-36 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}