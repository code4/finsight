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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
// Import all necessary icons including Users for account summary display  
import { Calendar, RefreshCw, Download, User, Users, TrendingUp, MessageCircle, ExternalLink, ArrowUpDown, ArrowUp, ArrowDown, Search, Filter, ThumbsUp, ThumbsDown, Send, Edit2, Check, X, ChevronDown, Settings2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import FinancialChart from "@/components/FinancialChart";
import FollowUpChips from "@/components/FollowUpChips";
import ErrorCard from "@/components/ErrorCard";

// Enhanced placeholder system with interactive capabilities
import { TIMEFRAME_OPTIONS, BENCHMARK_OPTIONS, SECTOR_OPTIONS, ACCOUNT_OPTIONS } from '@shared/enhanced-financial-data';

// Placeholder options mapping
const PLACEHOLDER_OPTIONS = {
  benchmark: BENCHMARK_OPTIONS,
  timeperiod: TIMEFRAME_OPTIONS, 
  timeframe: TIMEFRAME_OPTIONS,
  sector: SECTOR_OPTIONS,
  account: ACCOUNT_OPTIONS,
} as const;

// Default values for common placeholders
const DEFAULT_PLACEHOLDER_VALUES = {
  benchmark: "S&P 500",
  timeperiod: "YTD", 
  timeframe: "YTD",
  sector: "Technology",
  account: "All Accounts",
} as const;

// Interactive placeholder component
const InteractivePlaceholder = memo(function InteractivePlaceholder({
  type,
  value,
  onValueChange,
  className = ""
}: {
  type: string;
  value: string;
  onValueChange: (newValue: string) => void;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const options = PLACEHOLDER_OPTIONS[type as keyof typeof PLACEHOLDER_OPTIONS] || [];

  if (options.length === 0) {
    // No options available, render as static text
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-sm font-medium ${className}`}>
        {value}
      </span>
    );
  }

  // Render as interactive dropdown with tooltip
  return (
    <Tooltip>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`h-auto px-2 py-1 text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-md inline-flex items-center gap-1 ${className}`}
              data-testid={`button-placeholder-${type}`}
            >
              {value}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${type}...`} />
          <CommandEmpty>No options found.</CommandEmpty>
          <CommandGroup className="max-h-48 overflow-y-auto">
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => {
                  onValueChange(option.label);
                  setIsOpen(false);
                }}
                className="flex flex-col items-start"
                data-testid={`option-${type}-${option.value}`}
              >
                <div className="font-medium">{option.label}</div>
                {option.description && (
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
      </Popover>
      <TooltipContent>
        <p>Click to change {type}</p>
      </TooltipContent>
    </Tooltip>
  );
});

// Enhanced function to render question text with interactive placeholders
const renderInteractiveQuestionText = (
  question: string, 
  placeholderValues: Record<string, string>,
  onPlaceholderChange: (type: string, value: string) => void
) => {
  // Find all placeholders in the question
  const placeholderRegex = /\{(\w+)\}/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = placeholderRegex.exec(question)) !== null) {
    // Add text before placeholder
    if (match.index > lastIndex) {
      parts.push(question.substring(lastIndex, match.index));
    }
    
    const placeholderType = match[1].toLowerCase();
    const currentValue = placeholderValues[placeholderType] || DEFAULT_PLACEHOLDER_VALUES[placeholderType as keyof typeof DEFAULT_PLACEHOLDER_VALUES] || match[1];
    
    // Add interactive placeholder
    parts.push(
      <InteractivePlaceholder
        key={`${placeholderType}-${match.index}`}
        type={placeholderType}
        value={currentValue}
        onValueChange={(value) => onPlaceholderChange(placeholderType, value)}
      />
    );
    
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < question.length) {
    parts.push(question.substring(lastIndex));
  }

  return parts.length > 1 ? parts : question;
};

