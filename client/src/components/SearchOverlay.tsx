import { useState, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TrendingUp, PieChart, Shield, Activity, BarChart3, Target, Grid3X3, ArrowLeft, Search } from "lucide-react";

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

export default function SearchOverlay({ 
  isOpen = false,
  searchValue = "",
  onSearchChange,
  onCategorySelect,
  onQuestionSelect,
  onClose
}: SearchOverlayProps) {
  const [mode, setMode] = useState<'overview' | 'category'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Reset to overview when opening
  useEffect(() => {
    if (isOpen) {
      setMode('overview');
      setSelectedCategory(null);
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
        className={`hidden md:block absolute top-full left-0 right-0 mt-1 z-50 transition-all duration-200 ease-out ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
        onMouseDown={(e) => {
          // Prevent blur on header input when clicking in overlay
          e.preventDefault();
        }}
      >
        <Command 
          className="rounded-lg border bg-popover shadow-lg" 
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
          {/* Unified search input with context */}
          <div className="border-b">
            <CommandInput 
              placeholder="Ask about performance, risk, holdings, allocation..."
              value={searchValue}
              onValueChange={onSearchChange}
              className="h-10 border-0 bg-transparent focus:ring-0 text-sm px-3"
              autoFocus={isOpen}
            />
            <div className="px-3 pb-2 text-xs text-muted-foreground">
              Questions about your selected accounts • {typeof window !== 'undefined' && window.innerWidth >= 768 ? 'Press ↑↓ to navigate • Enter to select' : 'Tap to select'}
            </div>
          </div>
          
          {mode === 'category' ? (
            /* Category View */
            <>
              <div className="flex items-center gap-3 px-4 py-3 border-b bg-muted/50">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleBackToOverview}
                  className="h-6 px-2"
                >
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Back
                </Button>
                <div className="flex items-center gap-2">
                  {selectedCategory && (() => {
                    const category = categories.find(c => c.name === selectedCategory);
                    return category ? (
                      <>
                        <div className={`w-2 h-2 rounded-full ${category.color}`} />
                        <category.icon className="h-3 w-3" />
                        <span className="text-xs font-medium text-muted-foreground">{selectedCategory}</span>
                      </>
                    ) : null;
                  })()}
                </div>
              </div>

              <CommandList className="max-h-96">
                <CommandGroup>
                  {filteredQuestions.map((question, index) => (
                    <CommandItem
                      key={index}
                      value={question.text}
                      onSelect={() => handleQuestionClick(question.text)}
                      className="px-3 py-1.5 text-sm"
                    >
                      {question.text}
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
            <CommandList className="max-h-96">
              {/* Search Results */}
              {searchValue && (
                <CommandGroup heading={`Results • ${filteredQuestions.length} matches`}>
                  {filteredQuestions.length > 0 ? (
                    filteredQuestions.map((question, index) => {
                      const categoryInfo = getCategoryInfo(question.category);
                      return (
                        <CommandItem
                          key={index}
                          value={question.text}
                          onSelect={() => handleQuestionClick(question.text)}
                          className="px-3 py-1.5"
                        >
                          <div className="flex items-center gap-2 w-full">
                            <span className="text-sm flex-1">{question.text}</span>
                            {categoryInfo && (
                              <Badge 
                                variant="outline" 
                                className="text-xs px-1.5 py-0.5 h-4 gap-1 shrink-0"
                              >
                                <div className={`w-1.5 h-1.5 rounded-full ${categoryInfo.color}`} />
                                {question.category}
                              </Badge>
                            )}
                          </div>
                        </CommandItem>
                      );
                    })
                  ) : (
                    <CommandEmpty className="py-4 text-center text-sm">
                      No portfolio questions match "{searchValue}"
                    </CommandEmpty>
                  )}
                </CommandGroup>
              )}

              {/* Popular Questions */}
              {!searchValue && (
                <CommandGroup heading="Popular Questions">
                  {allQuestions.slice(0, 6).map((question, index) => {
                    const categoryInfo = getCategoryInfo(question.category);
                    return (
                      <CommandItem
                        key={index}
                        value={question.text}
                        onSelect={() => handleQuestionClick(question.text)}
                        className="px-3 py-1.5"
                      >
                        <div className="flex items-center gap-2 w-full">
                          <span className="text-sm flex-1">{question.text}</span>
                          <Badge 
                            variant="outline" 
                            className="text-xs px-1.5 py-0.5 h-4 gap-1 shrink-0 cursor-pointer hover:bg-accent"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCategoryClick(question.category);
                            }}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${categoryInfo?.color}`} />
                            {question.category}
                          </Badge>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}

              {/* Categories - Compact Grid */}
              {!searchValue && (
                <CommandGroup heading="Browse by Category">
                  <div className="grid grid-cols-2 gap-1 px-3 py-2">
                    {categories.map((category) => (
                      <CommandItem
                        key={category.name}
                        value={category.name}
                        onSelect={() => handleCategoryClick(category.name)}
                        className="px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent"
                      >
                        <div className="flex items-center gap-2 w-full">
                          <div className={`w-1.5 h-1.5 rounded-full ${category.color}`} />
                          <category.icon className="h-3 w-3" />
                          <span className="text-xs font-medium">{category.name}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </div>
                </CommandGroup>
              )}

              {/* Recent Queries */}
              {!searchValue && recentQueries.length > 0 && (
                <CommandGroup heading="Recent Questions">
                  {recentQueries.slice(0, 4).map((query, index) => (
                    <CommandItem
                      key={index}
                      value={query}
                      onSelect={() => handleQuestionClick(query)}
                      className="px-3 py-1.5"
                    >
                      <span className="text-sm text-muted-foreground">{query}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          )}
        </Command>
      </div>

      {/* Mobile Full-Screen Dialog */}
      <Dialog open={isOpen && typeof window !== 'undefined' && window.innerWidth < 768} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-full h-full p-0">
          <Command 
            className="h-full" 
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
            <div className="border-b px-3">
              <CommandInput 
                placeholder="Search questions, categories..."
                value={searchValue}
                onValueChange={onSearchChange}
                className="h-14 border-0 bg-transparent focus:ring-0"
                autoFocus
              />
            </div>
            <CommandList className="flex-1">
              {/* Mobile content structure similar to desktop but optimized for touch */}
              {searchValue && (
                <CommandGroup heading={`Results (${filteredQuestions.length})`}>
                  {filteredQuestions.map((question, index) => (
                    <CommandItem
                      key={index}
                      value={question.text}
                      onSelect={() => handleQuestionClick(question.text)}
                      className="px-4 py-4"
                    >
                      <span className="text-sm">{question.text}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {!searchValue && (
                <>
                  <CommandGroup heading="Suggested">
                    {allQuestions.slice(0, 5).map((question, index) => (
                      <CommandItem
                        key={index}
                        value={question.text}
                        onSelect={() => handleQuestionClick(question.text)}
                        className="px-4 py-4"
                      >
                        <span className="text-sm">{question.text}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  
                  <CommandGroup heading="Categories">
                    {categories.map((category) => (
                      <CommandItem
                        key={category.name}
                        value={category.name}
                        onSelect={() => handleCategoryClick(category.name)}
                        className="px-4 py-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${category.color}`} />
                          <category.icon className="h-4 w-4" />
                          <span className="text-sm">{category.name}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}