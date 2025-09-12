import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Loader2, Clock } from "lucide-react";

interface AnswerCardSkeletonProps {
  loadingStage?: string;
  loadingProgress?: number;
  estimatedTime?: number;
}

export default function AnswerCardSkeleton({ 
  loadingStage = "Analyzing portfolio data...",
  loadingProgress = 0,
  estimatedTime = 0
}: AnswerCardSkeletonProps) {
  return (
    <Card className="mb-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Question skeleton */}
            <Skeleton className="h-6 w-4/5 mb-3" />
            
            {/* Badges skeleton */}
            <div className="flex items-center gap-2 flex-wrap">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-24" />
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
      
      <CardContent className="pt-0">
        {/* Content paragraph skeleton */}
        <div className="mb-6 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        
        {/* KPIs skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-3 bg-card rounded-lg border space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
        
        {/* Chart skeleton */}
        <div className="mb-6">
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
        
        {/* Follow-up questions skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-40 rounded-full" />
            <Skeleton className="h-8 w-32 rounded-full" />
            <Skeleton className="h-8 w-36 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}