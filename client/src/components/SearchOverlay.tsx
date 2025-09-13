import { useState, useMemo, useEffect, useRef, memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TrendingUp, PieChart, Shield, Activity, BarChart3, Target, Grid3X3, ArrowLeft, ChevronRight, Search } from "lucide-react";
import { useTypingAnimation } from "@/hooks/useTypingAnimation";

interface SearchOverlayProps {
  isOpen?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onCategorySelect?: (category: string) => void;
  onQuestionSelect?: (question: string) => void;
  onClose?: () => void;
}

interface Question {
  text: string;
  category: string;
}

const categories = [
  { name: "Comparison", icon: TrendingUp, color: "bg-chart-1" },
  { name: "Holdings", icon: PieChart, color: "bg-chart-2" },
  { name: "Risk", icon: Shield, color: "bg-chart-3" },
  { name: "Attribution", icon: Target, color: "bg-chart-4" },
  { name: "Activity", icon: Activity, color: "bg-chart-1" },
  { name: "Allocation", icon: BarChart3, color: "bg-chart-2" }
];

// All questions with their categories
const allQuestions: Question[] = [
  // Comparison questions
  { text: "What's the YTD performance vs S&P 500?", category: "Comparison" },
  { text: "Compare risk-adjusted returns to benchmark", category: "Comparison" },
  { text: "How does performance compare to sector peers?", category: "Comparison" },
  { text: "Portfolio vs benchmark sector allocation", category: "Comparison" },
  { text: "Compare Sharpe ratio to industry average", category: "Comparison" },
  { text: "Performance vs similar risk profiles", category: "Comparison" },
  
  // Holdings questions
  { text: "Show me the top 10 holdings by weight", category: "Holdings" },
  { text: "What are the largest position changes?", category: "Holdings" },
  { text: "Holdings concentration analysis", category: "Holdings" },
  { text: "Show positions by market cap", category: "Holdings" },
  { text: "Recent additions and reductions", category: "Holdings" },
  { text: "Holdings overlap across accounts", category: "Holdings" },
  
  // Risk questions
  { text: "What's the portfolio's beta and volatility?", category: "Risk" },
  { text: "Show risk metrics dashboard", category: "Risk" },
  { text: "Downside risk and max drawdown", category: "Risk" },
  { text: "Risk contribution by holding", category: "Risk" },
  { text: "Portfolio correlation analysis", category: "Risk" },
  { text: "Stress test against scenarios", category: "Risk" },
  
  // Attribution questions
  { text: "What's driving current performance attribution?", category: "Attribution" },
  { text: "Sector vs security selection impact", category: "Attribution" },
  { text: "Attribution breakdown by time period", category: "Attribution" },
  { text: "Top contributing and detracting positions", category: "Attribution" },
  { text: "Factor-based attribution analysis", category: "Attribution" },
  { text: "Geographic attribution breakdown", category: "Attribution" },
  
  // Activity questions
  { text: "What were the largest trades last month?", category: "Activity" },
  { text: "Show me recent portfolio activity summary", category: "Activity" },
  { text: "Cash flow and dividend activity", category: "Activity" },
  { text: "Recent rebalancing actions", category: "Activity" },
  { text: "Trading volume by account", category: "Activity" },
  { text: "Fee and expense breakdown", category: "Activity" },
  
  // Allocation questions
  { text: "Show sector allocation breakdown", category: "Allocation" },
  { text: "How is the portfolio allocated by asset class?", category: "Allocation" },
  { text: "Geographic allocation analysis", category: "Allocation" },
  { text: "Style allocation (growth vs value)", category: "Allocation" },
  { text: "Target vs actual allocation drift", category: "Allocation" },
  { text: "Rebalancing recommendations", category: "Allocation" },
  
  // Additional mixed questions for better variety
  { text: "How did tech sector allocation perform?", category: "Attribution" },
];

// Helper function to get category info
const getCategoryInfo = (categoryName: string) => {
  return categories.find(c => c.name === categoryName);
};

const recentQueries = [
  "Portfolio performance last quarter",
  "Risk metrics compared to benchmark",
  "Top performing assets YTD"
];

