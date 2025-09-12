import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";
import TopNavigation from "@/components/TopNavigation";
import SearchOverlay from "@/components/SearchOverlay";
import ContextBar from "@/components/ContextBar";
import AnswerCard from "@/components/AnswerCard";
import AnswerCardSkeleton from "@/components/AnswerCardSkeleton";
import { usePortfolioSummary } from "@/hooks/usePortfolioSummary";


function FinSightDashboard() {
  const { theme, setTheme } = useTheme();
  const [searchValue, setSearchValue] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
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
  }>>([]);
  const [newAnswerId, setNewAnswerId] = useState<string | null>(null);
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);
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

  // Smooth scroll to new answer when created
  useEffect(() => {
    if (newAnswerId && newAnswerRef.current) {
      // Small delay to ensure the answer is rendered
      setTimeout(() => {
        newAnswerRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
        
        // Clear the highlight after scrolling
        setTimeout(() => {
          setNewAnswerId(null);
        }, 2000);
      }, 100);
    }
  }, [newAnswerId]);

  // todo: remove mock functionality
  const handleSearchSubmit = async (question: string) => {
    setSearchValue("");
    setIsSearchFocused(false);
    setIsGeneratingAnswer(true);

    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check if the question matches existing predefined questions (improved matching logic)
    const allPredefinedQuestions = [
      "What's the YTD performance vs S&P 500?",
      "Show me the top 10 holdings by weight",
      "What's the portfolio's beta and volatility?",
      "How did tech sector allocation perform?",
      "What were the largest trades last month?",
      "Show sector allocation breakdown",
      "Compare risk-adjusted returns to benchmark",
      "What's driving current performance attribution?",
      "Show me recent portfolio activity summary",
      "How is the portfolio allocated by asset class?",
      "What are my portfolio's risk metrics?",
      "How has my portfolio performed this quarter?",
      "Show me asset allocation details",
      "What are the performance drivers?",
      "Display recent trading activity"
    ];

    // Improved matching with better similarity checking
    const normalizedInput = question.toLowerCase().trim();
    const isMatchedQuestion = allPredefinedQuestions.some(predefined => {
      const normalizedPredefined = predefined.toLowerCase();
      
      // Exact substring match
      if (normalizedPredefined.includes(normalizedInput) || normalizedInput.includes(normalizedPredefined)) {
        return true;
      }
      
      // Keyword-based matching for common financial terms
      const inputWords = normalizedInput.split(/\s+/);
      const predefinedWords = normalizedPredefined.split(/\s+/);
      
      // Check for significant keyword overlap (at least 2 meaningful words)
      const meaningfulWords = inputWords.filter(word => 
        word.length > 3 && !['what', 'show', 'how', 'the', 'and', 'are', 'my'].includes(word)
      );
      
      if (meaningfulWords.length >= 2) {
        const matches = meaningfulWords.filter(word => 
          predefinedWords.some(pWord => pWord.includes(word) || word.includes(pWord))
        );
        return matches.length >= Math.min(2, meaningfulWords.length);
      }
      
      return false;
    });

    const answerId = Date.now().toString();
    
    if (isMatchedQuestion) {
      // Create a regular answer for matched questions
      const newAnswer = {
        id: answerId,
        question,
        asOfDate: new Date().toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        accounts: selectedAccounts.map(acc => `${acc.alias || acc.name} (${acc.accountNumber})`),
        timeframe: timeframe.toUpperCase(),
        isUnmatched: false
      };
      setAnswers(prev => [newAnswer, ...prev]);
    } else {
      // Create a fallback answer for unmatched questions
      const fallbackAnswer = {
        id: answerId,
        question,
        asOfDate: new Date().toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        accounts: selectedAccounts.map(acc => `${acc.alias || acc.name} (${acc.accountNumber})`),
        timeframe: timeframe.toUpperCase(),
        isUnmatched: true
      };
      setAnswers(prev => [fallbackAnswer, ...prev]);
      
      // todo: Save to backend for future addition
      console.log('Unmatched question saved for future addition:', question);
    }
    
    setNewAnswerId(answerId);
    setIsGeneratingAnswer(false);
    console.log('New question submitted:', question);
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
          theme={theme}
          onThemeChange={setTheme}
        />
        
        {/* Search Overlay */}
        <div className="relative max-w-4xl mx-auto px-4">
          <SearchOverlay 
            isOpen={isSearchFocused}
            searchValue={searchValue}
            onQuestionSelect={handleSearchSubmit}
            onCategorySelect={(category) => console.log('Category:', category)}
            onClose={handleCloseSearch}
          />
        </div>
        
        {/* Overlay backdrop - click to close */}
        {isSearchFocused && (
          <div 
            className="fixed inset-0 bg-black/20 z-40"
            onClick={handleCloseSearch}
            data-testid="search-overlay-backdrop"
          />
        )}
      </div>

      {/* Context Bar */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/20 flex-shrink-0">
        <ContextBar 
          selectedAccounts={selectedAccounts}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Main Content Area - Full width utilization */}
          <div className="flex-1 min-w-0 px-2 sm:px-4 py-4 sm:py-6 overflow-y-auto">
            <div className="max-w-none mx-auto">
              {answers.length === 0 ? (
                <div className="max-w-4xl mx-auto py-8 lg:py-12">
                  {/* Hero Section */}
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-xl mb-6">
                      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold mb-4">Welcome to FinSight</h1>
                    <p className="text-lg text-muted-foreground mb-2">
                      Professional portfolio analytics and investment insights
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Currently analyzing {selectedAccounts.length} account{selectedAccounts.length !== 1 ? 's' : ''} • {timeframe.toUpperCase()} timeframe
                    </p>
                  </div>

                  {/* Sample Questions by Category */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
                  {/* Portfolio Summary - Only show when there are answers */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Portfolio Summary</h3>
                      {portfolioLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </div>
                    
                    {portfolioError ? (
                      <div className="p-4 bg-destructive/10 rounded-md border border-destructive/20">
                        <div className="text-sm text-destructive">Error loading portfolio data</div>
                      </div>
                    ) : portfolioLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-card rounded-lg border">
                          <Skeleton className="h-8 w-20 mb-2" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="p-4 bg-card rounded-lg border">
                          <Skeleton className="h-8 w-24 mb-2" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <div className="p-4 bg-card rounded-lg border">
                          <Skeleton className="h-8 w-16 mb-2" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-card rounded-lg border">
                          <div className={`text-2xl font-mono font-bold transition-colors duration-200 ${
                            portfolioSummary?.ytdReturn && portfolioSummary.ytdReturn > 0 
                              ? 'text-chart-2' 
                              : portfolioSummary?.ytdReturn && portfolioSummary.ytdReturn < 0 
                                ? 'text-destructive' 
                                : 'text-muted-foreground'
                          }`}>
                            {portfolioSummary ? formatPercentage(portfolioSummary.ytdReturn) : 'N/A'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {timeframe.toUpperCase()} Return
                            {portfolioSummary && portfolioSummary.totalAccounts > 0 && (
                              <span className="ml-1">({portfolioSummary.totalAccounts} accounts)</span>
                            )}
                          </div>
                        </div>
                        <div className="p-4 bg-card rounded-lg border">
                          <div className="text-2xl font-mono font-bold transition-all duration-200">
                            {portfolioSummary ? formatCurrency(portfolioSummary.totalAUM) : 'N/A'}
                          </div>
                          <div className="text-sm text-muted-foreground">Total AUM</div>
                        </div>
                        <div className="p-4 bg-card rounded-lg border">
                          <div className="text-2xl font-mono font-bold transition-all duration-200">
                            {portfolioSummary ? formatRatio(portfolioSummary.sharpeRatio) : 'N/A'}
                          </div>
                          <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Show skeleton while generating new answer */}
                  {isGeneratingAnswer && <AnswerCardSkeleton />}
                  
                  {answers.map((answer) => (
                    <div
                      key={answer.id}
                      ref={answer.id === newAnswerId ? newAnswerRef : null}
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
                        isUnmatched={answer.isUnmatched}
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
          <FinSightDashboard />
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