// Utility function to clean up placeholder text for display (legacy)
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
  account?: { id: string; accountNumber: string; name: string; alias?: string; type: string; balance: number; color: string } | string; // Single account for new system
  timeframe: string;
  isUnmatched?: boolean;
  isError?: boolean;
  errorType?: 'network' | 'server' | 'timeout' | 'unknown';
  originalError?: string;
  message?: string;
  answerId?: string;
  availableAccounts?: string[];
  availableTimeframes?: { value: string; label: string }[];
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
  onQuestionSubmit?: (question: string, placeholders?: Record<string, string>) => void;
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
// Detailed feedback reasons matching the backend schema
const FEEDBACK_REASONS = [
  { value: "incorrect_data", label: "Incorrect Data", description: "Numbers or facts appear wrong" },
  { value: "outdated", label: "Outdated Information", description: "Data seems old or stale" },
  { value: "not_relevant", label: "Not Relevant", description: "Doesn't answer my question" },
  { value: "unclear", label: "Unclear Explanation", description: "Hard to understand or confusing" },
  { value: "missing_info", label: "Missing Information", description: "Key details are missing" },
  { value: "wrong_timeframe", label: "Wrong Timeframe", description: "Time period doesn't match request" },
  { value: "wrong_accounts", label: "Wrong Accounts", description: "Account selection is incorrect" },
  { value: "other", label: "Other", description: "Something else" }
] as const;