const SearchOverlay = memo(function SearchOverlay({ 
  isOpen = false,
  searchValue = "",
  onSearchChange,
  onCategorySelect,
  onQuestionSelect,
  onClose
}: SearchOverlayProps) {
  const [mode, setMode] = useState<'overview' | 'category'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Typing animation for placeholder
  const placeholderQuestions = [
    "What's the YTD performance vs S&P 500?",
    "Show me the top 10 holdings by weight",
    "What's the portfolio's beta and volatility?", 
    "How is the portfolio allocated by sector?",
    "What are the biggest risk exposures?",
    "Which positions had the best performance?",
    "What's driving current performance attribution?",
    "Show me recent portfolio activity summary"
  ];

  const { displayedText: displayedPlaceholder } = useTypingAnimation({
    questions: placeholderQuestions,
    isActive: isOpen && !searchValue,
    typingSpeed: 50,
    erasingSpeed: 30,
    pauseDuration: 2000
  });

  // Reset to overview when opening and focus input
  useEffect(() => {
    if (isOpen) {
      setMode('overview');
      setSelectedCategory(null);
      // Focus the input with a small delay to ensure DOM is ready
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Unified search filtering across all questions and categories
  const filteredQuestions = useMemo(() => {
    if (!searchValue || searchValue.trim() === "") {
      return mode === 'category' && selectedCategory
        ? allQuestions.filter(q => q.category === selectedCategory)
        : allQuestions.slice(0, 5); // Show fewer when no search
    }

    const searchTerm = searchValue.toLowerCase().trim();
    const questions = mode === 'category' && selectedCategory
      ? allQuestions.filter(q => q.category === selectedCategory)
      : allQuestions;
      
    return questions
      .filter(question => 
        question.text.toLowerCase().includes(searchTerm) ||
        question.category.toLowerCase().includes(searchTerm)
      )
      .slice(0, 8); // More results when searching
  }, [searchValue, mode, selectedCategory]);

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setMode('category');
    onCategorySelect?.(categoryName);
    console.log('Category selected:', categoryName);
  };

  const handleQuestionClick = (question: string) => {
    onQuestionSelect?.(question);
    console.log('Question selected:', question);
    onClose?.();
  };

  const handleBackToOverview = () => {
    setMode('overview');
    setSelectedCategory(null);
  };

  const currentQuestions = mode === 'category' && selectedCategory
    ? allQuestions.filter(q => q.category === selectedCategory)
    : allQuestions;

  return (
    <>
      {/* Desktop Overlay - dropdown style with focus trap */}
      <div 
        className={`hidden md:block absolute top-full left-0 right-0 mt-2 z-[80] transition-all duration-300 ease-out ${
          isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
        }`}
        onMouseDown={(e) => {
          // Prevent blur on header input when clicking in overlay
          e.preventDefault();
        }}
      >
        <Command 
          className="rounded-2xl border-2 border-border/20 bg-background backdrop-blur-xl shadow-2xl ring-1 ring-primary/5 overflow-hidden" 
          shouldFilter={false}
          onKeyDown={(e) => {
            // Ensure proper keyboard navigation
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
              // Let Command handle the navigation
              return;
            }
            if (e.key === 'Escape') {
              onClose?.();
            }
          }}
        >
          {/* Enhanced search input with context */}
          <div className="border-b border-border/50">
            <div className="relative">
              <CommandInput 
                ref={inputRef}
                placeholder=""
                value={searchValue}
                onValueChange={onSearchChange}
                className="h-12 border-0 bg-transparent focus:bg-background focus:ring-0 text-base p-4 placeholder:text-muted-foreground/60 transition-all duration-300"
              />
              {!searchValue && (
                <div className="absolute inset-0 h-12 flex items-center pointer-events-none">
                  <span className="text-base text-muted-foreground/60 font-normal ml-14">
                    {displayedPlaceholder}
                    <span className="animate-pulse ml-1 opacity-70">|</span>
                  </span>
                </div>
              )}
            </div>
            <div className="px-4 pb-3 text-xs text-muted-foreground/80 flex items-center justify-between">
              <span>Questions about your selected accounts</span>
              <span className="hidden sm:inline text-muted-foreground/60">↑↓ navigate • Enter to select • Esc to close</span>
            </div>
          </div>
          
          {mode === 'category' ? (
            /* Category View */
            <>
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleBackToOverview}
                  className="h-8 px-3 rounded-full hover:bg-background/80 transition-all duration-200 hover:scale-105"
                >
                  <ArrowLeft className="h-3 w-3 mr-1.5" />
                  Back
                </Button>
                <div className="flex items-center gap-3">
                  {selectedCategory && (() => {
                    const category = categories.find(c => c.name === selectedCategory);
                    return category ? (
                      <>
                        <div className="flex items-center gap-2 px-2 py-1 bg-background rounded-full border border-border/50">
                          <div className={`w-2.5 h-2.5 rounded-full ${category.color}`} />
                          <category.icon className="h-4 w-4" />
                          <span className="text-sm font-medium">{selectedCategory}</span>
                        </div>
                      </>
                    ) : null;
                  })()}
                </div>
              </div>

              <CommandList className="max-h-[60vh]">
                <CommandGroup>
                  {filteredQuestions.map((question, index) => (
                    <CommandItem
                      key={index}
                      value={question.text}
                      onSelect={() => handleQuestionClick(question.text)}
                      className="px-4 py-3 text-sm hover:bg-accent/50 cursor-pointer transition-all duration-200 rounded-md mx-2 my-0.5 border-l-2 border-transparent hover:border-primary/30"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <span className="flex-1">{question.text}</span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandEmpty className="py-4 text-center text-sm">
                  No questions found in this category
                </CommandEmpty>
              </CommandList>
            </>
          ) : (
            /* Overview - Unified Command Interface */
            <CommandList className="max-h-[60vh]">
              {/* Enhanced Search Results */}
              {searchValue && (
                <CommandGroup heading={
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground px-2 py-1">
                    <Search className="h-3 w-3" />
                    <span>Results • {filteredQuestions.length} matches</span>
                  </div>
                }>
                  {filteredQuestions.length > 0 ? (
                    filteredQuestions.map((question, index) => {
                      const categoryInfo = getCategoryInfo(question.category);
                      return (
                        <CommandItem
                          key={index}
                          value={question.text}
                          onSelect={() => handleQuestionClick(question.text)}
                          className="px-4 py-3 hover:bg-accent/50 cursor-pointer transition-all duration-200 rounded-md mx-2 my-0.5 group border-l-2 border-transparent hover:border-primary/30"
                        >
                          <div className="flex items-center gap-3 w-full">
                            <span className="text-sm flex-1 group-hover:text-foreground transition-colors">{question.text}</span>
                            {categoryInfo && (
                              <Badge 
                                variant="outline" 
                                className="text-xs px-2 py-1 h-5 gap-1.5 shrink-0 border-border/50 hover:border-primary/30 transition-colors"
                              >
                                <div className={`w-1.5 h-1.5 rounded-full ${categoryInfo.color}`} />
                                {question.category}
                              </Badge>
                            )}
                            <ChevronRight className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
                          </div>
                        </CommandItem>
                      );
                    })
                  ) : (
                    <CommandEmpty className="py-8 text-center">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">No portfolio questions match</p>
                        <p className="text-xs text-muted-foreground/60">"{searchValue}"</p>
                      </div>
                    </CommandEmpty>
                  )}
                </CommandGroup>
              )}

              {/* Enhanced Popular Questions */}
              {!searchValue && (
                <CommandGroup heading={
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground px-2 py-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>Popular Questions</span>
                  </div>
                }>
                  {allQuestions.slice(0, 6).map((question, index) => {
                    const categoryInfo = getCategoryInfo(question.category);
                    return (
                      <CommandItem
                        key={index}
                        value={question.text}
                        onSelect={() => handleQuestionClick(question.text)}
                        className="px-4 py-3 hover:bg-accent/50 cursor-pointer transition-all duration-200 rounded-md mx-2 my-0.5 group border-l-2 border-transparent hover:border-primary/30"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <span className="text-sm flex-1 group-hover:text-foreground transition-colors">{question.text}</span>
                          <Badge 
                            variant="outline" 
                            className="text-xs px-2 py-1 h-5 gap-1.5 shrink-0 cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCategoryClick(question.category);
                            }}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${categoryInfo?.color}`} />
                            {question.category}
                          </Badge>
                          <ChevronRight className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}

              {/* Enhanced Categories Grid */}
              {!searchValue && (
                <CommandGroup heading={
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground px-2 py-1">
                    <Grid3X3 className="h-3 w-3" />
                    <span>Browse by Category</span>
                  </div>
                }>
                  <div className="grid grid-cols-2 gap-2 px-4 py-2">
                    {categories.map((category) => (
                      <CommandItem
                        key={category.name}
                        value={category.name}
                        onSelect={() => handleCategoryClick(category.name)}
                        className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-accent/50 transition-all duration-200 border border-border/30 hover:border-primary/30 group hover:shadow-sm"
                      >
                        <div className="flex items-center gap-2.5 w-full">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-background border border-border/50">
                            <div className={`w-2 h-2 rounded-full ${category.color}`} />
                          </div>
                          <category.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                          <span className="text-xs font-medium flex-1 group-hover:text-foreground transition-colors">{category.name}</span>
                          <ChevronRight className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
                        </div>
                      </CommandItem>
                    ))}
                  </div>
                </CommandGroup>
              )}

              {/* Enhanced Recent Queries */}
              {!searchValue && recentQueries.length > 0 && (
                <CommandGroup heading={
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground px-2 py-1">
                    <Activity className="h-3 w-3" />
                    <span>Recent Questions</span>
                  </div>
                }>
                  {recentQueries.slice(0, 4).map((query, index) => (
                    <CommandItem
                      key={index}
                      value={query}
                      onSelect={() => handleQuestionClick(query)}
                      className="px-4 py-2.5 hover:bg-accent/30 cursor-pointer transition-all duration-200 rounded-md mx-2 my-0.5 group border-l-2 border-transparent hover:border-muted-foreground/30"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex-1">{query}</span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground/30 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all duration-200" />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          )}
        </Command>
      </div>

      {/* Enhanced Mobile Full-Screen Dialog */}
      <Dialog open={isOpen && typeof window !== 'undefined' && window.innerWidth < 768} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-full h-full p-0 rounded-none border-0 z-[80]">
          <Command 
            className="h-full bg-background" 
            shouldFilter={false}
            onKeyDown={(e) => {
              // Ensure proper keyboard navigation
              if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                // Let Command handle the navigation
                return;
              }
              if (e.key === 'Escape') {
                onClose?.();
              }
            }}
          >
            <div className="border-b border-border/50 bg-gradient-to-b from-background to-background/80 px-4 pt-2">
              <div className="relative">
                <CommandInput 
                  placeholder=""
                  value={searchValue}
                  onValueChange={onSearchChange}
                  className="h-14 border-0 bg-transparent focus:bg-background/80 focus:ring-0 text-base p-4 placeholder:text-muted-foreground/60 transition-all duration-300"
                  autoFocus
                />
                {!searchValue && (
                  <div className="absolute inset-0 h-14 flex items-center pointer-events-none">
                    <span className="text-base text-muted-foreground/60 font-normal ml-10">
                      {displayedPlaceholder}
                      <span className="animate-pulse ml-1 opacity-70">|</span>
                    </span>
                  </div>
                )}
              </div>
              <div className="px-1 pb-3 text-xs text-muted-foreground/80">
                Questions about your selected accounts
              </div>
            </div>
            <CommandList className="flex-1 px-2">
              {/* Enhanced mobile search results */}
              {searchValue && (
                <CommandGroup heading={
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground px-2 py-2">
                    <Search className="h-4 w-4" />
                    <span>Results ({filteredQuestions.length})</span>
                  </div>
                }>
                  {filteredQuestions.map((question, index) => {
                    const categoryInfo = getCategoryInfo(question.category);
                    return (
                      <CommandItem
                        key={index}
                        value={question.text}
                        onSelect={() => handleQuestionClick(question.text)}
                        className="px-4 py-4 rounded-lg mx-2 my-1 border border-border/30 hover:bg-accent/50 transition-all duration-200 active:scale-95"
                      >
                        <div className="flex flex-col gap-2 w-full">
                          <span className="text-sm font-medium">{question.text}</span>
                          {categoryInfo && (
                            <div className="flex items-center gap-1.5">
                              <div className={`w-2 h-2 rounded-full ${categoryInfo.color}`} />
                              <span className="text-xs text-muted-foreground">{question.category}</span>
                            </div>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
              
              {!searchValue && (
                <>
                  <CommandGroup heading={
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground px-2 py-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>Suggested</span>
                    </div>
                  }>
                    {allQuestions.slice(0, 5).map((question, index) => {
                      const categoryInfo = getCategoryInfo(question.category);
                      return (
                        <CommandItem
                          key={index}
                          value={question.text}
                          onSelect={() => handleQuestionClick(question.text)}
                          className="px-4 py-4 rounded-lg mx-2 my-1 border border-border/30 hover:bg-accent/50 transition-all duration-200 active:scale-95"
                        >
                          <div className="flex flex-col gap-2 w-full">
                            <span className="text-sm font-medium">{question.text}</span>
                            {categoryInfo && (
                              <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${categoryInfo.color}`} />
                                <span className="text-xs text-muted-foreground">{question.category}</span>
                              </div>
                            )}
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                  
                  <CommandGroup heading={
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground px-2 py-2">
                      <Grid3X3 className="h-4 w-4" />
                      <span>Categories</span>
                    </div>
                  }>
                    <div className="grid grid-cols-2 gap-2 px-2">
                      {categories.map((category) => (
                        <CommandItem
                          key={category.name}
                          value={category.name}
                          onSelect={() => handleCategoryClick(category.name)}
                          className="px-4 py-4 rounded-lg border border-border/30 hover:bg-accent/50 transition-all duration-200 active:scale-95"
                        >
                          <div className="flex flex-col items-center gap-2 text-center">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-background to-muted/50">
                              <div className={`w-3 h-3 rounded-full ${category.color}`} />
                            </div>
                            <category.icon className="h-5 w-5 text-muted-foreground" />
                            <span className="text-xs font-medium">{category.name}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </div>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
});

export default SearchOverlay;