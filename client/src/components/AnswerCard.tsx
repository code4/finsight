import { memo, useState, useEffect, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
// Import all necessary icons including Users for account summary display  
import { Calendar, RefreshCw, Download, User, Users, TrendingUp, MessageCircle, ExternalLink, ArrowUpDown, ArrowUp, ArrowDown, Search, Filter, ThumbsUp, ThumbsDown, Send, Edit2, Check, X, ChevronDown } from "lucide-react";
import FinancialChart from "@/components/FinancialChart";
import FollowUpChips from "@/components/FollowUpChips";
import ErrorCard from "@/components/ErrorCard";

// Utility function to clean up placeholder text for display
const cleanQuestionText = (question: string): string => {
  // Replace common placeholder patterns with user-friendly defaults
  return question
    .replace(/\{benchmark\}/gi, "S&P 500")
    .replace(/\{timeperiod\}/gi, "YTD")
    .replace(/\{sector\}/gi, "Technology")
    .replace(/\{account\}/gi, "All Accounts")
    // Clean up any remaining placeholders by removing braces
    .replace(/\{(\w+)\}/g, (match, placeholder) => {
      // Convert camelCase to Title Case
      return placeholder.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase());
    });
};

interface KPI {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
}

interface Metric {
  label: string;
  value: string;
  subtext?: string;
}

interface AnswerCardProps {
  question: string;
  asOfDate: string;
  accounts: string[];
  timeframe: string;
  isUnmatched?: boolean;
  isError?: boolean;
  errorType?: 'network' | 'server' | 'timeout' | 'unknown';
  originalError?: string;
  message?: string;
  answerId?: string;
  availableAccounts?: string[];
  availableTimeframes?: string[];
  content?: {
    paragraph?: string;
    kpis?: KPI[];
    chartData?: any[];
    tableData?: any[];
    highlights?: string[];
    metrics?: Metric[];
    // Fallback content
    fallbackType?: "personal" | "market" | "financial_advice" | "portfolio";
    actionText?: string;
    isUnmatched?: boolean;
  };
  followUpQuestions?: string[];
  onRefresh?: () => void;
  onExport?: () => void;
  onFollowUpClick?: (question: string) => void;
  onFeedbackSubmit?: (feedback: { type: 'positive' | 'negative', reasoning: string }) => void;
  onAccountsChange?: (newAccounts: string[]) => void;
  onTimeframeChange?: (newTimeframe: string) => void;
  onResubmit?: () => void;
}

const mockKPIs: KPI[] = [
  { label: "Total Return", value: "+12.4%", change: "+2.1%", isPositive: true },
  { label: "vs S&P 500", value: "+3.2%", change: "+0.8%", isPositive: true },
  { label: "Sharpe Ratio", value: "1.24", change: "+0.15", isPositive: true },
  { label: "Max Drawdown", value: "-8.7%", change: "+1.2%", isPositive: true }
];

const mockChartData = [
  { month: "Jan", portfolio: 4000, benchmark: 3800 },
  { month: "Feb", portfolio: 4200, benchmark: 4000 },
  { month: "Mar", portfolio: 4100, benchmark: 4100 },
  { month: "Apr", portfolio: 4400, benchmark: 4200 },
  { month: "May", portfolio: 4600, benchmark: 4300 },
  { month: "Jun", portfolio: 4800, benchmark: 4400 }
];

