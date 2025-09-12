import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp, PieChart, Shield, Activity, BarChart3, Target, Grid3X3, ArrowLeft } from "lucide-react";

interface SearchOverlayProps {
  isOpen?: boolean;
  searchValue?: string;
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
  onCategorySelect,
  onQuestionSelect,
  onClose
}: SearchOverlayProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [showCategoryView, setShowCategoryView] = useState(false);

  // Autocomplete filtering based on search input
  const filteredQuestions = useMemo(() => {
    if (!searchValue || searchValue.trim() === "") {
      return allQuestions.slice(0, 8); // Show first 8 when no search
    }

    const searchTerm = searchValue.toLowerCase().trim();
    return allQuestions
      .filter(question => 
        question.text.toLowerCase().includes(searchTerm) ||
        question.category.toLowerCase().includes(searchTerm)
      )
      .slice(0, 6); // Limit to 6 results when searching
  }, [searchValue]);

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setShowCategoryView(true);
    onCategorySelect?.(categoryName);
    console.log('Category selected:', categoryName);
  };

  const handleQuestionClick = (question: string) => {
    onQuestionSelect?.(question);
    console.log('Question selected:', question);
  };

  const handleBackToOverview = () => {
    setShowCategoryView(false);
    setSelectedCategory("All Categories");
  };

  const handleShowAllQuestions = () => {
    setSelectedCategory("All Categories");
    setShowCategoryView(true);
  };

  const handleShowAllCategories = () => {
    // Show all categories in a special view
    setSelectedCategory("Browse All Categories");
    setShowCategoryView(true);
  };

  const handleShowAllRecent = () => {
    // For now, just log - could expand recent queries list
    console.log('Show all recent queries');
    onClose?.(); // Close overlay for now
  };

  const currentQuestions = selectedCategory === "Browse All Categories" 
    ? allQuestions
    : selectedCategory === "All Categories"
      ? allQuestions
      : allQuestions.filter(q => q.category === selectedCategory);

  return (
    <div className={`absolute top-full left-0 right-0 mt-2 z-50 transition-all duration-300 ease-out ${
      isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
    }`}>
      <Card className="p-6 shadow-xl backdrop-blur-sm border-border/50 bg-card/95">
        {showCategoryView ? (
          /* Category View - Show questions for selected category */
          <div className="space-y-4">
            {/* Header with back button */}
            <div className="flex items-center gap-3 pb-3 border-b border-border/50">
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 hover-elevate"
                onClick={handleBackToOverview}
                data-testid="button-back-to-overview"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                {selectedCategory !== "All Categories" && selectedCategory !== "Browse All Categories" && (
                  <>
                    {(() => {
                      const category = categories.find(c => c.name === selectedCategory);
                      return category ? (
                        <>
                          <div className={`w-3 h-3 rounded-sm ${category.color}`} />
                          <category.icon className="h-4 w-4" />
                        </>
                      ) : null;
                    })()}
                  </>
                )}
                {(selectedCategory === "All Categories" || selectedCategory === "Browse All Categories") && <Grid3X3 className="h-4 w-4" />}
                <h3 className="text-lg font-medium">{selectedCategory}</h3>
              </div>
            </div>

            {/* Questions for selected category */}
            <div className="space-y-2">
              {currentQuestions.map((question: Question, index: number) => {
                const categoryInfo = getCategoryInfo(question.category);
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    className="justify-start text-left h-auto py-3 px-4 hover-elevate transition-all duration-200 group w-full"
                    onClick={() => handleQuestionClick(question.text)}
                    data-testid={`button-category-question-${index}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-2 w-full">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm group-hover:text-primary transition-colors duration-200">
                          {question.text}
                        </span>
                        {categoryInfo && (selectedCategory === "All Categories" || selectedCategory === "Browse All Categories") && (
                          <Badge 
                            variant="outline" 
                            className="flex-shrink-0 text-xs gap-1 transition-all duration-200 group-hover:scale-105 cursor-pointer hover:bg-accent"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCategoryClick(question.category);
                            }}
                          >
                            <div className={`w-2 h-2 rounded-full ${categoryInfo.color}`} />
                            {question.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Overview - Show suggested questions, categories, and recent */
          <>
            {/* Suggested Questions with Autocomplete */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {searchValue ? `Search Results (${filteredQuestions.length})` : 'Suggested Questions'}
                </h3>
                {!searchValue && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-xs hover-elevate h-6"
                    onClick={handleShowAllQuestions}
                    data-testid="button-show-all-questions"
                  >
                    View All
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {filteredQuestions.length > 0 ? (
                  filteredQuestions.map((question, index) => {
                    const categoryInfo = getCategoryInfo(question.category);
                    return (
                      <Button
                        key={index}
                        variant="ghost"
                        className="justify-start text-left h-auto py-2 px-3 hover-elevate transition-all duration-200 group w-full"
                        onClick={() => handleQuestionClick(question.text)}
                        data-testid={`button-suggested-${index}`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-start gap-2 w-full">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm group-hover:text-primary transition-colors duration-200">
                              {question.text}
                            </span>
                            {categoryInfo && (
                              <Badge 
                                variant="outline" 
                                className="flex-shrink-0 text-xs gap-1 transition-all duration-200 group-hover:scale-105 cursor-pointer hover:bg-accent"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCategoryClick(question.category);
                                }}
                              >
                                <div className={`w-2 h-2 rounded-full ${categoryInfo.color}`} />
                                {question.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Button>
                    );
                  })
                ) : searchValue ? (
                  <div className="text-sm text-muted-foreground py-4 text-center">
                    No questions found matching "{searchValue}"
                  </div>
                ) : null}
              </div>
            </div>

            {/* Categories - Now second */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-muted-foreground">Categories</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-xs hover-elevate h-6"
                  onClick={handleShowAllCategories}
                  data-testid="button-show-all-categories"
                >
                  View All
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {categories.map((category, index) => (
                  <Button
                    key={category.name}
                    variant="ghost"
                    className="justify-start gap-2 h-10 hover-elevate transition-all duration-200 group"
                    onClick={() => handleCategoryClick(category.name)}
                    data-testid={`button-category-${category.name.toLowerCase()}`}
                    style={{ animationDelay: `${(index + 4) * 50}ms` }}
                  >
                    <div className={`w-3 h-3 rounded-sm ${category.color} transition-transform duration-200 group-hover:scale-110`} />
                    <category.icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-105" />
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Recent Queries - Now third */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-muted-foreground">Recent</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-xs hover-elevate h-6"
                  onClick={handleShowAllRecent}
                  data-testid="button-show-all-recent"
                >
                  View All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentQueries.map((query, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover-elevate transition-all duration-200 hover:scale-105"
                    onClick={() => handleQuestionClick(query)}
                    data-testid={`badge-recent-${index}`}
                    style={{ animationDelay: `${(index + 10) * 50}ms` }}
                  >
                    {query}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}