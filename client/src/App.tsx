import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";
import TopNavigation from "@/components/TopNavigation";
import SearchOverlay from "@/components/SearchOverlay";
import ContextBar from "@/components/ContextBar";
import AnswerCard from "@/components/AnswerCard";
import AnswerCardSkeleton from "@/components/AnswerCardSkeleton";
import HistoryDrawer from "@/components/HistoryDrawer";
import { usePortfolioSummary } from "@/hooks/usePortfolioSummary";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      data-testid="button-theme-toggle"
    >
      {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Button>
  );
}

function FinSightDashboard() {
  const [searchValue, setSearchValue] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'accounts' | 'group'>('accounts');
  const [selectedAccountIds, setSelectedAccountIds] = useState(new Set(['ACC001', 'ACC002']));
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState("ytd");
  const [answers, setAnswers] = useState([
    {
      id: "1",
      question: "What's the YTD performance vs S&P 500?",
      asOfDate: "Dec 10, 2024",
      accounts: ["Growth Portfolio (10001)", "Conservative Fund (10002)"],
      timeframe: "YTD",
      isUnmatched: false
    }
  ]);
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
      <div className="relative flex-shrink-0">
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
      <div className="flex-shrink-0">
        <ContextBar 
          selectedAccounts={selectedAccounts}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* Main Content Area - Full width utilization */}
          <div className="flex-1 min-w-0 px-2 sm:px-4 py-4 sm:py-6 overflow-y-auto pb-20 lg:pb-6">
            <div className="max-w-none mx-auto">
              {answers.length === 0 ? (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-semibold mb-4">Welcome to FinSight</h2>
                  <p className="text-muted-foreground mb-6">
                    Ask questions about portfolio performance, risk metrics, and financial insights
                  </p>
                  <Button onClick={() => handleSearchSubmit("What's the YTD performance vs S&P 500?")}>
                    Try a sample question
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
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

          {/* Right Sidebar - Responsive width */}
          <div className="hidden lg:flex lg:w-80 xl:w-96 flex-col border-l border-border bg-card/50">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Quick Actions</h3>
                <ThemeToggle />
              </div>
            </div>
            
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              <div className="space-y-2">
                <HistoryDrawer 
                  onEntryClick={(entry) => handleSearchSubmit(entry.question)}
                />
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => console.log('Export all clicked')}
                  data-testid="button-export-all"
                >
                  Export All Answers
                </Button>
              </div>

              {/* Portfolio Summary - Updates with account selection */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-muted-foreground">Portfolio Summary</h4>
                  {portfolioLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                </div>
                
                {portfolioError ? (
                  <div className="p-3 bg-destructive/10 rounded-md border border-destructive/20">
                    <div className="text-xs text-destructive">Error loading portfolio data</div>
                  </div>
                ) : portfolioLoading ? (
                  // Portfolio Summary Skeleton
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 bg-background rounded-md border">
                      <Skeleton className="h-7 w-16 mb-2" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <div className="p-3 bg-background rounded-md border">
                      <Skeleton className="h-7 w-20 mb-2" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <div className="p-3 bg-background rounded-md border">
                      <Skeleton className="h-7 w-12 mb-2" />
                      <Skeleton className="h-3 w-18" />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 bg-background rounded-md border">
                      <div className={`text-lg font-mono font-bold transition-colors duration-200 ${
                        portfolioSummary?.ytdReturn && portfolioSummary.ytdReturn > 0 
                          ? 'text-chart-2' 
                          : portfolioSummary?.ytdReturn && portfolioSummary.ytdReturn < 0 
                            ? 'text-destructive' 
                            : 'text-muted-foreground'
                      }`}>
                        {portfolioSummary ? formatPercentage(portfolioSummary.ytdReturn) : 'N/A'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {timeframe.toUpperCase()} Return
                        {portfolioSummary && portfolioSummary.totalAccounts > 0 && (
                          <span className="ml-1">({portfolioSummary.totalAccounts} accounts)</span>
                        )}
                      </div>
                    </div>
                    <div className="p-3 bg-background rounded-md border">
                      <div className="text-lg font-mono font-bold transition-all duration-200">
                        {portfolioSummary ? formatCurrency(portfolioSummary.totalAUM) : 'N/A'}
                      </div>
                      <div className="text-xs text-muted-foreground">Total AUM</div>
                    </div>
                    <div className="p-3 bg-background rounded-md border">
                      <div className="text-lg font-mono font-bold transition-all duration-200">
                        {portfolioSummary ? formatRatio(portfolioSummary.sharpeRatio) : 'N/A'}
                      </div>
                      <div className="text-xs text-muted-foreground">Sharpe Ratio</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile bottom bar - only visible on small screens */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
            <div className="flex items-center justify-between">
              <HistoryDrawer 
                onEntryClick={(entry) => handleSearchSubmit(entry.question)}
              />
              <ThemeToggle />
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
