import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
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
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState<string>("");
  const [estimatedTime, setEstimatedTime] = useState<number>(0);
  const [isSearchTransitioning, setIsSearchTransitioning] = useState(false);
  const newAnswerRef = useRef<HTMLDivElement>(null);

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
    console.log('Selection mode changed to:', mode, 'cleared other mode');
  };

  const handleAccountSelection = (accountIds: Set<string>) => {
    // Ensure at least one account is selected
    if (accountIds.size === 0) {
      console.warn('Cannot deselect all accounts');
      return;
    }
    setSelectedAccountIds(accountIds);
    console.log('Account selection changed:', Array.from(accountIds));
  };

  const handleGroupSelection = (groupId: string) => {
    setSelectionMode('group'); // Set mode to group when group is selected
    setSelectedGroupId(groupId);
    console.log('Group selection changed:', groupId);
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
      console.log('Question processed by backend:', response);

    } catch (error) {
      console.error('Error submitting question:', error);
      
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

  // Close search overlay handler
  const handleCloseSearch = useCallback(() => {
    setIsSearchFocused(false);
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
          className="fixed inset-0 bg-black/20 z-[60]"
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
          selectedAccounts={selectedAccounts}
          selectionMode={selectionMode}
          selectedAccountIds={selectedAccountIds}
          selectedGroupId={selectedGroupId}
          onSelectionModeChange={handleSelectionModeChange}
          onAccountSelection={handleAccountSelection}
          onGroupSelection={handleGroupSelection}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
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
            onCategorySelect={(category) => console.log('Category:', category)}
            onClose={handleCloseSearch}
          />
        </div>
      </div>


      {/* Main Content */}
      <main className={`flex-1 ${isSearchFocused ? 'overflow-hidden' : 'overflow-hidden'}`}>
        <div className="h-full flex flex-col">
          {/* Main Content Area - Full width utilization */}
          <div className={`flex-1 min-w-0 px-2 sm:px-4 py-4 sm:py-6 ${isSearchFocused ? 'overflow-hidden' : 'overflow-y-auto'}`}>
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
                    selectedAccounts={selectedAccounts}
                    timeframe={timeframe}
                  />
                </div>
              )}
              
              {answers.length === 0 && !isGeneratingAnswer ? (
                <div className="max-w-4xl mx-auto py-6 lg:py-12">
                  {/* Above-the-fold Hero - Compact & Essential */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-2xl mb-6">
                      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    
                    <h1 className="text-3xl lg:text-4xl font-bold mb-3 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                      AI-Powered Portfolio Intelligence
                    </h1>
                    <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                      Ask questions in plain English • Get institutional insights instantly
                    </p>
                    
                    {/* Prominent Search Input */}
                    <div className={`max-w-2xl mx-auto mb-4 transition-all duration-1000 ease-out ${
                      isSearchTransitioning ? 'transform -translate-y-[calc(100vh-8rem)] scale-50 opacity-0' : ''
                    }`}>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <div className="relative w-full">
                          <input
                            type="text"
                            placeholder=""
                            className="w-full h-14 pl-12 pr-4 text-lg rounded-xl border-2 border-primary/30 bg-background/50 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-200 shadow-sm focus:shadow-md cursor-pointer"
                            value=""
                            readOnly
                            onFocus={() => setIsSearchFocused(true)}
                            onClick={() => setIsSearchFocused(true)}
                          />
                          {!searchValue && !isSearchFocused && (
                            <div className="absolute inset-0 pl-12 pr-4 h-14 flex items-center pointer-events-none">
                              <span className="text-lg text-muted-foreground/70 font-normal">
                                {displayedText}
                                <span className="animate-pulse ml-1 opacity-70">|</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Currently analyzing <span className="font-medium">{selectedAccounts.length} account{selectedAccounts.length !== 1 ? 's' : ''}</span> • <span className="font-medium">{timeframes.find(tf => tf.value === timeframe)?.label || timeframe}</span> timeframe
                      </p>
                    </div>
                    
                    {/* Essential Quick Actions - Above the Fold */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                      {[
                        { label: 'Performance vs S&P', question: "What's the YTD performance vs S&P 500?", icon: "📈", color: "from-green-500/10 to-green-600/10" },
                        { label: 'Risk Analysis', question: "What's the portfolio's beta and volatility?", icon: "⚖️", color: "from-orange-500/10 to-red-600/10" },
                        { label: 'Top Holdings', question: "Show me the top 10 holdings by weight", icon: "🏆", color: "from-blue-500/10 to-blue-600/10" },
                        { label: 'Sector Allocation', question: "How is the portfolio allocated by sector?", icon: "🏢", color: "from-purple-500/10 to-purple-600/10" }
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={() => handleSearchSubmit(item.question)}
                          className={`group p-4 rounded-xl border bg-gradient-to-br ${item.color} hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-1 text-left`}
                          data-testid={`quick-action-${item.label.toLowerCase().replace(' ', '-')}`}
                        >
                          <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{item.icon}</div>
                          <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                            {item.label}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Current Analysis Context - Prominent */}
                    <div className="bg-gradient-to-r from-primary/5 to-blue-500/5 border border-primary/20 rounded-xl p-4 mb-8">
                      <div className="flex items-center justify-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span className="text-muted-foreground">Analyzing</span>
                          <span className="font-semibold text-primary">
                            {selectedAccounts.length} account{selectedAccounts.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="h-4 w-px bg-border"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-muted-foreground">Timeframe</span>
                          <span className="font-semibold text-blue-600">
                            {timeframes.find(tf => tf.value === timeframe)?.label || timeframe}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sample Insight Preview - Shows Value Immediately */}
                  <div className="bg-gradient-to-br from-background/80 to-primary/5 border border-primary/10 rounded-xl p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Example: What you'll get</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Real-time data
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">+14.7%</div>
                        <div className="text-xs text-muted-foreground">YTD Return</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary mb-1">1.34</div>
                        <div className="text-xs text-muted-foreground">Sharpe Ratio</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">+3.5%</div>
                        <div className="text-xs text-muted-foreground">vs S&P 500</div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground text-center">
                      <span className="text-primary font-medium">Key Insight:</span> Your portfolio outperformed by 3.5%, driven primarily by tech sector allocation and superior risk management.
                    </p>
                  </div>

                </div>
              ) : (
                <div className="space-y-6">

                  {/* Show skeleton while generating subsequent answers */}
                  {isGeneratingAnswer && answers.length > 0 && (
                    <div data-loading-skeleton className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                      <AnswerCardSkeleton 
                        loadingStage={loadingStage}
                        loadingProgress={loadingProgress}
                        estimatedTime={estimatedTime}
                        selectedAccounts={selectedAccounts}
                        timeframe={timeframe}
                      />
                    </div>
                  )}
                  
                  {answers.map((answer, index) => (
                    <div
                      key={answer.id}
                      ref={answer.id === newAnswerId ? newAnswerRef : null}
                      data-answer-card
                      data-answer-id={answer.id}
                      className={`transition-all duration-1000 ${
                        answer.id === newAnswerId 
                          ? 'ring-2 ring-primary/30 shadow-lg rounded-lg' 
                          : ''
                      }`}
                    >
                      <AnswerCard
                        question={answer.question}
                        asOfDate={answer.asOfDate}
                        accounts={answer.accounts}
                        timeframe={answer.timeframe}
                        isUnmatched={answer.isUnmatched || answer.isReview || answer.isError}
                        content={answer.content}
                        answerId={answer.matchedAnswer?.id}
                        onFollowUpClick={handleFollowUpClick}
                        onRefresh={() => console.log('Refresh answer:', answer.id)}
                        onExport={() => console.log('Export answer:', answer.id)}
                        onQuestionSubmit={handleSearchSubmit}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
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