const FeedbackSection = memo(function FeedbackSection({ 
  answerId, 
  onFeedbackSubmit 
}: { 
  answerId?: string, 
  onFeedbackSubmit?: (feedback: { type: 'positive' | 'negative', reasoning: string, reasons?: string[] }) => void 
}) {
  const [feedbackType, setFeedbackType] = useState<'positive' | 'negative' | null>(null);
  const [reasoning, setReasoning] = useState("");
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const feedbackMutation = useMutation({
    mutationFn: async (feedback: { 
      answerId: string, 
      questionId?: string,
      question: string,
      sentiment: 'up' | 'down',
      reasons?: string[],
      comment?: string
    }) => {
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
    setSelectedReasons([]);
    setReasoning("");
    setIsOpen(true);
  };

  const handleReasonToggle = (reasonValue: string) => {
    setSelectedReasons(prev => 
      prev.includes(reasonValue) 
        ? prev.filter(r => r !== reasonValue)
        : [...prev, reasonValue]
    );
  };

  const handleSubmitFeedback = () => {
    if (!feedbackType || !answerId) return;
    
    // Validation: For negative feedback, require at least one reason OR comment
    if (feedbackType === 'negative' && selectedReasons.length === 0 && !reasoning.trim()) {
      toast({
        title: "Feedback required",
        description: "Please select at least one reason or provide additional details.",
        variant: "destructive",
      });
      return;
    }
    
    const feedbackData = { 
      type: feedbackType, 
      reasoning: reasoning.trim(),
      reasons: feedbackType === 'negative' ? selectedReasons : undefined
    };
    
    // Call parent callback if provided
    onFeedbackSubmit?.(feedbackData);
    
    // Submit via API with proper schema format
    feedbackMutation.mutate({
      answerId,
      questionId: undefined, // Could be passed from parent if available
      question: "Portfolio analysis feedback", // Generic for now
      sentiment: feedbackType === 'positive' ? 'up' : 'down',
      reasons: feedbackType === 'negative' && selectedReasons.length > 0 ? selectedReasons : undefined,
      comment: reasoning.trim() || undefined
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
            {/* Detailed reason checkboxes for negative feedback */}
            {feedbackType === 'negative' && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">What was the main issue? (select all that apply)</Label>
                {selectedReasons.length === 0 && !reasoning.trim() && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Please select at least one reason or provide details below
                  </p>
                )}
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                  {FEEDBACK_REASONS.map((reason) => (
                    <div key={reason.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={reason.value}
                        checked={selectedReasons.includes(reason.value)}
                        onCheckedChange={() => handleReasonToggle(reason.value)}
                        data-testid={`checkbox-reason-${reason.value}`}
                      />
                      <div className="flex flex-col">
                        <Label
                          htmlFor={reason.value}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {reason.label}
                        </Label>
                        <span className="text-xs text-muted-foreground">{reason.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reasoning">
                {feedbackType === 'positive' 
                  ? "What worked well?" 
                  : "Additional details (optional)"
                }
              </Label>
              <Textarea
                id="reasoning"
                placeholder={feedbackType === 'positive' 
                  ? "e.g., Clear metrics, good visualizations, actionable insights..."
                  : "Any specific details that might help us improve..."
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
              disabled={feedbackMutation.isPending || (feedbackType === 'positive' ? !reasoning.trim() : false)}
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

// Enhanced Interactive Placeholder System for Single Account/Timeframe Selection
const EditableBadgeSection = memo(function EditableBadgeSection({
  account, // Single account object with proper structure
  timeframe,
  availableAccounts = [], // Now expects Account objects with proper structure
  availableTimeframes = [
    { value: 'mtd', short: 'MTD', label: 'Month to Date' },
    { value: 'ytd', short: 'YTD', label: 'Year to Date' },
    { value: 'prev_month', short: 'PM', label: 'Previous Month' },
    { value: 'prev_quarter', short: 'PQ', label: 'Previous Quarter' },
    { value: 'prev_year', short: 'PY', label: 'Previous Year' },
    { value: '1m', short: '1M', label: 'One Month' },
    { value: '1y', short: '1Y', label: 'One Year' },
  ] as const, // Same as TopNavigation
  onAccountChange, // Single account change
  onTimeframeChange,
  onPlaceholderEdit, // Called when placeholder is clicked (triggers blur)
  onSubmitChanges, // Called when submit button is clicked
  hasChanges, // Whether there are unsaved changes
  isBlurred // Whether answer should be blurred
}: {
  account: { id: string; accountNumber: string; name: string; alias?: string; type: string; balance: number; color: string } | string; // Support both formats for backward compatibility
  timeframe: string;
  availableAccounts?: { id: string; accountNumber: string; name: string; alias?: string; type: string; balance: number; color: string }[];
  availableTimeframes?: { value: string; short: string; label: string }[];
  onAccountChange?: (newAccount: any) => void;
  onTimeframeChange?: (newTimeframe: string) => void;
  onPlaceholderEdit?: () => void; // Triggers blur state
  onSubmitChanges?: () => void; // Submits with new parameters
  hasChanges?: boolean;
  isBlurred?: boolean;
}) {
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [isEditingTimeframe, setIsEditingTimeframe] = useState(false);
  const [tempAccount, setTempAccount] = useState(account);
  const [tempTimeframe, setTempTimeframe] = useState(timeframe);
  
  // Handle both string and object account formats
  const getAccountDisplay = (acc: any) => {
    if (typeof acc === 'string') return acc;
    return acc?.alias || acc?.name || 'Unknown Account';
  };
  
  const getAccountId = (acc: any) => {
    if (typeof acc === 'string') return acc;
    return acc?.id || acc?.accountNumber || acc;
  };

  // Reset temp values when props change
  useEffect(() => {
    setTempAccount(account);
    setTempTimeframe(timeframe);
  }, [account, timeframe]);

  const handleAccountSelect = (newAccount: string) => {
    setTempAccount(newAccount);
  };

  const handleSaveAccount = () => {
    onAccountChange?.(tempAccount);
    setIsEditingAccount(false);
  };

  const handleSaveTimeframe = () => {
    onTimeframeChange?.(tempTimeframe);
    setIsEditingTimeframe(false);
  };

  const handleCancelAccount = () => {
    setTempAccount(account);
    setIsEditingAccount(false);
  };

  const handleCancelTimeframe = () => {
    setTempTimeframe(timeframe);
    setIsEditingTimeframe(false);
  };

  // Check if there are any changes for submit button visibility
  const hasAccountChange = tempAccount !== account;
  const hasTimeframeChange = tempTimeframe !== timeframe;
  const hasLocalChanges = hasAccountChange || hasTimeframeChange;
  const showSubmitButton = hasChanges || hasLocalChanges; // Use prop or local changes

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Complete Account Selector - Identical to TopNavigation with Accounts and Group tabs */}
      {isEditingAccount ? (
        <Popover open={isEditingAccount} onOpenChange={setIsEditingAccount}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1 hover-elevate h-6 px-2 ${
                isBlurred ? 'animate-pulse' : ''
              }`}
              data-testid="button-edit-account"
            >
              <Settings2 className="h-3 w-3" />
              <span className="text-xs">Selecting...</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
              {hasLocalChanges && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" align="start">
            <Tabs value="accounts" className="w-full">
              {/* Mode Switcher */}
              <div className="p-3 border-b">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="accounts">Accounts</TabsTrigger>
                  <TabsTrigger value="group">Group</TabsTrigger>
                </TabsList>
              </div>

              {/* Accounts Tab */}
              <TabsContent value="accounts" className="mt-0">
                <Command>
                  <div className="flex items-center border-b px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <CommandInput
                      placeholder="Search accounts..."
                      className="flex h-10 w-full"
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <CommandEmpty>No accounts found.</CommandEmpty>
                    <CommandGroup>
                      {availableAccounts.map((acc) => {
                        const accId = getAccountId(acc);
                        const accDisplay = getAccountDisplay(acc);
                        const isSelected = getAccountId(tempAccount) === accId;
                        return (
                          <CommandItem
                            key={accId}
                            value={`${typeof acc === 'object' ? acc.accountNumber : ''} ${accDisplay}`}
                            onSelect={() => handleAccountSelect(acc)}
                            className="flex items-center space-x-2 p-2 hover-elevate transition-all duration-200"
                            data-testid={`command-item-${accId}`}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                              isSelected
                                ? 'bg-primary border-primary' 
                                : 'border-border hover:border-primary/50'
                            }`}>
                              {isSelected && (
                                <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{accDisplay}</div>
                              {typeof acc === 'object' && acc.accountNumber && (
                                <div className="text-xs text-muted-foreground truncate">
                                  {acc.accountNumber} • {acc.type}
                                </div>
                              )}
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </div>
                </Command>
              </TabsContent>

              {/* Groups Tab */}
              <TabsContent value="group" className="mt-0">
                <Command>
                  <div className="flex items-center border-b px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <CommandInput
                      placeholder="Search groups..."
                      className="flex h-10 w-full"
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <CommandEmpty>No groups found.</CommandEmpty>
                    <CommandGroup>
                      <div className="p-2 text-xs text-muted-foreground">
                        Group selection functionality will be available when connected to app state.
                      </div>
                    </CommandGroup>
                  </div>
                </Command>
              </TabsContent>
            </Tabs>

            {/* Apply/Cancel buttons */}
            <div className="flex items-center justify-between p-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelAccount}
                data-testid="button-cancel-selection"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveAccount}
                disabled={!hasLocalChanges}
                data-testid="button-apply-selection"
              >
                Apply Changes
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        // Single Account Pill Display
        <Badge
          variant="outline"
          className={`text-xs transition-all duration-200 hover:scale-105 cursor-pointer group relative ${
            isBlurred ? 'opacity-60 grayscale' : 'hover:bg-primary/10'
          }`}
          onClick={() => {
            onPlaceholderEdit?.(); // Trigger blur state
            setIsEditingAccount(true);
          }}
          data-testid="badge-account-single"
        >
          <User className="h-3 w-3 mr-1" />
          {getAccountDisplay(account)}
          <Edit2 className="h-2 w-2 ml-1 opacity-0 group-hover:opacity-50 transition-opacity" />
          <ChevronDown className="h-2 w-2 ml-0.5 opacity-60 group-hover:opacity-80 transition-opacity" />
        </Badge>
      )}

      {/* Editable Timeframe - Using same Select as top navigation */}
      {isEditingTimeframe ? (
        <div className="flex items-center gap-1">
          <Select
            value={tempTimeframe}
            onValueChange={(value) => {
              setTempTimeframe(value);
              handleSaveTimeframe();
            }}
            data-testid="select-timeframe"
          >
            <SelectTrigger className="h-6 w-16 text-xs border-none bg-muted/50 hover:bg-muted px-2">
              <SelectValue>
                {availableTimeframes.find(tf => tf.value === tempTimeframe)?.short || tempTimeframe}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availableTimeframes.map((tf) => (
                <SelectItem key={tf.value} value={tf.value} className="text-xs">
                  {tf.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <Badge
          variant="secondary"
          className={`text-xs transition-all duration-200 hover:scale-105 cursor-pointer group relative ${
            isBlurred ? 'opacity-60 grayscale' : 'hover:bg-secondary/80'
          }`}
          onClick={() => {
            onPlaceholderEdit?.(); // Trigger blur state
            setIsEditingTimeframe(true);
          }}
          data-testid="badge-timeframe"
        >
          <Calendar className="h-3 w-3 mr-1" />
          {availableTimeframes.find(tf => tf.value === timeframe)?.label || timeframe}
          <Edit2 className="h-2 w-2 ml-1 opacity-0 group-hover:opacity-50 transition-opacity" />
          <ChevronDown className="h-2 w-2 ml-0.5 opacity-60 group-hover:opacity-80 transition-opacity" />
        </Badge>
      )}
      
      {/* Submit Changes Button - Appears when there are unsaved changes */}
      {hasChanges && (
        <Button
          size="sm"
          onClick={onSubmitChanges}
          className="h-6 px-3 gap-1 bg-primary hover:bg-primary/90 animate-in fade-in-0 slide-in-from-right-2 duration-200"
          data-testid="button-submit-placeholder-changes"
        >
          <RefreshCw className="h-3 w-3" />
          <span className="text-xs font-medium">Update Analysis</span>
        </Button>
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
  accounts = ["Growth Portfolio", "Conservative Fund"], // Keep for backward compatibility
  account = "Growth Portfolio", // Single account for new system
  timeframe = "Year to date",
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
  onResubmit,
  onQuestionSubmit
}: AnswerCardProps) {
  // State for interactive placeholders
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});
  const [hasModifiedPlaceholders, setHasModifiedPlaceholders] = useState(false);

  // Initialize placeholder values from question on first render
  useEffect(() => {
    if (question && Object.keys(placeholderValues).length === 0) {
      const initialValues: Record<string, string> = {};
      const placeholderRegex = /\{(\w+)\}/g;
      let match;
      
      while ((match = placeholderRegex.exec(question)) !== null) {
        const type = match[1].toLowerCase();
        if (!initialValues[type]) {
          initialValues[type] = DEFAULT_PLACEHOLDER_VALUES[type as keyof typeof DEFAULT_PLACEHOLDER_VALUES] || match[1];
        }
      }
      
      setPlaceholderValues(initialValues);
    }
  }, [question, placeholderValues]);

  const handlePlaceholderChange = (type: string, value: string) => {
    setPlaceholderValues(prev => ({ ...prev, [type]: value }));
    setHasModifiedPlaceholders(true);
  };

  const handleSubmitModifiedQuestion = () => {
    if (!onQuestionSubmit || !hasModifiedPlaceholders) return;
    
    // Replace placeholders in the question with current values
    let modifiedQuestion = question;
    Object.entries(placeholderValues).forEach(([type, value]) => {
      const regex = new RegExp(`\\{${type}\\}`, 'gi');
      modifiedQuestion = modifiedQuestion.replace(regex, value);
    });
    
    onQuestionSubmit(modifiedQuestion, placeholderValues);
    setHasModifiedPlaceholders(false);
  };
  
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
            <div className="mb-2">
              <h3 className="text-lg font-semibold group-hover:text-primary transition-colors duration-200" data-testid="text-question">
                {renderInteractiveQuestionText(question, placeholderValues, handlePlaceholderChange)}
              </h3>
              {/* Submit button for modified placeholders */}
              {hasModifiedPlaceholders && onQuestionSubmit && (
                <div className="mt-2 flex items-center gap-2">
                  <Button 
                    size="sm" 
                    onClick={handleSubmitModifiedQuestion}
                    className="gap-1.5 animate-in fade-in-0 slide-in-from-right-2 duration-300"
                    data-testid="button-submit-modified-question"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Ask Modified Question
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Click to get updated analysis
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <EditableBadgeSection
                account={account || accounts?.[0] || "Growth Portfolio"}
                timeframe={timeframe}
                availableAccounts={availableAccounts || [
                  { id: "ACC001", accountNumber: "DU0123456", name: "Johnson Family Trust", alias: "Johnson Family", type: "Trust", balance: 2450000, color: "bg-chart-1" },
                  { id: "ACC002", accountNumber: "DU0234567", name: "Smith Retirement IRA", alias: "Smith Retirement", type: "IRA", balance: 1850000, color: "bg-chart-2" },
                  { id: "ACC003", accountNumber: "DU0345678", name: "Wilson Tech Holdings", alias: "Wilson Tech", type: "Individual", balance: 980000, color: "bg-chart-4" }
                ]}
                availableTimeframes={availableTimeframes || [
                  { value: 'mtd', short: 'MTD', label: 'Month to Date' },
                  { value: 'ytd', short: 'YTD', label: 'Year to Date' },
                  { value: 'prev_month', short: 'PM', label: 'Previous Month' },
                  { value: 'prev_quarter', short: 'PQ', label: 'Previous Quarter' },
                  { value: 'prev_year', short: 'PY', label: 'Previous Year' },
                  { value: '1m', short: '1M', label: 'One Month' },
                  { value: '1y', short: '1Y', label: 'One Year' },
                ]}
                onAccountChange={(newAccount) => console.log('Account changed:', newAccount)}
                onTimeframeChange={onTimeframeChange}
                onPlaceholderEdit={() => console.log('Placeholder editing started')}
                onSubmitChanges={() => console.log('Submit changes clicked')}
                hasChanges={hasModifiedPlaceholders}
                isBlurred={false}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-xs gap-1 transition-all duration-200 hover:scale-105">
                    <Calendar className="h-3 w-3" />
                    As of {asOfDate}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Data as of this date</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover-elevate button-smooth hover:rotate-180"
                  onClick={handleRefresh}
                  data-testid="button-refresh"
                  aria-label="Refresh this analysis"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh this analysis</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover-elevate button-smooth hover:scale-110"
                  onClick={handleExport}
                  data-testid="button-export"
                  aria-label="Export analysis as PDF"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export analysis as PDF</p>
              </TooltipContent>
            </Tooltip>
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