// Feedback Section Component
const FeedbackSection = memo(function FeedbackSection({ 
  answerId, 
  onFeedbackSubmit 
}: { 
  answerId?: string, 
  onFeedbackSubmit?: (feedback: { type: 'positive' | 'negative', reasoning: string }) => void 
}) {
  const [feedbackType, setFeedbackType] = useState<'positive' | 'negative' | null>(null);
  const [reasoning, setReasoning] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const feedbackMutation = useMutation({
    mutationFn: async (feedback: { answerId: string, type: 'positive' | 'negative', reasoning: string }) => {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback)
      });
      if (!response.ok) throw new Error('Failed to submit feedback');
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      setIsOpen(false);
      toast({
        title: "Feedback submitted",
        description: "Thank you for helping us improve our analysis quality.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/feedback', answerId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleFeedbackClick = (type: 'positive' | 'negative') => {
    if (isSubmitted) return;
    
    setFeedbackType(type);
    setIsOpen(true);
  };

  const handleSubmitFeedback = () => {
    if (!feedbackType || !answerId) return;
    
    const feedbackData = { type: feedbackType, reasoning: reasoning.trim() };
    
    // Call parent callback if provided
    onFeedbackSubmit?.(feedbackData);
    
    // Submit via API
    feedbackMutation.mutate({
      answerId,
      ...feedbackData
    });
  };

  return (
    <div className="flex items-center justify-between p-4 border-t border-border/50 bg-muted/20">
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">Was this analysis helpful?</span>
        
        <div className="flex items-center gap-1">
          <Button
            variant={feedbackType === 'positive' && isSubmitted ? "default" : "ghost"}
            size="sm"
            onClick={() => handleFeedbackClick('positive')}
            disabled={isSubmitted}
            className={`h-8 px-3 gap-1.5 transition-all duration-200 hover:scale-105 ${
              feedbackType === 'positive' && isSubmitted 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                : 'hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20'
            }`}
            data-testid="button-thumbs-up"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            Helpful
          </Button>
          
          <Button
            variant={feedbackType === 'negative' && isSubmitted ? "default" : "ghost"}
            size="sm"
            onClick={() => handleFeedbackClick('negative')}
            disabled={isSubmitted}
            className={`h-8 px-3 gap-1.5 transition-all duration-200 hover:scale-105 ${
              feedbackType === 'negative' && isSubmitted 
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                : 'hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20'
            }`}
            data-testid="button-thumbs-down"
          >
            <ThumbsDown className="h-3.5 w-3.5" />
            Not helpful
          </Button>
        </div>
      </div>

      {isSubmitted && (
        <Badge variant="outline" className="text-xs text-green-600 dark:text-green-400">
          Feedback submitted
        </Badge>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {feedbackType === 'positive' ? (
                <ThumbsUp className="h-5 w-5 text-green-600" />
              ) : (
                <ThumbsDown className="h-5 w-5 text-red-600" />
              )}
              {feedbackType === 'positive' ? 'Positive Feedback' : 'Improvement Feedback'}
            </DialogTitle>
            <DialogDescription>
              {feedbackType === 'positive' 
                ? "What made this analysis particularly helpful? Your feedback helps us improve."
                : "How can we make this analysis better? Your feedback is valuable for improvement."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reasoning">
                {feedbackType === 'positive' 
                  ? "What worked well?"
                  : "What could be improved?"
                }
              </Label>
              <Textarea
                id="reasoning"
                placeholder={feedbackType === 'positive' 
                  ? "e.g., Clear metrics, good visualizations, actionable insights..."
                  : "e.g., Missing data, unclear explanations, need more details..."
                }
                value={reasoning}
                onChange={(e) => setReasoning(e.target.value)}
                className="min-h-[100px] resize-none"
                data-testid="textarea-feedback-reasoning"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitFeedback}
              disabled={feedbackMutation.isPending || !reasoning.trim()}
              className="gap-2"
              data-testid="button-submit-feedback"
            >
              {feedbackMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Feedback
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

// Editable Badge Section Component
const EditableBadgeSection = memo(function EditableBadgeSection({
  accounts,
  timeframe,
  availableAccounts = ["Growth Portfolio", "Conservative Fund", "Aggressive Growth", "Income Focus", "All Accounts"],
  availableTimeframes = ["1D", "1W", "1M", "3M", "6M", "YTD", "1Y", "2Y", "3Y", "5Y"],
  onAccountsChange,
  onTimeframeChange,
  onResubmit
}: {
  accounts: string[];
  timeframe: string;
  availableAccounts?: string[];
  availableTimeframes?: string[];
  onAccountsChange?: (newAccounts: string[]) => void;
  onTimeframeChange?: (newTimeframe: string) => void;
  onResubmit?: () => void;
}) {
  const [isEditingAccounts, setIsEditingAccounts] = useState(false);
  const [isEditingTimeframe, setIsEditingTimeframe] = useState(false);
  const [tempAccounts, setTempAccounts] = useState<string[]>(accounts);
  const [tempTimeframe, setTempTimeframe] = useState(timeframe);

  // Reset temp values when props change
  useEffect(() => {
    setTempAccounts(accounts);
    setTempTimeframe(timeframe);
  }, [accounts, timeframe]);

  const handleAccountToggle = (account: string) => {
    setTempAccounts(prev => 
      prev.includes(account)
        ? prev.filter(a => a !== account)
        : [...prev, account]
    );
  };

  const handleSaveAccounts = () => {
    if (tempAccounts.length === 0) return; // Prevent empty selection
    
    onAccountsChange?.(tempAccounts);
    setIsEditingAccounts(false);
    
    // Trigger resubmission if accounts changed
    if (JSON.stringify([...tempAccounts].sort()) !== JSON.stringify([...accounts].sort())) {
      setTimeout(() => onResubmit?.(), 100);
    }
  };

  const handleSaveTimeframe = () => {
    onTimeframeChange?.(tempTimeframe);
    setIsEditingTimeframe(false);
    
    // Trigger resubmission if timeframe changed
    if (tempTimeframe !== timeframe) {
      setTimeout(() => onResubmit?.(), 100);
    }
  };

  const handleCancelAccounts = () => {
    setTempAccounts(accounts);
    setIsEditingAccounts(false);
  };

  const handleCancelTimeframe = () => {
    setTempTimeframe(timeframe);
    setIsEditingTimeframe(false);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Editable Accounts */}
      {isEditingAccounts ? (
        <Popover open={isEditingAccounts} onOpenChange={setIsEditingAccounts}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs gap-1 border-primary/50"
              data-testid="button-edit-accounts"
            >
              <Edit2 className="h-3 w-3" />
              Editing accounts...
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3" align="start">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Select Accounts</Label>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSaveAccounts}
                    disabled={tempAccounts.length === 0}
                    className="h-6 px-2 gap-1"
                    data-testid="button-save-accounts"
                  >
                    <Check className="h-3 w-3" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelAccounts}
                    className="h-6 px-2 gap-1"
                    data-testid="button-cancel-accounts"
                  >
                    <X className="h-3 w-3" />
                    Cancel
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableAccounts.map((account) => (
                  <div key={account} className="flex items-center space-x-2">
                    <Checkbox
                      id={account}
                      checked={tempAccounts.includes(account)}
                      onCheckedChange={() => handleAccountToggle(account)}
                      data-testid={`checkbox-account-${account.toLowerCase().replace(/\s+/g, '-')}`}
                    />
                    <Label
                      htmlFor={account}
                      className="text-xs cursor-pointer flex-1"
                    >
                      {account}
                    </Label>
                  </div>
                ))}
              </div>
              
              <div className="text-xs text-muted-foreground">
                {tempAccounts.length} account{tempAccounts.length !== 1 ? 's' : ''} selected
              </div>
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <div className="flex items-center gap-1">
          {accounts.length <= 2 ? (
            /* Show individual badges for 1-2 accounts */
            accounts.map((account, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs transition-all duration-200 hover:scale-105 cursor-pointer group relative"
                onClick={() => setIsEditingAccounts(true)}
                style={{ animationDelay: `${index * 100}ms` }}
                data-testid={`badge-account-${index}`}
              >
                {account}
                <Edit2 className="h-2 w-2 ml-1 opacity-0 group-hover:opacity-50 transition-opacity" />
              </Badge>
            ))
          ) : (
            /* Show summary badge for 3+ accounts */
            <Badge
              variant="outline"
              className="text-xs transition-all duration-200 hover:scale-105 cursor-pointer group relative bg-primary/5 border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => setIsEditingAccounts(true)}
              data-testid="badge-account-summary"
            >
              <Users className="h-3 w-3 mr-1" />
              {accounts.length} Account{accounts.length !== 1 ? 's' : ''}
              <Edit2 className="h-2 w-2 ml-1 opacity-0 group-hover:opacity-70 transition-opacity" />
            </Badge>
          )}
        </div>
      )}

      {/* Editable Timeframe */}
      {isEditingTimeframe ? (
        <div className="flex items-center gap-1">
          <Select
            value={tempTimeframe}
            onValueChange={setTempTimeframe}
            data-testid="select-timeframe"
          >
            <SelectTrigger className="h-6 w-20 px-2 text-xs border-primary/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableTimeframes.map((tf) => (
                <SelectItem key={tf} value={tf} className="text-xs">
                  {tf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSaveTimeframe}
            className="h-6 px-1.5"
            data-testid="button-save-timeframe"
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancelTimeframe}
            className="h-6 px-1.5"
            data-testid="button-cancel-timeframe"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Badge
          variant="secondary"
          className="text-xs transition-all duration-200 hover:scale-105 cursor-pointer group relative"
          onClick={() => setIsEditingTimeframe(true)}
          data-testid="badge-timeframe"
        >
          {timeframe}
          <Edit2 className="h-2 w-2 ml-1 opacity-0 group-hover:opacity-50 transition-opacity" />
        </Badge>
      )}
    </div>
  );
});

// Function to render specialized content layouts based on analysis type
const renderSpecializedContent = (content: any) => {
  // Detect analysis type based on content structure
  const isPerformanceAnalysis = content.kpis && content.chartData && content.highlights && !content.tableData && !content.metrics;
  const isHoldingsAnalysis = content.kpis && content.tableData && content.highlights && !content.chartData;
  const isRiskAnalysis = content.kpis && content.metrics && !content.tableData && !content.chartData;
  const isAllocationAnalysis = content.kpis && content.chartData && content.tableData;

  if (isPerformanceAnalysis) {
    return renderPerformanceLayout(content);
  } else if (isRiskAnalysis) {
    return renderRiskLayout(content);
  } else if (isHoldingsAnalysis) {
    return renderHoldingsLayout(content);
  } else if (isAllocationAnalysis) {
    return renderAllocationLayout(content);
  } else {
    // Fallback to generic layout
    return renderGenericLayout(content);
  }
};

// Performance Analysis Layout - Emphasizes returns and charts
const renderPerformanceLayout = (content: any) => (
  <>
    {/* Hero KPIs - Larger for performance metrics */}
    {content.kpis && (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {content.kpis.slice(0, 4).map((kpi: any, index: number) => (
          <div 
            key={index} 
            className={`rounded-lg p-5 text-center hover-elevate button-smooth group animate-in fade-in-50 slide-in-from-bottom-2 ${
              index === 0 || index === 1 
                ? 'bg-gradient-to-br from-chart-2/20 to-chart-2/5 border border-chart-2/20' 
                : 'bg-muted/50'
            }`}
            style={{ animationDelay: `${index * 100 + 200}ms` }}
          >
            <div className={`text-3xl lg:text-4xl font-mono font-bold mb-2 group-hover:scale-110 content-transition ${
              index === 0 || index === 1 ? 'text-chart-2' : ''
            }`} data-testid={`text-kpi-value-${index}`}>
              {kpi.value}
            </div>
            <div className="text-sm text-muted-foreground mb-1 font-medium">{kpi.label}</div>
            <div className={`text-xs font-medium content-transition ${
              kpi.isPositive ? 'text-chart-2' : 'text-chart-3'
            }`}>
              {kpi.change}
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Prominent Chart */}
    {content.chartData && (
      <div className="mb-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-700" style={{ animationDelay: '600ms' }}>
        <h4 className="text-base font-semibold mb-4 text-foreground">Performance Comparison</h4>
        <div className="rounded-lg border border-border/50 p-6 bg-gradient-to-br from-muted/30 to-muted/10 hover-elevate card-smooth">
          <FinancialChart data={content.chartData} />
        </div>
      </div>
    )}

    {/* Key Insights */}
    {content.highlights && (
      <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700" style={{ animationDelay: '800ms' }}>
        <h4 className="text-base font-semibold mb-4 text-foreground">Key Performance Insights</h4>
        <div className="space-y-3">
          {content.highlights.map((highlight: string, index: number) => (
            <div key={index} className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 border-l-4 border-primary/50 hover-elevate button-smooth">
              <p className="text-sm leading-relaxed font-medium">{highlight}</p>
            </div>
          ))}
        </div>
      </div>
    )}
  </>
);

// Risk Analysis Layout - Warning colors and risk indicators
const renderRiskLayout = (content: any) => (
  <>
    {/* Risk KPIs with warning colors */}
    {content.kpis && (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {content.kpis.map((kpi: any, index: number) => (
          <div 
            key={index} 
            className={`rounded-lg p-4 text-center hover-elevate button-smooth group animate-in fade-in-50 slide-in-from-bottom-2 ${
              !kpi.isPositive 
                ? 'bg-gradient-to-br from-chart-3/20 to-chart-3/5 border border-chart-3/20' 
                : 'bg-gradient-to-br from-chart-2/20 to-chart-2/5 border border-chart-2/20'
            }`}
            style={{ animationDelay: `${index * 100 + 200}ms` }}
          >
            <div className={`text-2xl lg:text-3xl font-mono font-bold mb-1 group-hover:scale-110 content-transition ${
              !kpi.isPositive ? 'text-chart-3' : 'text-chart-2'
            }`} data-testid={`text-kpi-value-${index}`}>
              {kpi.value}
            </div>
            <div className="text-xs text-muted-foreground mb-1">{kpi.label}</div>
            <div className={`text-xs font-medium content-transition ${
              kpi.isPositive ? 'text-chart-2' : 'text-chart-3'
            }`}>
              {kpi.change}
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Risk Metrics with special styling */}
    {content.metrics && (
      <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700" style={{ animationDelay: '500ms' }}>
        <h4 className="text-base font-semibold mb-4 text-foreground">Additional Risk Metrics</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {content.metrics.map((metric: any, index: number) => (
            <div key={index} className="bg-gradient-to-br from-muted/50 to-muted/20 rounded-lg p-4 hover-elevate button-smooth border border-muted-foreground/10">
              <div className="text-xl font-mono font-bold mb-1 text-foreground">{metric.value}</div>
              <div className="text-sm font-medium mb-1">{metric.label}</div>
              {metric.subtext && (
                <div className="text-xs text-muted-foreground">{metric.subtext}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    )}
  </>
);

// Holdings Analysis Layout - Table-first design
const renderHoldingsLayout = (content: any) => (
  <>
    {/* Compact KPIs */}
    {content.kpis && (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {content.kpis.map((kpi: any, index: number) => (
          <div 
            key={index} 
            className="bg-muted/50 rounded-lg p-4 text-center hover-elevate button-smooth group animate-in fade-in-50 slide-in-from-bottom-2"
            style={{ animationDelay: `${index * 100 + 200}ms` }}
          >
            <div className="text-2xl font-mono font-bold mb-1 group-hover:scale-110 content-transition" data-testid={`text-kpi-value-${index}`}>
              {kpi.value}
            </div>
            <div className="text-xs text-muted-foreground mb-1">{kpi.label}</div>
            <div className={`text-xs font-medium content-transition ${
              kpi.isPositive ? 'text-chart-2' : 'text-chart-3'
            }`}>
              {kpi.change}
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Prominent Table */}
    {content.tableData && (
      <div className="mb-6">
        <h4 className="text-base font-semibold mb-4 text-foreground">Portfolio Holdings</h4>
        <EnhancedTable 
          data={content.tableData} 
          animationDelay="400ms"
        />
      </div>
    )}

    {/* Holdings Insights */}
    {content.highlights && (
      <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700" style={{ animationDelay: '600ms' }}>
        <h4 className="text-base font-semibold mb-4 text-foreground">Portfolio Insights</h4>
        <div className="space-y-3">
          {content.highlights.map((highlight: string, index: number) => (
            <div key={index} className="bg-muted/30 rounded-lg p-3 border-l-4 border-primary/30 hover-elevate button-smooth">
              <p className="text-sm leading-relaxed">{highlight}</p>
            </div>
          ))}
        </div>
      </div>
    )}
  </>
);

// Allocation Analysis Layout - Side-by-side comparisons
const renderAllocationLayout = (content: any) => (
  <>
    {/* KPIs */}
    {content.kpis && (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {content.kpis.map((kpi: any, index: number) => (
          <div 
            key={index} 
            className="bg-muted/50 rounded-lg p-4 text-center hover-elevate button-smooth group animate-in fade-in-50 slide-in-from-bottom-2"
            style={{ animationDelay: `${index * 100 + 200}ms` }}
          >
            <div className="text-2xl font-mono font-bold mb-1 group-hover:scale-110 content-transition" data-testid={`text-kpi-value-${index}`}>
              {kpi.value}
            </div>
            <div className="text-xs text-muted-foreground mb-1">{kpi.label}</div>
            <div className={`text-xs font-medium content-transition ${
              kpi.isPositive ? 'text-chart-2' : 'text-chart-3'
            }`}>
              {kpi.change}
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Side-by-side Chart and Table */}
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
      {/* Chart */}
      {content.chartData && (
        <div className="animate-in fade-in-50 slide-in-from-left-4 duration-700" style={{ animationDelay: '400ms' }}>
          <h4 className="text-base font-semibold mb-4 text-foreground">Sector Allocation</h4>
          <div className="rounded-lg border border-border/50 p-4 bg-muted/30 hover-elevate card-smooth">
            <FinancialChart data={content.chartData} />
          </div>
        </div>
      )}

      {/* Table */}
      {content.tableData && (
        <div className="animate-in fade-in-50 slide-in-from-right-4 duration-700" style={{ animationDelay: '500ms' }}>
          <h4 className="text-base font-semibold mb-4 text-foreground">Allocation Details</h4>
          <div className="rounded-lg border border-border/50 bg-muted/30">
            <EnhancedTable 
              data={content.tableData} 
              animationDelay="0ms"
            />
          </div>
        </div>
      )}
    </div>
  </>
);

// Generic Layout - Fallback for other content types
const renderGenericLayout = (content: any) => (
  <>
    {/* KPIs */}
    {content.kpis && (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
        {content.kpis.map((kpi: any, index: number) => (
          <div 
            key={index} 
            className="bg-muted/50 rounded-lg p-4 text-center hover-elevate button-smooth group animate-in fade-in-50 slide-in-from-bottom-2"
            style={{ animationDelay: `${index * 150 + 200}ms` }}
          >
            <div className="text-2xl lg:text-3xl font-mono font-bold mb-1 group-hover:scale-110 content-transition" data-testid={`text-kpi-value-${index}`}>
              {kpi.value}
            </div>
            <div className="text-xs text-muted-foreground mb-1">{kpi.label}</div>
            <div className={`text-xs font-medium content-transition ${
              kpi.isPositive ? 'text-chart-2' : 'text-chart-3'
            }`}>
              {kpi.change}
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Enhanced Table Data with Sorting & Filtering */}
    {content.tableData && (
      <EnhancedTable 
        data={content.tableData} 
        animationDelay={`${(content.kpis?.length || 0) * 150 + 300}ms`}
      />
    )}

    {/* Chart */}
    {content.chartData && (
      <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 mb-6" style={{ animationDelay: `${(content.kpis?.length || 0) * 150 + 400}ms` }}>
        <h4 className="text-sm font-medium mb-3 text-muted-foreground">Performance Comparison</h4>
        <div className="rounded-lg border border-border/50 p-4 bg-muted/30 hover-elevate card-smooth">
          <FinancialChart data={content.chartData} />
        </div>
      </div>
    )}

    {/* Metrics */}
    {content.metrics && (
      <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 mb-6" style={{ animationDelay: `${(content.kpis?.length || 0) * 150 + 500}ms` }}>
        <h4 className="text-sm font-medium mb-3 text-muted-foreground">Additional Metrics</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {content.metrics.map((metric: any, index: number) => (
            <div key={index} className="bg-muted/50 rounded-lg p-4 hover-elevate button-smooth">
              <div className="text-lg font-mono font-bold mb-1">{metric.value}</div>
              <div className="text-sm font-medium mb-1">{metric.label}</div>
              {metric.subtext && (
                <div className="text-xs text-muted-foreground">{metric.subtext}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Highlights */}
    {content.highlights && (
      <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${(content.kpis?.length || 0) * 150 + 600}ms` }}>
        <h4 className="text-sm font-medium mb-3 text-muted-foreground">Key Insights</h4>
        <div className="space-y-2">
          {content.highlights.map((highlight: string, index: number) => (
            <div key={index} className="bg-muted/30 rounded-lg p-3 border-l-4 border-primary/30 hover-elevate button-smooth">
              <p className="text-sm leading-relaxed">{highlight}</p>
            </div>
          ))}
        </div>
      </div>
    )}
  </>
);

// Enhanced Table Component with Sorting and Filtering
const EnhancedTable = memo(function EnhancedTable({ 
  data, 
  animationDelay 
}: { 
  data: any[], 
  animationDelay: string 
}) {
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterText, setFilterText] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Get column headers (exclude isPositive utility field)
  const headers = Object.keys(data[0] || {}).filter(key => key !== 'isPositive');

  // Sort and filter data
  const processedData = useMemo(() => {
    let filteredData = data;

    // Apply text filter
    if (filterText) {
      filteredData = data.filter(row =>
        Object.entries(row)
          .filter(([key]) => key !== 'isPositive')
          .some(([_, value]) => 
            String(value).toLowerCase().includes(filterText.toLowerCase())
          )
      );
    }

    // Apply sorting
    if (sortField) {
      filteredData = [...filteredData].sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];

        // Handle percentage values (remove % and convert to number)
        if (typeof aVal === 'string' && aVal.includes('%')) {
          aVal = parseFloat(aVal.replace('%', '').replace('+', ''));
          bVal = parseFloat(bVal.replace('%', '').replace('+', ''));
        }
        
        // Handle currency values (remove $ and K/M, convert to number)
        if (typeof aVal === 'string' && aVal.includes('$')) {
          aVal = parseFloat(aVal.replace(/[$,K]/g, '')) * (aVal.includes('K') ? 1000 : 1);
          bVal = parseFloat(bVal.replace(/[$,K]/g, '')) * (bVal.includes('K') ? 1000 : 1);
        }

        // Handle numeric strings
        const aNum = parseFloat(String(aVal).replace(/[^\d.-]/g, ''));
        const bNum = parseFloat(String(bVal).replace(/[^\d.-]/g, ''));
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
        }

        // String comparison
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        
        if (sortDirection === 'asc') {
          return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
        } else {
          return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
        }
      });
    }

    return filteredData;
  }, [data, sortField, sortDirection, filterText]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-50" />;
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-3 w-3 text-primary" /> : 
      <ArrowDown className="h-3 w-3 text-primary" />;
  };

  return (
    <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700" style={{ animationDelay }}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-muted-foreground">Detailed Breakdown</h4>
        <div className="flex items-center gap-2">
          {showFilters && (
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="Filter data..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="pl-7 h-8 w-48 text-xs"
              />
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="h-8 px-2 gap-1 text-xs"
          >
            <Filter className="h-3 w-3" />
            Filter
          </Button>
        </div>
      </div>
      
      <div className="rounded-lg border border-border/50 overflow-hidden bg-muted/30 hover-elevate transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {headers.map((header, index) => (
                  <th key={index} className="px-4 py-3 text-left font-medium text-muted-foreground">
                    <button
                      onClick={() => handleSort(header)}
                      className="flex items-center gap-1 hover:text-foreground transition-colors duration-200 capitalize"
                    >
                      {header}
                      {getSortIcon(header)}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {processedData.length > 0 ? (
                processedData.map((row: any, index: number) => (
                  <tr key={index} className="border-b border-border/50 hover:bg-muted/30 transition-colors duration-200">
                    {Object.entries(row).filter(([key]) => key !== 'isPositive').map(([key, value], cellIndex) => (
                      <td key={cellIndex} className="px-4 py-3">
                        {key === 'return' && row.isPositive !== undefined ? (
                          <span className={`font-medium ${row.isPositive ? 'text-chart-2' : 'text-chart-3'}`}>
                            {value as string}
                          </span>
                        ) : key.includes('weight') || key.includes('yield') || key.includes('return') ? (
                          <span className="font-mono">
                            {value as string}
                          </span>
                        ) : (
                          value as string
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={headers.length} className="px-4 py-6 text-center text-muted-foreground">
                    No matching data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {processedData.length > 0 && (
          <div className="px-4 py-2 bg-muted/30 border-t border-border/50 text-xs text-muted-foreground">
            Showing {processedData.length} of {data.length} entries
            {filterText && ` • Filtered by "${filterText}"`}
            {sortField && ` • Sorted by ${sortField} (${sortDirection})`}
          </div>
        )}
      </div>
    </div>
  );
});

const AnswerCard = memo(function AnswerCard({
  question = "What's the YTD performance vs S&P 500?",
  asOfDate = "Dec 10, 2024",
  accounts = ["Growth Portfolio", "Conservative Fund"],
  timeframe = "YTD",
  isUnmatched = false,
  isError = false,
  errorType,
  originalError,
  message,
  answerId,
  availableAccounts,
  availableTimeframes,
  content = {
    paragraph: "Your portfolio has outperformed the S&P 500 by 3.2% year-to-date, driven primarily by strong performance in technology and healthcare sectors. The portfolio's risk-adjusted returns show a Sharpe ratio of 1.24, indicating efficient risk management.",
    kpis: mockKPIs,
    chartData: mockChartData
  },
  followUpQuestions = [
    "What drove the outperformance?", 
    "Show sector breakdown", 
    "Compare risk metrics"
  ],
  onRefresh,
  onExport,
  onFollowUpClick,
  onFeedbackSubmit,
  onAccountsChange,
  onTimeframeChange,
  onResubmit
}: AnswerCardProps) {
  
  const handleRefresh = () => {
    onRefresh?.();
    console.log('Answer refreshed');
  };

  const handleExport = () => {
    onExport?.();
    console.log('Answer exported');
  };

  return (
    <Card className="mb-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500 hover-elevate card-smooth stable-layout group">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-200" data-testid="text-question">
              {cleanQuestionText(question)}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <EditableBadgeSection
                accounts={accounts}
                timeframe={timeframe}
                availableAccounts={availableAccounts}
                availableTimeframes={availableTimeframes}
                onAccountsChange={onAccountsChange}
                onTimeframeChange={onTimeframeChange}
                onResubmit={onResubmit}
              />
              <Badge variant="outline" className="text-xs gap-1 transition-all duration-200 hover:scale-105">
                <Calendar className="h-3 w-3" />
                As of {asOfDate}
              </Badge>
            </div>
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover-elevate button-smooth hover:rotate-180"
              onClick={handleRefresh}
              data-testid="button-refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover-elevate button-smooth hover:scale-110"
              onClick={handleExport}
              data-testid="button-export"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 content-transition">
        {isError ? (
          /* Error state for API failures */
          <ErrorCard
            question={question}
            asOfDate={asOfDate}
            accounts={accounts}
            timeframe={timeframe}
            error={originalError || message || "An unexpected error occurred"}
            errorType={errorType}
            onRetry={onRefresh}
            onReportIssue={() => console.log("Report issue clicked")}
          />
        ) : (isUnmatched || content?.isUnmatched) ? (
          /* Smart Fallback content for unmatched questions */
          <div className="text-center py-8 space-y-6">
            {/* Dynamic Icon based on fallback type */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              {content?.fallbackType === "personal" ? (
                <User className="h-8 w-8 text-primary" />
              ) : content?.fallbackType === "market" ? (
                <TrendingUp className="h-8 w-8 text-primary" />
              ) : content?.fallbackType === "financial_advice" ? (
                <MessageCircle className="h-8 w-8 text-primary" />
              ) : (
                <Calendar className="h-8 w-8 text-primary" />
              )}
            </div>

            <div className="space-y-3">
              <h4 className="text-lg font-semibold">
                {content?.fallbackType === "personal" ? "Account Information" :
                 content?.fallbackType === "market" ? "Market Data Request" :
                 content?.fallbackType === "financial_advice" ? "Added for Review" :
                 "Portfolio Analysis"}
              </h4>
              
              <p className="text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
                {content?.paragraph || 
                 "We've added your question to our development list and will review it for inclusion in future platform updates."}
              </p>
            </div>

            {/* Action Button */}
            {content?.actionText && (
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  className="gap-2 hover-elevate transition-all duration-200"
                  onClick={() => console.log(`Action: ${content.actionText}`)}
                >
                  <ExternalLink className="h-4 w-4" />
                  {content.actionText}
                </Button>
              </div>
            )}

            {/* Status Badge */}
            <Badge 
              variant={content?.fallbackType === "financial_advice" ? "default" : "outline"} 
              className="text-xs"
            >
              {content?.fallbackType === "personal" ? "Account Information" :
               content?.fallbackType === "market" ? "External Data" :
               content?.fallbackType === "financial_advice" ? "Pending Review" :
               "Development Queue"}
            </Badge>
          </div>
        ) : (
          /* Regular content for matched questions with specialized layouts */
          <>
            {/* Paragraph */}
            {content.paragraph && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {content.paragraph}
              </p>
            )}

            {/* Render specialized layouts based on analysis type */}
            {renderSpecializedContent(content)}

            {/* Follow-up Questions */}
            <FollowUpChips 
              questions={followUpQuestions}
              onQuestionClick={onFollowUpClick}
            />
          </>
        )}
      </CardContent>
      
      {/* Feedback Section - only show for matched questions with answerId */}
      {!isUnmatched && !content?.isUnmatched && answerId && (
        <FeedbackSection 
          answerId={answerId} 
          onFeedbackSubmit={onFeedbackSubmit}
        />
      )}
    </Card>
  );
});

export default AnswerCard;