import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SelectionProvider, useSelection } from "@/components/SelectionContext";
import TopNavigation from "@/components/TopNavigation";
import SearchOverlay from "@/components/SearchOverlay";
import AnswerCard from "@/components/AnswerCard";
import AnswerCardSkeleton from "@/components/AnswerCardSkeleton";
import { usePortfolioSummary } from "@/hooks/usePortfolioSummary";
import { useTypingAnimation } from "@/hooks/useTypingAnimation";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { apiService } from "@/lib/api";
import { ContentGenerator } from "@/lib/contentGenerator";
import { questionCatalog, type Category, type Question } from '@/lib/questionCatalog';
import EmptyStateLanding from './components/EmptyStateLanding';


// Timeframe options for display mapping
const timeframes = [
  { value: 'mtd', short: 'MTD', label: 'Month to Date' },
  { value: 'ytd', short: 'YTD', label: 'Year to Date' },
  { value: 'prev_month', short: 'PM', label: 'Previous Month' },
  { value: 'prev_quarter', short: 'PQ', label: 'Previous Quarter' },
  { value: 'prev_year', short: 'PY', label: 'Previous Year' },
  { value: '1m', short: '1M', label: 'One Month' },
  { value: '1y', short: '1Y', label: 'One Year' },
];

function FinSightDashboard() {
  const { theme, setTheme } = useTheme();
  
  // Use SelectionContext instead of local state
  const {
    selectionMode,
    selectedAccountIds,
    selectedGroupId,
    timeframe,
    setSelectionMode,
    setSelectedAccountIds,
    setSelectedGroupId,
    setTimeframe,
    updateSelection,
    resetSelection,
  } = useSelection();
  const [searchValue, setSearchValue] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Typing animation for placeholder text
  const placeholderQuestions = [
    "What's the YTD performance vs S&P 500?",
    "Show me the top 10 holdings by weight",
    "What's the portfolio's beta and volatility?", 
    "How is the portfolio allocated by sector?",
    "What are the biggest risk exposures?",
    "Which positions had the best performance?",
    "How much dividend income was generated?",
    "What's the expense ratio breakdown?",
    "Show me ESG scores for major holdings",
    "Compare returns to the benchmark"
  ];

  const { displayedText } = useTypingAnimation({
    questions: placeholderQuestions,
    isActive: !searchValue && !isSearchFocused,
    typingSpeed: 50,
    erasingSpeed: 30,
    pauseDuration: 2000
  });

  // Keyboard shortcuts for professional UX
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'k',
        ctrl: true,
        handler: () => setIsSearchFocused(true),
        description: 'Open search'
      },
      {
        key: 'k',
        meta: true, // Cmd on Mac
        handler: () => setIsSearchFocused(true),
        description: 'Open search'
      },
      {
        key: 'Escape',
        handler: () => {
          if (isSearchFocused) {
            handleCloseSearch();
          }
        },
        description: 'Close search overlay'
      }
    ]
  });
  
  const [answers, setAnswers] = useState<Array<{
    id: string;
    question: string;
    asOfDate: string;
    accounts: string[];
    timeframe: string;
    isUnmatched: boolean;
    isReview?: boolean;
    isError?: boolean;
    errorType?: 'network' | 'server' | 'timeout' | 'unknown';
    originalError?: string;
    message?: string;
    matchedAnswer?: {
      id: string;
      title: string;
      content: string;
      category?: string;
    };
    confidence?: "high" | "medium" | "low";
    backendResponse?: any;
    content?: {
      paragraph?: string;
      kpis?: any[];
      chartData?: any[];
      tableData?: any[];
      highlights?: string[];
      metrics?: any[];
    };
  }>>([]);
  const [newAnswerId, setNewAnswerId] = useState<string | null>(null);
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);
  const [refreshingAnswerId, setRefreshingAnswerId] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState<string>("");
  const [estimatedTime, setEstimatedTime] = useState<number>(0);
  const [isSearchTransitioning, setIsSearchTransitioning] = useState(false);
  const [forceAccountSelectorOpen, setForceAccountSelectorOpen] = useState(false);
  const [forceTimeframeSelectorOpen, setForceTimeframeSelectorOpen] = useState(false);
  const newAnswerRef = useRef<HTMLDivElement>(null);
  const topNavigationRef = useRef<any>(null);

  // Mock data - todo: replace with real data
  const mockAccountGroups = [
    {
      id: "growth-group",
      name: "Growth Strategy",
      description: "High-growth focused accounts",
      accountIds: ["ACC001", "ACC003", "ACC006"],
      color: "bg-chart-1"
    },
    {
      id: "conservative-group", 
      name: "Conservative Portfolio",
      description: "Low-risk stable investments",
      accountIds: ["ACC002", "ACC004", "ACC007"],
      color: "bg-chart-2"
    },
    {
      id: "sector-group",
      name: "Sector Diversification",
      description: "Sector-specific allocations",
      accountIds: ["ACC005", "ACC008", "ACC009"],
      color: "bg-chart-4"
    }
  ];

  const mockAllAccounts = [
    { id: "ACC001", accountNumber: "DU0123456", name: "Johnson Family Trust", alias: "Johnson Family", type: "Trust", balance: 2450000, color: "bg-chart-1" },
    { id: "ACC002", accountNumber: "DU0234567", name: "Smith Retirement IRA", alias: "Smith Retirement", type: "IRA", balance: 1850000, color: "bg-chart-2" },
    { id: "ACC003", accountNumber: "DU0345678", name: "Wilson Tech Holdings", alias: "Wilson Tech", type: "Individual", balance: 980000, color: "bg-chart-4" },
    { id: "ACC004", accountNumber: "DU0456789", name: "Davis Income Fund", alias: "Davis Income", type: "Joint", balance: 1200000, color: "bg-chart-3" },
    { id: "ACC005", accountNumber: "DU0567890", name: "Miller International", alias: "Miller International", type: "Trust", balance: 750000, color: "bg-chart-5" },
    { id: "ACC006", accountNumber: "DU0678901", name: "Brown Healthcare", alias: "Brown Healthcare", type: "Individual", balance: 650000, color: "bg-chart-1" },
    { id: "ACC007", accountNumber: "DU0789012", name: "Garcia Energy LLC", alias: "Garcia Energy", type: "LLC", balance: 420000, color: "bg-chart-2" },
    { id: "ACC008", accountNumber: "DU0890123", name: "Anderson REIT", alias: "Anderson REIT", type: "REIT", balance: 890000, color: "bg-chart-4" },
    { id: "ACC009", accountNumber: "DU0901234", name: "Thompson Emerging", alias: "Thompson Emerging", type: "Individual", balance: 540000, color: "bg-chart-3" },
    { id: "ACC010", accountNumber: "DU1012345", name: "Lee Family 529", alias: "Lee Family", type: "529 Plan", balance: 320000, color: "bg-chart-5" }
  ];

  // Timeframes for consistent display across components
  const timeframes = [
    { value: 'mtd', short: 'MTD', label: 'Month to Date' },
    { value: 'ytd', short: 'YTD', label: 'Year to Date' },
    { value: 'prev_month', short: 'PM', label: 'Previous Month' },
    { value: 'prev_quarter', short: 'PQ', label: 'Previous Quarter' },
    { value: 'prev_year', short: 'PY', label: 'Previous Year' },
    { value: '1m', short: '1M', label: 'One Month' },
    { value: '1y', short: '1Y', label: 'One Year' },
  ];

  // Derived state: compute selectedAccounts from current selection mode
  const selectedAccounts = useMemo(() => {
    if (selectionMode === 'accounts') {
      return mockAllAccounts.filter(acc => selectedAccountIds.has(acc.id));
    } else if (selectedGroupId) {
      const group = mockAccountGroups.find(g => g.id === selectedGroupId);
      if (group) {
        return mockAllAccounts.filter(acc => group.accountIds.includes(acc.id));
      }
    }
    return [];
  }, [selectionMode, selectedAccountIds, selectedGroupId]);

  // Generate display text for empty state based on selection mode
  const getAnalysisDisplayText = useMemo(() => {
    if (selectionMode === 'group' && selectedGroupId) {
      const group = mockAccountGroups.find(g => g.id === selectedGroupId);
      if (group) {
        return `${group.name} (${selectedAccounts.length} account${selectedAccounts.length !== 1 ? 's' : ''})`;
      }
    }
    return `${selectedAccounts.length} account${selectedAccounts.length !== 1 ? 's' : ''}`;
  }, [selectionMode, selectedGroupId, selectedAccounts.length]);



  // Selection handlers
  const handleSelectionModeChange = (mode: 'accounts' | 'group') => {
    if (mode === selectionMode) return;
    
    if (mode === 'accounts') {
      // Switch to accounts mode: clear group selection and keep current accounts
      // If no accounts selected, select first account to ensure minimum selection
      if (selectedAccountIds.size === 0) {
        setSelectedAccountIds(new Set([mockAllAccounts[0].id]));
      }
      setSelectedGroupId(null);
    } else {
      // Switch to group mode: clear account selection and select first group
      setSelectedGroupId(mockAccountGroups[0].id);
      setSelectedAccountIds(new Set());
    }
    setSelectionMode(mode);
  };

  const handleAccountSelection = (accountIds: Set<string>) => {
    // Ensure at least one account is selected
    if (accountIds.size === 0) {
      return;
    }
    setSelectedAccountIds(accountIds);
  };

  const handleGroupSelection = (groupId: string) => {
    setSelectionMode('group'); // Set mode to group when group is selected
    setSelectedGroupId(groupId);
  };

  // Smooth scroll to new answer when created - but skip if skeleton already scrolled
  useEffect(() => {
    if (newAnswerId && newAnswerRef.current) {
      // Only scroll if this is not the first answer (skeleton handles first answer scroll)
      if (answers.length > 1) {
        // Small delay to ensure the answer is rendered
        setTimeout(() => {
          // Scroll the new answer into view
          newAnswerRef.current?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
        }, 100);
      }
      
      // Clear the highlight after a delay
      setTimeout(() => {
        setNewAnswerId(null);
      }, 2000);
    }
  }, [newAnswerId, answers.length]);

  const handleSearchSubmit = async (question: string) => {
    setSearchValue("");
    setIsSearchFocused(false);
    setIsGeneratingAnswer(true);
    setLoadingProgress(0);
    
    // Start search transition animation if this is the first question
    if (answers.length === 0) {
      setIsSearchTransitioning(true);
    }
    
    // Scroll to where the loading skeleton will appear after overlay closes and animation starts
    const scrollToSkeleton = () => {
      // Target skeleton specifically during loading phase
      const scrollTarget = document.querySelector('[data-loading-skeleton-first]') || 
                          document.querySelector('[data-loading-skeleton]');
      if (scrollTarget) {
        scrollTarget.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
        return true;
      }
      return false;
    };

    // Try to scroll after DOM updates
    setTimeout(() => {
      if (!scrollToSkeleton()) {
        // If first attempt fails, try again with a longer delay
        setTimeout(scrollToSkeleton, 100);
      }
    }, answers.length === 0 ? 200 : 150);
    
    // Define loading stages with estimated times
    const loadingStages = [
      { message: "Processing your question...", duration: 500, progress: 25 },
      { message: "Searching knowledge base...", duration: 800, progress: 50 },
      { message: "Analyzing context and accounts...", duration: 600, progress: 75 },
      { message: "Generating response...", duration: 400, progress: 100 }
    ];
    
    // Set estimated total time
    const totalTime = loadingStages.reduce((sum, stage) => sum + stage.duration, 0);
    setEstimatedTime(Math.ceil(totalTime / 1000));

    try {
      // Execute loading stages while processing
      const loadingPromise = (async () => {
        for (let i = 0; i < loadingStages.length; i++) {
          const stage = loadingStages[i];
          setLoadingStage(stage.message);
          setLoadingProgress(stage.progress);
          await new Promise(resolve => setTimeout(resolve, stage.duration));
        }
      })();

      // Prepare context for the backend
      const context = {
        accounts: selectedAccounts.map(acc => acc.id),
        timeframe: timeframe,
        selectionMode: selectionMode,
      };

      // Submit question to backend
      const apiPromise = apiService.submitQuestion({
        question: question,
        context: context,
      });

      // Wait for both loading animation and API call
      const [_, response] = await Promise.all([loadingPromise, apiPromise]);

      const answerId = response.id || Date.now().toString();
      
      // Create answer based on backend response
      const baseAnswer = {
        id: answerId,
        question,
        asOfDate: new Date().toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }),
        accounts: selectedAccounts.map(acc => `${acc.alias || acc.name} (${acc.accountNumber})`),
        timeframe: timeframe,
        backendResponse: response,
      };

      if (response.status === "matched" && response.answer) {
        // Generate rich content from backend answer data
        const generatedContent = ContentGenerator.generateContent(response.answer);
        
        // Successful match found
        const newAnswer = {
          ...baseAnswer,
          isUnmatched: false,
          matchedAnswer: response.answer,
          confidence: response.confidence,
          message: response.message,
          content: generatedContent,
        };
        setAnswers(prev => [newAnswer, ...prev]);
      } else if (response.status === "no_match" && response.answer) {
        // Smart fallback with contextual answer data
        const fallbackContent = {
          paragraph: response.answer.content,
          fallbackType: response.answer.data?.fallbackType,
          actionText: response.answer.data?.actionText,
          isUnmatched: true,
        };
        
        const smartFallbackAnswer = {
          ...baseAnswer,
          isUnmatched: true,
          matchedAnswer: response.answer,
          message: response.message,
          content: fallbackContent,
        };
        setAnswers(prev => [smartFallbackAnswer, ...prev]);
      } else if (response.status === "review") {
        // Question sent for review
        const reviewAnswer = {
          ...baseAnswer,
          isUnmatched: false,
          isReview: true,
          message: response.message || "Question sent for expert review",
        };
        setAnswers(prev => [reviewAnswer, ...prev]);
      } else {
        // No match found (fallback for any other case)
        const noMatchAnswer = {
          ...baseAnswer,
          isUnmatched: true,
          message: response.message || "No matching answer found",
        };
        setAnswers(prev => [noMatchAnswer, ...prev]);
      }

      setNewAnswerId(answerId);

    } catch (error) {
      
      // Categorize the error type
      let errorType: 'network' | 'server' | 'timeout' | 'unknown' = 'unknown';
      let errorMessage = "Sorry, there was an error processing your question. Please try again.";
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorType = 'network';
        errorMessage = "Unable to connect to the server. Please check your internet connection.";
      } else if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('TimeoutError')) {
          errorType = 'timeout';
          errorMessage = "The request timed out. Please try again.";
        } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
          errorType = 'server';
          errorMessage = "Server error occurred. We're working to resolve this.";
        }
      }
      
      // Create error answer with enhanced error details
      const errorAnswer = {
        id: Date.now().toString(),
        question,
        asOfDate: new Date().toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }),
        accounts: selectedAccounts.map(acc => `${acc.alias || acc.name} (${acc.accountNumber})`),
        timeframe: timeframe,
        isUnmatched: true,
        isError: true,
        errorType: errorType,
        message: errorMessage,
        originalError: error instanceof Error ? error.message : 'Unknown error occurred',
      };
      
      setAnswers(prev => [errorAnswer, ...prev]);
      setNewAnswerId(errorAnswer.id);
    } finally {
      setIsGeneratingAnswer(false);
      setLoadingProgress(0);
      setLoadingStage("");
      setEstimatedTime(0);
      
      // Complete search transition animation after a short delay
      if (isSearchTransitioning) {
        setTimeout(() => {
          setIsSearchTransitioning(false);
        }, 500);
      }
    }
  };

  const handleFollowUpClick = (question: string) => {
    handleSearchSubmit(question);
  };

  // Handler to refresh a specific answer with new timestamp and slightly varied data
  const handleRefreshAnswer = useCallback(async (answerId: string) => {
    // Set refreshing state to show loading
    setRefreshingAnswerId(answerId);

    // Add loading delay to show skeleton
    await new Promise(resolve => setTimeout(resolve, 2000));

    setAnswers(prev => prev.map(answer => {
      if (answer.id !== answerId) {
        return answer; // Only update the specific answer being refreshed
      }

      // Update the timestamp with full date and time including seconds for the specific answer
      const now = new Date();
      const updatedAnswer = {
        ...answer,
        asOfDate: now.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      };

      // If the answer has content with KPIs, slightly randomize them to simulate fresh data
      if (answer.content?.kpis) {
        const updatedKPIs = answer.content.kpis.map(kpi => {
          // Add small random variation to make refresh feel real
          const variation = (Math.random() - 0.5) * 0.2; // ±0.1% variation
          const baseValue = parseFloat(kpi.value.replace(/[^\d.-]/g, ''));
          
          if (!isNaN(baseValue)) {
            const newValue = baseValue + variation;
            const suffix = kpi.value.includes('%') ? '%' : '';
            const prefix = kpi.value.includes('+') ? '+' : '';
            
            return {
              ...kpi,
              value: `${prefix}${newValue.toFixed(1)}${suffix}`
            };
          }
          return kpi;
        });

        updatedAnswer.content = {
          ...answer.content,
          kpis: updatedKPIs
        };
      }

      return updatedAnswer;
    }));

    // Clear refreshing state
    setRefreshingAnswerId(null);

    // Briefly highlight the refreshed answer
    setNewAnswerId(answerId);
    setTimeout(() => setNewAnswerId(null), 1500);
  }, []);

  // Close search overlay handler
  const handleCloseSearch = useCallback(() => {
    setIsSearchFocused(false);
  }, []);

  // Handler to open account selector
  const handleOpenAccountSelector = useCallback(() => {
    // Trigger account selector by clicking the button
    setTimeout(() => {
      const accountSelectorButton = document.querySelector('[data-testid="button-account-selector"]');
      if (accountSelectorButton) {
        (accountSelectorButton as HTMLElement).click();
      }
    }, 100);
  }, []);

  // Handler to open timeframe selector
  const handleOpenTimeframeSelector = useCallback(() => {
    // Trigger timeframe selector by clicking the trigger
    setTimeout(() => {
      const timeframeSelectorTrigger = document.querySelector('[data-timeframe-selector]');
      if (timeframeSelectorTrigger) {
        (timeframeSelectorTrigger as HTMLElement).click();
      }
    }, 100);
  }, []);

  // Portfolio summary data that updates with account selection
  const { 
    data: portfolioSummary, 
    isLoading: portfolioLoading, 
    error: portfolioError 
  } = usePortfolioSummary(selectedAccounts, timeframe);

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: value >= 1000000 ? 1 : 0,
      notation: value >= 1000000 ? 'compact' : 'standard',
      compactDisplay: 'short'
    }).format(value);
  };

  // Format percentage values
  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
      signDisplay: 'always'
    }).format(value);
  };

  // Format ratio values
  const formatRatio = (value: number) => {
    return value.toFixed(2);
  };

  // Handle escape key to close overlay
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSearchFocused) {
        handleCloseSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchFocused, handleCloseSearch]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Overlay backdrop - click to close */}
      {isSearchFocused && (
        <div 
          className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[60] transition-all duration-300"
          onClick={handleCloseSearch}
          data-testid="search-overlay-backdrop"
        />
      )}
      
      {/* Top Navigation */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 flex-shrink-0">
        <TopNavigation
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onSearchFocus={() => setIsSearchFocused(true)}
          allAccounts={mockAllAccounts}
          accountGroups={mockAccountGroups}
          theme={theme}
          onThemeChange={setTheme}
          hideSearch={(answers.length === 0 && !isSearchTransitioning) || isSearchFocused}
        />
      </div>
      
      {/* Search Overlay - positioned outside header to be above backdrop */}
      <div className="fixed top-0 left-0 right-0 z-[70] pointer-events-none">
        <div className="relative max-w-4xl mx-auto px-4 pointer-events-auto">
          <SearchOverlay 
            isOpen={isSearchFocused}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            onQuestionSelect={handleSearchSubmit}
            onCategorySelect={(category) => {}}
            onClose={handleCloseSearch}
          />
        </div>
      </div>


      {/* Main Content */}
<main className="flex-1 overflow-hidden relative">
  <div className="h-full flex flex-col">
    {/* Scroll container (single source of truth for scrolling) */}
    {(() => {
      const isEmpty = answers.length === 0 && !isGeneratingAnswer
    ;return (
      <div
        className={[
          "flex-1 min-w-0",
          // make this the scroll root
          "overflow-y-auto overscroll-contain scroll-smooth",
          // anchor jumps (rail dots) won't hide under header
          "scroll-pt-[var(--nav-h,64px)]",
          // enable scroll snap only for empty state
          isEmpty ? "scroll-snap-container" : "",
          // avoid double padding when the empty state supplies its own spacing
          isEmpty ? "px-0 py-0" : "px-2 sm:px-4 py-4 sm:py-6",
        ].join(" ")}
      >
        <div className="max-w-none mx-auto">
          {/* Show skeleton immediately when first answer is loading */}
          {isGeneratingAnswer && answers.length === 0 && (
            <div
              data-loading-skeleton-first
              className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
            >
              <AnswerCardSkeleton
                loadingStage={loadingStage}
                loadingProgress={loadingProgress}
                estimatedTime={estimatedTime}
                allAccounts={mockAllAccounts}
                accountGroups={mockAccountGroups}
              />
            </div>
          )}

          {isEmpty ? (
            <EmptyStateLanding
              isSearchTransitioning={isSearchTransitioning}
              displayedText={displayedText}
              getAnalysisDisplayText={getAnalysisDisplayText}
              timeframeLabel={timeframes.find(tf => tf.value === timeframe)?.label || timeframe}
              questionCatalog={questionCatalog as any}
              onOpenSearch={() => setIsSearchFocused(true)}
              onAsk={(q) => handleSearchSubmit(q)}
              onOpenAccountSelector={handleOpenAccountSelector}
              onOpenTimeframeSelector={handleOpenTimeframeSelector}
            />
          ) : (
            <div className="space-y-6">
              {/* skeleton while generating subsequent answers */}
              {isGeneratingAnswer && answers.length > 0 && (
                <div
                  data-loading-skeleton
                  className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
                >
                  <AnswerCardSkeleton
                    loadingStage={loadingStage}
                    loadingProgress={loadingProgress}
                    estimatedTime={estimatedTime}
                    allAccounts={mockAllAccounts}
                    accountGroups={mockAccountGroups}
                  />
                </div>
              )}

              {answers.map((answer) => (
                <div
                  key={answer.id}
                  ref={answer.id === newAnswerId ? newAnswerRef : null}
                  data-answer-card
                  data-answer-id={answer.id}
                  className={`transition-all duration-1000 ${
                    answer.id === newAnswerId ? "ring-2 ring-primary/30 shadow-lg rounded-lg" : ""
                  }`}
                >
                  {refreshingAnswerId === answer.id ? (
                    <AnswerCardSkeleton
                      loadingStage="Refreshing analysis..."
                      loadingProgress={0.5}
                      estimatedTime={1000}
                      allAccounts={mockAllAccounts}
                      accountGroups={mockAccountGroups}
                    />
                  ) : (
                    <AnswerCard
                      question={answer.question}
                      asOfDate={answer.asOfDate}
                      accounts={answer.accounts}
                      timeframe={answer.timeframe}
                      isUnmatched={answer.isUnmatched || answer.isReview || answer.isError}
                      content={answer.content}
                      answerId={answer.matchedAnswer?.id}
                      onFollowUpClick={handleFollowUpClick}
                      onRefresh={() => handleRefreshAnswer(answer.id)}
                      onExport={() => {}}
                      onQuestionSubmit={handleSearchSubmit}
                      isRefreshing={refreshingAnswerId === answer.id}
                      isError={answer.isError}
                      errorType={answer.errorType}
                      originalError={answer.originalError}
                      message={answer.message}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )})()}
  </div>
</main>

    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider defaultTheme="dark">
          <SelectionProvider>
            <ErrorBoundary>
              <FinSightDashboard />
            </ErrorBoundary>
          </SelectionProvider>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
