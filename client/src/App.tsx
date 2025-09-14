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
import TopNavigation from "@/components/TopNavigation";
import SearchOverlay from "@/components/SearchOverlay";
import AnswerCard from "@/components/AnswerCard";
import AnswerCardSkeleton from "@/components/AnswerCardSkeleton";
import { usePortfolioSummary } from "@/hooks/usePortfolioSummary";
import { useTypingAnimation } from "@/hooks/useTypingAnimation";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { apiService } from "@/lib/api";
import { ContentGenerator } from "@/lib/contentGenerator";


function FinSightDashboard() {
  const { theme, setTheme } = useTheme();
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
  const [selectionMode, setSelectionMode] = useState<'accounts' | 'group'>('accounts');
  const [selectedAccountIds, setSelectedAccountIds] = useState(new Set(['ACC001', 'ACC002']));
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState("ytd");
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
    { id: "ACC001", accountNumber: "10001", name: "Johnson Family Trust", alias: "Growth Portfolio", type: "Trust", balance: 2450000, color: "bg-chart-1" },
    { id: "ACC002", accountNumber: "10002", name: "Smith Retirement IRA", alias: "Conservative Fund", type: "IRA", balance: 1850000, color: "bg-chart-2" },
    { id: "ACC003", accountNumber: "10003", name: "Wilson Tech Holdings", alias: "Tech Allocation", type: "Individual", balance: 980000, color: "bg-chart-4" },
    { id: "ACC004", accountNumber: "10004", name: "Davis Income Fund", alias: "Income Portfolio", type: "Joint", balance: 1200000, color: "bg-chart-3" },
    { id: "ACC005", accountNumber: "10005", name: "Miller International", alias: "Global Fund", type: "Trust", balance: 750000, color: "bg-chart-5" },
    { id: "ACC006", accountNumber: "10006", name: "Brown Healthcare", alias: "Health Sector", type: "Individual", balance: 650000, color: "bg-chart-1" },
    { id: "ACC007", accountNumber: "10007", name: "Garcia Energy LLC", alias: "Energy Investment", type: "LLC", balance: 420000, color: "bg-chart-2" },
    { id: "ACC008", accountNumber: "10008", name: "Anderson REIT", alias: "Real Estate Fund", type: "REIT", balance: 890000, color: "bg-chart-4" },
    { id: "ACC009", accountNumber: "10009", name: "Thompson Emerging", type: "Individual", balance: 540000, color: "bg-chart-3" },
    { id: "ACC010", accountNumber: "10010", name: "Lee Family 529", alias: "Education Fund", type: "529 Plan", balance: 320000, color: "bg-chart-5" }
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
        timeframe: timeframe.toUpperCase(),
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
        timeframe: timeframe.toUpperCase(),
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
                <div className="max-w-4xl mx-auto py-4 lg:py-6">
                  {/* Compact Search Hero Section */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    
                    <h1 className="text-3xl lg:text-4xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      Ask about your portfolio
                    </h1>
                    <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                      Get instant analytics and insights by asking questions about your selected accounts
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
                        Currently analyzing <span className="font-medium">{selectedAccounts.length} account{selectedAccounts.length !== 1 ? 's' : ''}</span> • <span className="font-medium">{timeframe.toUpperCase()}</span> timeframe
                      </p>
                    </div>
                    
                    {/* Quick Action Chips */}
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                      {['YTD Performance', 'Risk Analysis', 'Top Holdings', 'Sector Allocation'].map((chip) => (
                        <button
                          key={chip}
                          onClick={() => {
                            const questions = {
                              'YTD Performance': "What's the YTD performance vs S&P 500?",
                              'Risk Analysis': "What's the portfolio's beta and volatility?", 
                              'Top Holdings': "Show me the top 10 holdings by weight",
                              'Sector Allocation': "How is the portfolio allocated by sector?"
                            };
                            handleSearchSubmit(questions[chip as keyof typeof questions]);
                          }}
                          className="px-4 py-2 rounded-full border bg-background/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sample Questions - Expanded */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div className="bg-card border rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-chart-1/10 rounded-lg mr-3">
                          <svg className="w-5 h-5 text-chart-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold">Performance Analysis</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start h-auto p-3 text-left"
                          onClick={() => handleSearchSubmit("What's the YTD performance vs S&P 500?")}
                        >
                          <div>
                            <div className="font-medium">Performance vs Benchmark</div>
                            <div className="text-xs text-muted-foreground">Compare YTD returns against S&P 500</div>
                          </div>
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start h-auto p-3 text-left"
                          onClick={() => handleSearchSubmit("What's the portfolio's beta and volatility?")}
                        >
                          <div>
                            <div className="font-medium">Risk Metrics Analysis</div>
                            <div className="text-xs text-muted-foreground">View beta, volatility, and risk measures</div>
                          </div>
                        </Button>
                      </div>
                    </div>

                    <div className="bg-card border rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-chart-2/10 rounded-lg mr-3">
                          <svg className="w-5 h-5 text-chart-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold">Portfolio Composition</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start h-auto p-3 text-left"
                          onClick={() => handleSearchSubmit("Show me the top 10 holdings by weight")}
                        >
                          <div>
                            <div className="font-medium">Top Holdings Analysis</div>
                            <div className="text-xs text-muted-foreground">View largest positions and weightings</div>
                          </div>
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start h-auto p-3 text-left"
                          onClick={() => handleSearchSubmit("Show sector allocation breakdown")}
                        >
                          <div>
                            <div className="font-medium">Sector Allocation</div>
                            <div className="text-xs text-muted-foreground">Analyze diversification by sector</div>
                          </div>
                        </Button>
                      </div>
                    </div>

                    <div className="bg-card border rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-chart-3/10 rounded-lg mr-3">
                          <svg className="w-5 h-5 text-chart-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold">Trading Activity</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start h-auto p-3 text-left"
                          onClick={() => handleSearchSubmit("What were the largest trades last month?")}
                        >
                          <div>
                            <div className="font-medium">Recent Large Trades</div>
                            <div className="text-xs text-muted-foreground">Review significant portfolio transactions</div>
                          </div>
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start h-auto p-3 text-left"
                          onClick={() => handleSearchSubmit("Show me recent portfolio activity summary")}
                        >
                          <div>
                            <div className="font-medium">Activity Summary</div>
                            <div className="text-xs text-muted-foreground">Overview of recent portfolio changes</div>
                          </div>
                        </Button>
                      </div>
                    </div>

                    <div className="bg-card border rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-chart-4/10 rounded-lg mr-3">
                          <svg className="w-5 h-5 text-chart-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold">Attribution Analysis</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start h-auto p-3 text-left"
                          onClick={() => handleSearchSubmit("What's driving current performance attribution?")}
                        >
                          <div>
                            <div className="font-medium">Performance Drivers</div>
                            <div className="text-xs text-muted-foreground">Identify key contributors to returns</div>
                          </div>
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start h-auto p-3 text-left"
                          onClick={() => handleSearchSubmit("How did tech sector allocation perform?")}
                        >
                          <div>
                            <div className="font-medium">Sector Performance</div>
                            <div className="text-xs text-muted-foreground">Analyze sector-specific returns</div>
                          </div>
                        </Button>
                      </div>
                    </div>

                    <div className="bg-card border rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-chart-5/10 rounded-lg mr-3">
                          <svg className="w-5 h-5 text-chart-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold">Income & Dividends</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start h-auto p-3 text-left"
                          onClick={() => handleSearchSubmit("How much dividend income was generated this year?")}
                        >
                          <div>
                            <div className="font-medium">Dividend Income YTD</div>
                            <div className="text-xs text-muted-foreground">Track dividend payments and yield</div>
                          </div>
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start h-auto p-3 text-left"
                          onClick={() => handleSearchSubmit("What are the highest dividend-yielding positions?")}
                        >
                          <div>
                            <div className="font-medium">Top Dividend Stocks</div>
                            <div className="text-xs text-muted-foreground">Identify best income generators</div>
                          </div>
                        </Button>
                      </div>
                    </div>

                    <div className="bg-card border rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-emerald-500/10 rounded-lg mr-3">
                          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold">ESG & Sustainability</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start h-auto p-3 text-left"
                          onClick={() => handleSearchSubmit("Show me ESG scores for major holdings")}
                        >
                          <div>
                            <div className="font-medium">ESG Ratings Analysis</div>
                            <div className="text-xs text-muted-foreground">Review sustainability metrics</div>
                          </div>
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start h-auto p-3 text-left"
                          onClick={() => handleSearchSubmit("What's the portfolio's carbon footprint?")}
                        >
                          <div>
                            <div className="font-medium">Carbon Impact Assessment</div>
                            <div className="text-xs text-muted-foreground">Measure environmental footprint</div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Getting Started Tips */}
                  <div className="bg-muted/30 border rounded-lg p-6">
                    <h3 className="font-semibold mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Getting Started
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-xs font-semibold text-primary">1</span>
                        </div>
                        <div>
                          <span className="font-medium">Select Your Context</span>
                          <p className="text-muted-foreground">Use the account selector above to choose individual accounts or account groups</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-xs font-semibold text-primary">2</span>
                        </div>
                        <div>
                          <span className="font-medium">Ask Questions</span>
                          <p className="text-muted-foreground">Type questions in natural language or use the search bar above</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-xs font-semibold text-primary">3</span>
                        </div>
                        <div>
                          <span className="font-medium">Set Timeframe</span>
                          <p className="text-muted-foreground">Adjust the timeframe in the context bar to focus your analysis</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-xs font-semibold text-primary">4</span>
                        </div>
                        <div>
                          <span className="font-medium">Explore Insights</span>
                          <p className="text-muted-foreground">Follow up on answers with related questions to dive deeper</p>
                        </div>
                      </div>
                    </div>
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
                        onFollowUpClick={handleFollowUpClick}
                        onRefresh={() => console.log('Refresh answer:', answer.id)}
                        onExport={() => console.log('Export answer:', answer.id)}
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
          <ErrorBoundary>
            <FinSightDashboard />
          </ErrorBoundary>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
