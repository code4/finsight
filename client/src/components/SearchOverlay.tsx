import { useState, useMemo, useEffect, useRef, memo } from "react";
import { createPortal } from "react-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, PieChart, Shield, Activity, BarChart3, Target, Grid3X3, ArrowLeft, ChevronRight, Search, ChevronDown, Settings, Info, HelpCircle, DollarSign, GitCompare } from "lucide-react";
import { useTypingAnimation } from "@/hooks/useTypingAnimation";
import { TIMEFRAME_OPTIONS, BENCHMARK_OPTIONS, SECTOR_OPTIONS, ACCOUNT_OPTIONS } from "@shared/enhanced-financial-data";

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
  categories: string[]; // Multiple categories support
  tags?: string[]; // Optional tags for better organization
}

interface PlaceholderConfig {
  [key: string]: {
    label: string;
    type: 'select' | 'text';
    options?: Array<{
      value: string;
      label: string;
      description?: string;
    }>;
    defaultValue?: string;
  };
}

const categories = [
  { name: "Performance Analysis", icon: TrendingUp, color: "bg-chart-1", description: "Track portfolio returns, benchmarks, and performance metrics" },
  { name: "Risk Assessment", icon: Shield, color: "bg-chart-3", description: "Analyze portfolio risk, volatility, and risk-adjusted returns" },
  { name: "Holdings Analysis", icon: PieChart, color: "bg-chart-2", description: "Review individual positions, top holdings, and concentration" },
  { name: "Allocation Analysis", icon: BarChart3, color: "bg-chart-2", description: "Examine asset allocation, sector distribution, and diversification" },
  { name: "Activity & Trading", icon: Activity, color: "bg-chart-1", description: "View recent trades, transaction history, and activity patterns" },
  { name: "Income & Dividends", icon: DollarSign, color: "bg-chart-4", description: "Check dividend income, yield analysis, and distribution trends" },
  { name: "Comparison", icon: GitCompare, color: "bg-chart-5", description: "Compare performance against benchmarks and peer portfolios" }
];

// Global placeholder configurations using shared data
const placeholderConfigs: PlaceholderConfig = {
  benchmark: {
    label: "Benchmark",
    type: "select",
    options: BENCHMARK_OPTIONS,
    defaultValue: "spxtr"
  },
  timeperiod: {
    label: "Time Period", 
    type: "select",
    options: TIMEFRAME_OPTIONS.map(opt => {
      const descriptions: Record<string, string> = {
        "MTD": "Since beginning of current month",
        "1M": "Past 30 days",
        "1Y": "Past 12 months", 
        "PY": "Last completed calendar year",
        "PM": "Last completed month",
        "PQ": "Last completed quarter",
        "YTD": "Since January 1st",
        "3M": "Past 3 months",
        "6M": "Past 6 months",
        "2Y": "Past 24 months",
        "5Y": "Past 60 months"
      };
      return {
        value: opt.value,
        label: opt.label,
        description: descriptions[opt.value] || ""
      };
    }),
    defaultValue: "YTD"
  },
  sector: {
    label: "Sector",
    type: "select", 
    options: SECTOR_OPTIONS,
    defaultValue: "TECHNOLOGY"
  },
  account: {
    label: "Account Type",
    type: "select",
    options: ACCOUNT_OPTIONS,
    defaultValue: "all"
  }
};

// All questions with multiple categories and placeholders support
const allQuestions: Question[] = [
  // Multi-category questions with placeholders
  { 
    text: "Compare YTD performance vs {benchmark} over {timeperiod}", 
    categories: ["Comparison", "Performance Analysis"], 
    tags: ["performance", "benchmark"] 
  },
  { 
    text: "Show longest outperformance streak vs {benchmark}", 
    categories: ["Comparison"], 
    tags: ["performance", "streak"] 
  },
  { 
    text: "How does performance compare to sector peers?", 
    categories: ["Comparison", "Performance Analysis"], 
    tags: ["sector", "peers"] 
  },
  { 
    text: "Portfolio vs {benchmark} {sector} allocation", 
    categories: ["Comparison", "Allocation"], 
    tags: ["sector", "allocation"] 
  },
  { 
    text: "Compare Sharpe ratio to industry average", 
    categories: ["Comparison", "Risk Assessment"], 
    tags: ["sharpe", "risk"] 
  },
  { 
    text: "Performance vs similar risk profiles over {timeperiod}", 
    categories: ["Comparison", "Risk Assessment"], 
    tags: ["performance", "risk"] 
  },
  
  // Holdings questions
  { 
    text: "Show me the top 10 holdings by weight", 
    categories: ["Holdings Analysis"], 
    tags: ["positions", "weight"] 
  },
  { 
    text: "What are the largest position changes over {timeperiod}?", 
    categories: ["Holdings Analysis", "Activity & Trading"], 
    tags: ["positions", "changes"] 
  },
  { 
    text: "Holdings concentration analysis for {account}", 
    categories: ["Holdings Analysis", "Risk Assessment"], 
    tags: ["concentration", "risk"] 
  },
  { 
    text: "Show positions by market cap", 
    categories: ["Holdings Analysis"], 
    tags: ["positions", "market-cap"] 
  },
  { 
    text: "Recent additions and reductions", 
    categories: ["Holdings Analysis", "Activity & Trading"], 
    tags: ["changes", "trades"] 
  },
  { 
    text: "Holdings overlap across accounts", 
    categories: ["Holdings Analysis", "Allocation Analysis"], 
    tags: ["overlap", "accounts"] 
  },
  
  // Risk questions
  { 
    text: "What's the portfolio's beta and volatility vs {benchmark}?", 
    categories: ["Risk Assessment", "Comparison"], 
    tags: ["beta", "volatility"] 
  },
  { 
    text: "Show risk metrics dashboard", 
    categories: ["Risk Assessment"], 
    tags: ["metrics", "dashboard"] 
  },
  { 
    text: "Downside risk and max drawdown over {timeperiod}", 
    categories: ["Risk Assessment"], 
    tags: ["downside", "drawdown"] 
  },
  { 
    text: "Risk contribution by holding", 
    categories: ["Risk Assessment", "Holdings Analysis"], 
    tags: ["risk", "contribution"] 
  },
  { 
    text: "Portfolio correlation analysis", 
    categories: ["Risk Assessment"], 
    tags: ["correlation", "analysis"] 
  },
  { 
    text: "Stress test against scenarios", 
    categories: ["Risk Assessment"], 
    tags: ["stress", "scenarios"] 
  },
  
  // Attribution questions
  { 
    text: "What's driving current performance attribution?", 
    categories: ["Performance Analysis"], 
    tags: ["performance", "drivers"] 
  },
  { 
    text: "How is my {sector} allocation performing vs {benchmark} over {timeperiod}?", 
    categories: ["Performance Analysis", "Allocation Analysis", "Comparison"], 
    tags: ["sector", "performance"] 
  },
  { 
    text: "Attribution breakdown by {timeperiod}", 
    categories: ["Performance Analysis"], 
    tags: ["breakdown", "analysis"] 
  },
  { 
    text: "Top contributing and detracting positions", 
    categories: ["Performance Analysis", "Holdings Analysis"], 
    tags: ["performance", "positions"] 
  },
  { 
    text: "Factor-based attribution analysis", 
    categories: ["Performance Analysis", "Risk Assessment"], 
    tags: ["factors", "analysis"] 
  },
  { 
    text: "Geographic attribution breakdown", 
    categories: ["Performance Analysis", "Allocation Analysis"], 
    tags: ["geography", "breakdown"] 
  },
  
  // Activity questions
  { 
    text: "What were the largest trades over {timeperiod}?", 
    categories: ["Activity & Trading"], 
    tags: ["trades", "large"] 
  },
  { 
    text: "Show me recent portfolio activity summary", 
    categories: ["Activity & Trading"], 
    tags: ["summary", "recent"] 
  },
  { 
    text: "Cash flow and dividend activity for {account}", 
    categories: ["Activity & Trading", "Holdings Analysis"], 
    tags: ["cash-flow", "dividends"] 
  },
  { 
    text: "Recent rebalancing actions", 
    categories: ["Activity & Trading", "Allocation Analysis"], 
    tags: ["rebalancing", "actions"] 
  },
  { 
    text: "Trading volume by {account} over {timeperiod}", 
    categories: ["Activity & Trading"], 
    tags: ["volume", "trading"] 
  },
  { 
    text: "Fee and expense breakdown", 
    categories: ["Activity & Trading"], 
    tags: ["fees", "expenses"] 
  },
  
  // Allocation questions
  { 
    text: "Show {sector} allocation breakdown", 
    categories: ["Allocation Analysis"], 
    tags: ["sector", "breakdown"] 
  },
  { 
    text: "How is the portfolio allocated by asset class?", 
    categories: ["Allocation Analysis"], 
    tags: ["asset-class", "allocation"] 
  },
  { 
    text: "Geographic allocation analysis", 
    categories: ["Allocation Analysis"], 
    tags: ["geography", "allocation"] 
  },
  { 
    text: "Style allocation (growth vs value)", 
    categories: ["Allocation Analysis"], 
    tags: ["style", "growth", "value"] 
  },
  { 
    text: "Target vs actual allocation drift", 
    categories: ["Allocation Analysis", "Risk Assessment"], 
    tags: ["drift", "target"] 
  },
  { 
    text: "Rebalancing recommendations for {account}", 
    categories: ["Allocation Analysis", "Activity & Trading"], 
    tags: ["rebalancing", "recommendations"] 
  },

  // Income & Dividends questions
  { 
    text: "Show dividend income for {timeperiod}", 
    categories: ["Income & Dividends"], 
    tags: ["dividends", "income"] 
  },
  { 
    text: "Portfolio dividend yield vs {benchmark}", 
    categories: ["Income & Dividends", "Comparison"], 
    tags: ["yield", "benchmark"] 
  },
  { 
    text: "Dividend growth analysis over {timeperiod}", 
    categories: ["Income & Dividends", "Performance Analysis"], 
    tags: ["growth", "trends"] 
  },
  { 
    text: "Income distribution and tax efficiency", 
    categories: ["Income & Dividends", "Activity & Trading"], 
    tags: ["distribution", "taxes"] 
  },
  { 
    text: "Top dividend-paying holdings", 
    categories: ["Income & Dividends", "Holdings Analysis"], 
    tags: ["holdings", "dividends"] 
  },
  { 
    text: "Dividend payout calendar and timing", 
    categories: ["Income & Dividends"], 
    tags: ["schedule", "calendar"] 
  }
];

// Helper function to get category info
const getCategoryInfo = (categoryName: string) => {
  return categories.find(c => c.name === categoryName);
};

// Helper functions for placeholder detection and management
const extractPlaceholders = (text: string): string[] => {
  const matches = text.match(/\{(\w+)\}/g);
  return matches ? matches.map(match => match.slice(1, -1)) : [];
};

const hasPlaceholders = (text: string): boolean => {
  return /\{(\w+)\}/.test(text);
};

const replacePlaceholders = (text: string, values: Record<string, string>): string => {
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    const value = values[key];
    if (value && placeholderConfigs[key]) {
      const option = placeholderConfigs[key].options?.find(opt => opt.value === value);
      return option?.label || value;
    }
    return match;
  });
};

const getDisplayText = (question: Question): string => {
  if (!hasPlaceholders(question.text)) {
    return question.text;
  }
  
  // Replace placeholders with default values for display
  const defaultValues: Record<string, string> = {};
  const placeholders = extractPlaceholders(question.text);
  
  placeholders.forEach(placeholder => {
    const config = placeholderConfigs[placeholder];
    if (config?.defaultValue) {
      defaultValues[placeholder] = config.defaultValue;
    }
  });
  
  return replacePlaceholders(question.text, defaultValues);
};

// Portal-based dropdown that renders outside constrained containers
const InlinePlaceholderDropdown = ({ 
  placeholderId, 
  currentValue, 
  onValueChange, 
  onClose,
  triggerElement 
}: { 
  placeholderId: string; 
  currentValue: string; 
  onValueChange: (value: string) => void; 
  onClose: () => void;
  triggerElement: HTMLElement | null;
}) => {
  const config = placeholderConfigs[placeholderId];
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, placement: 'below' as 'below' | 'above' });
  const [isPositioned, setIsPositioned] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!config?.options || !searchTerm.trim()) return config?.options || [];
    
    const term = searchTerm.toLowerCase().trim();
    return config.options.filter(option => 
      option.label.toLowerCase().includes(term) ||
      option.description?.toLowerCase().includes(term)
    );
  }, [config?.options, searchTerm]);

  useEffect(() => {
    if (!triggerElement) return;

    const updatePosition = () => {
      const triggerRect = triggerElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const dropdownHeight = 280;
      const dropdownWidth = 288; // w-72 = 18rem = 288px

      // Check if there's enough space below
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;

      let top: number;
      let placement: 'below' | 'above';
      
      // Position above if not enough space below AND there's more space above
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        top = triggerRect.top - dropdownHeight - 8; // 8px gap
        placement = 'above';
      } else {
        top = triggerRect.bottom + 8; // 8px gap
        placement = 'below';
      }

      // Ensure dropdown doesn't go off-screen horizontally
      let left = triggerRect.left;
      if (left + dropdownWidth > viewportWidth) {
        left = viewportWidth - dropdownWidth - 16; // 16px margin
      }
      if (left < 16) {
        left = 16; // 16px margin
      }

      setPosition({ top, left, placement });
      setIsPositioned(true);
    };

    // Initial position calculation
    updatePosition();

    // Focus search input after positioning
    setTimeout(() => searchInputRef.current?.focus(), 50);

    // Recalculate on scroll or resize
    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [triggerElement]);

  if (!config?.options || !triggerElement) return null;

  const shouldShowSearch = config.options.length > 4;

  const dropdownContent = (
    <div 
      ref={dropdownRef}
      className={`fixed z-[9999] w-72 bg-background border border-border/50 rounded-xl shadow-xl ring-1 ring-primary/10 overflow-hidden backdrop-blur-sm transition-opacity duration-150 ${
        isPositioned ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="p-3">
        <div className="text-xs font-medium text-muted-foreground mb-3 px-1">
          Select {config.label}
        </div>
        
        {/* Search Input */}
        {shouldShowSearch && (
          <div className="mb-3">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${config.label.toLowerCase()}...`}
              className="w-full px-3 py-2 text-sm bg-muted/50 border border-border/30 rounded-lg placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all duration-200"
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Escape') {
                  onClose();
                } else if (e.key === 'Enter' && filteredOptions.length > 0) {
                  onValueChange(filteredOptions[0].value);
                  onClose();
                }
              }}
            />
          </div>
        )}
        
        {/* Options List */}
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onValueChange(option.value);
                  onClose();
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 hover:scale-[1.02] ${
                  currentValue === option.value 
                    ? 'bg-primary/20 text-primary border border-primary/30 shadow-sm' 
                    : 'hover:bg-accent/80 border border-transparent'
                }`}
              >
                <div className="font-medium">{option.label}</div>
                {option.description && (
                  <div className="text-xs text-muted-foreground/80 mt-0.5 leading-relaxed">{option.description}</div>
                )}
              </button>
            ))
          ) : shouldShowSearch && searchTerm ? (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              No {config.label.toLowerCase()} found matching "{searchTerm}"
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  // Render dropdown as portal to document.body to escape container constraints
  return typeof document !== 'undefined' ? createPortal(dropdownContent, document.body) : null;
};

// New function to render interactive question text with subtle link-style placeholders
const renderInteractiveQuestion = (
  question: Question, 
  values: Record<string, string> = {},
  onPlaceholderClick?: (placeholderId: string) => void,
  editingPlaceholder?: { questionId: string; placeholderId: string } | null,
  onPlaceholderChange?: (placeholderId: string, value: string) => void,
  onSubmit?: () => void,
  showSubmitButton?: boolean
) => {
  if (!hasPlaceholders(question.text)) {
    return <span>{question.text}</span>;
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const placeholderRegex = /\{(\w+)\}/g;
  let match;

  while ((match = placeholderRegex.exec(question.text)) !== null) {
    const [fullMatch, placeholderId] = match;
    const startIndex = match.index;
    
    // Add text before placeholder
    if (startIndex > lastIndex) {
      parts.push(<span key={`text-${lastIndex}`}>{question.text.slice(lastIndex, startIndex)}</span>);
    }
    
    // Add interactive placeholder with subtle link-style
    const config = placeholderConfigs[placeholderId];
    const currentValue = values[placeholderId] || config?.defaultValue || '';
    const displayValue = config?.options?.find(opt => opt.value === currentValue)?.label || currentValue || placeholderId;
    const isEditing = editingPlaceholder?.questionId === question.text && editingPlaceholder?.placeholderId === placeholderId;
    
    parts.push(
      <span key={`${placeholderId}-${startIndex}`} className="relative inline-block mx-0.5">
        <button
          ref={(el) => {
            if (el && isEditing) {
              // Store reference for dropdown positioning
              el.dataset.triggerRef = 'true';
            }
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation(); // ALWAYS stop propagation for placeholder button clicks
            console.log('🎯 Placeholder button clicked:', placeholderId);
            onPlaceholderClick?.(placeholderId);
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation(); // Also stop on mousedown to prevent any bubbling
          }}
          className={`inline-flex items-center gap-0.5 px-1 text-primary hover:text-primary/80 underline decoration-dotted underline-offset-2 hover:decoration-solid transition-all duration-150 ${
            isEditing ? 'text-primary font-medium bg-primary/5 rounded' : 'font-normal'
          }`}
          title={`Click to change ${config?.label || placeholderId}`}
        >
          {displayValue}
          <ChevronDown className={`h-3 w-3 ml-0.5 opacity-60 transition-all duration-150 ${
            isEditing ? 'rotate-180 opacity-100' : 'group-hover:opacity-100'
          }`} />
        </button>
        
        {isEditing && (
          <InlinePlaceholderDropdown
            placeholderId={placeholderId}
            currentValue={currentValue}
            onValueChange={(value) => onPlaceholderChange?.(placeholderId, value)}
            onClose={() => onPlaceholderClick?.('')} // Close by clearing editing state
            triggerElement={document.querySelector(`[data-trigger-ref="true"]`) as HTMLElement}
          />
        )}
      </span>
    );
    
    lastIndex = startIndex + fullMatch.length;
  }
  
  // Add remaining text
  if (lastIndex < question.text.length) {
    parts.push(<span key={`text-${lastIndex}`}>{question.text.slice(lastIndex)}</span>);
  }
  
  return <span className="inline-flex items-baseline flex-wrap gap-0 group">{parts}</span>;
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
  const [mode, setMode] = useState<'overview' | 'category' | 'configure'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});
  const [inlinePlaceholderValues, setInlinePlaceholderValues] = useState<Record<string, Record<string, string>>>({});
  const [editingPlaceholder, setEditingPlaceholder] = useState<{ questionId: string; placeholderId: string } | null>(null);
  const [recentlyModifiedQuestion, setRecentlyModifiedQuestion] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Typing animation for placeholder with responsive questions
  const placeholderQuestions = [
    "What's my biggest risk exposure?",
    "Should I rebalance my portfolio?",
    "Which stocks are underperforming?",
    "What's my YTD performance vs S&P 500?",
    "How should I reduce concentration risk?",
    "What sectors should I consider selling?",
    "Am I too heavily invested in tech?",
    "What's driving my recent losses?"
  ];

  const tabletPlaceholderQuestions = [
    "Biggest risk exposure?",
    "Should I rebalance?",
    "Which stocks underperform?",
    "YTD performance vs S&P 500?",
    "Reduce concentration risk?",
    "Sectors to sell?",
    "Too heavy in tech?",
    "Recent losses cause?"
  ];

  const mobilePlaceholderQuestions = [
    "Biggest risk?",
    "Rebalance?",
    "Underperformers?",
    "YTD vs S&P?",
    "Reduce risk?",
    "Sell sectors?",
    "Too much tech?",
    "Loss cause?"
  ];

  const { displayedText: displayedPlaceholder } = useTypingAnimation({
    questions: placeholderQuestions,
    tabletQuestions: tabletPlaceholderQuestions,
    mobileQuestions: mobilePlaceholderQuestions,
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
      setSelectedQuestion(null);
      setPlaceholderValues({});
      setEditingPlaceholder(null);
      setRecentlyModifiedQuestion(null);
      
      // Scroll to top of overlay content
      setTimeout(() => {
        // Scroll desktop overlay to top
        const desktopOverlay = document.querySelector('[data-search-overlay-desktop]');
        if (desktopOverlay) {
          desktopOverlay.scrollTop = 0;
        }
        
        // Scroll mobile overlay to top
        const mobileOverlay = document.querySelector('[data-search-overlay-mobile]');
        if (mobileOverlay) {
          mobileOverlay.scrollTop = 0;
        }
        
        // Focus the input
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Unified search filtering across all questions and categories
  const filteredQuestions = useMemo(() => {
    if (!searchValue || searchValue.trim() === "") {
      return mode === 'category' && selectedCategory
        ? allQuestions.filter(q => q.categories.includes(selectedCategory))
        : allQuestions.slice(0, 5); // Show fewer when no search
    }

    const searchTerm = searchValue.toLowerCase().trim();
    const questions = mode === 'category' && selectedCategory
      ? allQuestions.filter(q => q.categories.includes(selectedCategory))
      : allQuestions;
      
    return questions
      .filter(question => {
        const displayText = getDisplayText(question).toLowerCase();
        const categoriesText = question.categories.join(' ').toLowerCase();
        const tagsText = question.tags?.join(' ').toLowerCase() || '';
        
        return displayText.includes(searchTerm) ||
               categoriesText.includes(searchTerm) ||
               tagsText.includes(searchTerm);
      })
      .slice(0, 8); // More results when searching
  }, [searchValue, mode, selectedCategory]);

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setMode('category');
    onCategorySelect?.(categoryName);
    console.log('Category selected:', categoryName);
  };

  const handleQuestionClick = (questionText: string) => {
    // Clear any open placeholder dropdowns when clicking on any question
    setEditingPlaceholder(null);
    
    // Check if this question has placeholders
    const questionObj = allQuestions.find(q => getDisplayText(q) === questionText);
    
    if (questionObj && hasPlaceholders(questionObj.text)) {
      setSelectedQuestion(questionObj);
      setMode('configure');
      
      // Initialize placeholder values with defaults
      const placeholders = extractPlaceholders(questionObj.text);
      const initialValues: Record<string, string> = {};
      
      placeholders.forEach(placeholder => {
        const config = placeholderConfigs[placeholder];
        if (config?.defaultValue) {
          initialValues[placeholder] = config.defaultValue;
        }
      });
      
      setPlaceholderValues(initialValues);
      return;
    }
    
    onQuestionSelect?.(questionText);
    console.log('Question selected:', questionText);
    onClose?.();
  };

  const handleBackToOverview = () => {
    setMode('overview');
    setSelectedCategory(null);
    setSelectedQuestion(null);
    setPlaceholderValues({});
    setEditingPlaceholder(null);
    setRecentlyModifiedQuestion(null);
  };

  const handleInlinePlaceholderClick = (question: Question, placeholderId: string) => {
    const questionId = question.text; // Use question text as unique ID
    setEditingPlaceholder({ questionId, placeholderId });
    // Immediately mark as recently modified to prevent any auto-submission
    setRecentlyModifiedQuestion(questionId);
  };

  const handleInlinePlaceholderChange = (questionId: string, placeholderId: string, value: string) => {
    setInlinePlaceholderValues(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [placeholderId]: value
      }
    }));
    // Close the editing dropdown
    setEditingPlaceholder(null);
    // Mark this question as recently modified to prevent auto-submission
    setRecentlyModifiedQuestion(questionId);
    // Clear the flag after a shorter delay to allow immediate submission
    setTimeout(() => {
      setRecentlyModifiedQuestion(null);
    }, 100);
  };

  const getInlineValues = (question: Question): Record<string, string> => {
    return inlinePlaceholderValues[question.text] || {};
  };

  const handleInlineQuestionSubmit = (question: Question) => {
    const values = getInlineValues(question);
    const placeholders = extractPlaceholders(question.text);
    
    // Merge inline values with defaults to ensure all placeholders are resolved
    const valuesWithDefaults: Record<string, string> = {};
    placeholders.forEach(placeholder => {
      const value = values[placeholder];
      const config = placeholderConfigs[placeholder];
      valuesWithDefaults[placeholder] = value || config?.defaultValue || placeholder;
    });
    
    const finalQuestion = replacePlaceholders(question.text, valuesWithDefaults);
    
    // Clear editing state before submitting to close any open dropdowns
    setEditingPlaceholder(null);
    
    onQuestionSelect?.(finalQuestion);
    onClose?.();
  };

  const hasMultiplePlaceholders = (question: Question): boolean => {
    return extractPlaceholders(question.text).length > 1;
  };

  const isQuestionReadyToSubmit = (question: Question): boolean => {
    const placeholders = extractPlaceholders(question.text);
    const values = getInlineValues(question);
    return placeholders.every(placeholder => {
      const value = values[placeholder];
      const config = placeholderConfigs[placeholder];
      return value || config?.defaultValue;
    });
  };

  const handlePlaceholderValueChange = (placeholderId: string, value: string) => {
    setPlaceholderValues(prev => ({
      ...prev,
      [placeholderId]: value
    }));
  };

  const handleConfigureSubmit = () => {
    if (!selectedQuestion) return;
    
    // Replace placeholders with selected values
    const finalQuestion = replacePlaceholders(selectedQuestion.text, placeholderValues);
    
    onQuestionSelect?.(finalQuestion);
    onClose?.();
  };

  const currentQuestions = mode === 'category' && selectedCategory
    ? allQuestions.filter(q => q.categories.includes(selectedCategory))
    : allQuestions;

  return (
    <>
      {/* Desktop Overlay - dropdown style with focus trap */}
      <div 
        className={`hidden md:block absolute top-full left-0 right-0 mt-2 z-[80] transition-all duration-300 ease-out ${
          isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
        }`}
        onMouseDown={(e) => {
          // Only prevent default for non-text elements to allow text selection
          const target = e.target as HTMLElement;
          const isTextSelectable = target.tagName === 'SPAN' || 
                                   target.tagName === 'P' || 
                                   target.tagName === 'DIV' ||
                                   target.closest('input') ||
                                   target.closest('[contenteditable]');
          
          if (!isTextSelectable) {
            e.preventDefault();
          }
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
            if (e.key === 'Enter') {
              // Submit the current search value as a question
              if (searchValue && searchValue.trim()) {
                onQuestionSelect?.(searchValue.trim());
              }
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
            <div className="px-4 pb-3 pt-2 text-xs text-muted-foreground/80 flex items-center justify-between">
              <span>{searchValue ? "Ask anything or select from suggestions" : "Browse questions or ask anything about your portfolio"}</span>
              <span className="hidden sm:inline text-muted-foreground/60">↑↓ navigate • Enter to ask • Esc to close</span>
            </div>
          </div>
          
          {mode === 'configure' ? (
            /* Question Configuration View */
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
                  <div className="flex items-center gap-2 px-2 py-1 bg-background rounded-full border border-border/50">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <Target className="h-4 w-4" />
                    <span className="text-sm font-medium">Configure Question</span>
                  </div>
                </div>
              </div>

              {selectedQuestion && (
                <div className="px-4 py-4 space-y-6">
                  {/* Question Preview */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-foreground">Question Preview</h3>
                    <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                      <p className="text-sm text-foreground leading-relaxed">
                        {replacePlaceholders(selectedQuestion.text, placeholderValues)}
                      </p>
                    </div>
                  </div>

                  {/* Category Tags */}
                  <div className="flex flex-wrap gap-2">
                    {selectedQuestion.categories.map((category, index) => {
                      const categoryInfo = getCategoryInfo(category);
                      return (
                        <div key={index} className="flex items-center gap-1.5 px-2 py-1 bg-background rounded-full border border-border/50">
                          {categoryInfo && <div className={`w-2 h-2 rounded-full ${categoryInfo.color}`} />}
                          <span className="text-xs text-muted-foreground">{category}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Configuration */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-foreground">Configure Parameters</h3>
                    {extractPlaceholders(selectedQuestion.text).map((placeholderId) => {
                      const config = placeholderConfigs[placeholderId];
                      if (!config) return null;

                      return (
                        <div key={placeholderId} className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            {config.label}
                          </label>
                          {config.type === 'select' && config.options ? (
                            <Select
                              value={placeholderValues[placeholderId] || config.defaultValue || ''}
                              onValueChange={(value) => handlePlaceholderValueChange(placeholderId, value)}
                            >
                              <SelectTrigger className="w-full h-11 bg-background border-border/50 hover:border-primary/50 focus:border-primary transition-all duration-200">
                                <SelectValue placeholder={`Select ${config.label.toLowerCase()}`} />
                              </SelectTrigger>
                              <SelectContent className="max-h-60">
                                {config.options.map((option) => (
                                  <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                                    <div className="space-y-1">
                                      <div className="font-medium">{option.label}</div>
                                      {option.description && (
                                        <div className="text-xs text-muted-foreground">{option.description}</div>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <input
                              type="text"
                              value={placeholderValues[placeholderId] || config.defaultValue || ''}
                              onChange={(e) => handlePlaceholderValueChange(placeholderId, e.target.value)}
                              className="w-full h-11 px-3 bg-background border border-border/50 rounded-lg hover:border-primary/50 focus:border-primary focus:outline-none transition-all duration-200"
                              placeholder={`Enter ${config.label.toLowerCase()}`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <Button
                      onClick={handleConfigureSubmit}
                      className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm hover:shadow-md transition-all duration-200"
                      disabled={extractPlaceholders(selectedQuestion.text).some(p => !placeholderValues[p] && !placeholderConfigs[p]?.defaultValue)}
                    >
                      Ask Question
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : mode === 'category' ? (
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

              <CommandList className="max-h-[60vh]" data-search-overlay-desktop>
                <CommandGroup>
                  {filteredQuestions.map((question, index) => (
                    <CommandItem
                      key={index}
                      value={question.text}
                      className="px-4 py-3 text-sm hover:bg-accent/50 cursor-pointer transition-all duration-200 rounded-md mx-2 my-0.5 border-l-2 border-transparent hover:border-primary/30"
                      onSelect={() => {
                        console.log('🎯 Category view question selected:', question.text);
                        
                        // Clear any open placeholder dropdowns first
                        if (editingPlaceholder) {
                          console.log('🔄 Clearing placeholder dropdown before question submission');
                          setEditingPlaceholder(null);
                        }
                        
                        if (hasPlaceholders(question.text)) {
                          // Use the proper readiness check that considers defaults
                          if (isQuestionReadyToSubmit(question)) {
                            console.log('🚀 Question is ready - submitting with all placeholders resolved');
                            handleInlineQuestionSubmit(question);
                          } else {
                            console.log('🔧 Question not ready - going to config mode');
                            handleQuestionClick(question.text);
                          }
                        } else {
                          console.log('🔤 Submitting plain question (no placeholders)');
                          handleQuestionClick(question.text);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <span className="flex-1">
                          {renderInteractiveQuestion(
                            question,
                            getInlineValues(question),
                            (placeholderId) => handleInlinePlaceholderClick(question, placeholderId),
                            editingPlaceholder,
                            (placeholderId, value) => handleInlinePlaceholderChange(question.text, placeholderId, value)
                          )}
                        </span>
                        <div className="flex items-center gap-1">
                          {hasPlaceholders(question.text) && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 hover:bg-primary/20 rounded-full border border-primary/20 transition-all duration-200">
                                    <Settings className="h-3 w-3 text-primary/80" />
                                    <span className="text-xs text-primary/80 font-medium">Customizable</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-48">
                                  <p className="text-xs">This question has customizable parameters. Click on underlined text to modify accounts, timeframes, or other settings.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          <ChevronRight className="h-3 w-3 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                        </div>
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
            <CommandList className="max-h-[60vh]" data-search-overlay-desktop>
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
                      const categoryInfo = getCategoryInfo(question.categories[0]);
                      return (
                        <CommandItem
                          key={index}
                          value={question.text}
                          onSelect={() => {
                        // Clear any open placeholder dropdowns before question submission
                        if (editingPlaceholder) {
                          setEditingPlaceholder(null);
                        }
                        
                        if (hasPlaceholders(question.text)) {
                          const values = getInlineValues(question);
                          // Auto-submit if any placeholders have been configured, otherwise go to config mode
                          if (Object.keys(values).length > 0 || !hasMultiplePlaceholders(question)) {
                            handleInlineQuestionSubmit(question);
                          } else {
                            handleQuestionClick(question.text);
                          }
                        } else {
                          handleQuestionClick(question.text);
                        }
                      }}
                          className="px-4 py-3 hover:bg-accent/50 cursor-pointer transition-all duration-200 rounded-md mx-2 my-0.5 group border-l-2 border-transparent hover:border-primary/30"
                        >
                          <div className="flex items-center gap-3 w-full">
                            <span className="text-sm flex-1 group-hover:text-foreground transition-colors">
                              {renderInteractiveQuestion(
                                question,
                                getInlineValues(question),
                                (placeholderId) => handleInlinePlaceholderClick(question, placeholderId),
                                editingPlaceholder,
                                (placeholderId, value) => handleInlinePlaceholderChange(question.text, placeholderId, value),
                                () => handleInlineQuestionSubmit(question),
                                hasMultiplePlaceholders(question)
                              )}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              {question.categories.slice(0, 2).map((categoryName, idx) => {
                                const categoryInfo = getCategoryInfo(categoryName);
                                return categoryInfo ? (
                                  <Badge 
                                    key={idx}
                                    variant="outline" 
                                    className="text-xs px-2 py-1 h-5 gap-1.5 border-border/50 hover:border-primary/30 transition-colors"
                                  >
                                    <div className={`w-1.5 h-1.5 rounded-full ${categoryInfo.color}`} />
                                    {categoryName}
                                  </Badge>
                                ) : null;
                              })}
                              {question.categories.length > 2 && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="outline" className="text-xs px-2 py-1 h-5 border-border/50 cursor-help hover:bg-accent/50 transition-colors">
                                        +{question.categories.length - 2}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-56">
                                      <p className="text-xs font-medium mb-1">Additional Categories</p>
                                      <div className="space-y-1">
                                        {question.categories.slice(2).map((category, index) => (
                                          <div key={index} className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${getCategoryInfo(category)?.color}`} />
                                            <span className="text-xs">{category}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {hasPlaceholders(question.text) && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 hover:bg-primary/20 rounded-full border border-primary/20 transition-all duration-200">
                                        <Settings className="h-3 w-3 text-primary/80" />
                                        <span className="text-xs text-primary/80 font-medium">Interactive</span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-48">
                                      <p className="text-xs">Customize this question by clicking on underlined parameters like accounts, timeframes, and benchmarks.</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              <ChevronRight className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                          </div>
                        </CommandItem>
                      );
                    })
                  ) : (
                    <CommandEmpty className="py-0">
                      <div className="p-6 text-center space-y-4 border-t border-border/30">
                        <div className="space-y-2">
                          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-3">
                            <Search className="h-6 w-6 text-primary" />
                          </div>
                          <h4 className="text-sm font-medium text-foreground">Ask Your Question</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Don't see what you're looking for? Ask me anything about your portfolio and I'll provide detailed analysis.
                          </p>
                        </div>
                        
                        <Button 
                          onClick={() => onQuestionSelect?.(searchValue.trim())}
                          className="w-full h-9 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
                          disabled={!searchValue.trim()}
                        >
                          Ask: "{searchValue}"
                        </Button>

                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground font-medium">Try asking:</p>
                          <div className="grid grid-cols-1 gap-2">
                            {[
                              "What's my biggest risk exposure?",
                              "How should I rebalance my portfolio?",
                              "Which holdings are underperforming?"
                            ].map((example, idx) => (
                              <button
                                key={idx}
                                onClick={() => onQuestionSelect?.(example)}
                                className="text-xs text-left p-2 rounded-md bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all duration-200 border border-transparent hover:border-border/50"
                              >
                                "{example}"
                              </button>
                            ))}
                          </div>
                        </div>
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
                    const categoryInfo = getCategoryInfo(question.categories[0]);
                    return (
                      <CommandItem
                        key={index}
                        value={question.text}
                        onSelect={() => {
                        // Clear any open placeholder dropdowns before question submission
                        if (editingPlaceholder) {
                          setEditingPlaceholder(null);
                        }
                        
                        if (hasPlaceholders(question.text)) {
                          const values = getInlineValues(question);
                          // Auto-submit if any placeholders have been configured, otherwise go to config mode
                          if (Object.keys(values).length > 0 || !hasMultiplePlaceholders(question)) {
                            handleInlineQuestionSubmit(question);
                          } else {
                            handleQuestionClick(question.text);
                          }
                        } else {
                          handleQuestionClick(question.text);
                        }
                      }}
                        className="px-4 py-3 hover:bg-accent/50 cursor-pointer transition-all duration-200 rounded-md mx-2 my-0.5 group border-l-2 border-transparent hover:border-primary/30"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <span className="text-sm flex-1 group-hover:text-foreground transition-colors">
                            {renderInteractiveQuestion(
                              question,
                              getInlineValues(question),
                              (placeholderId) => handleInlinePlaceholderClick(question, placeholderId),
                              editingPlaceholder,
                              (placeholderId, value) => handleInlinePlaceholderChange(question.text, placeholderId, value),
                              () => handleInlineQuestionSubmit(question),
                              hasMultiplePlaceholders(question)
                            )}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            {question.categories.slice(0, 1).map((categoryName, idx) => {
                              const categoryInfo = getCategoryInfo(categoryName);
                              return categoryInfo ? (
                                <Badge 
                                  key={idx}
                                  variant="outline" 
                                  className="text-xs px-2 py-1 h-5 gap-1.5 cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCategoryClick(categoryName);
                                  }}
                                >
                                  <div className={`w-1.5 h-1.5 rounded-full ${categoryInfo.color}`} />
                                  {categoryName}
                                </Badge>
                              ) : null;
                            })}
                            {question.categories.length > 1 && (
                              <Badge variant="outline" className="text-xs px-1.5 py-1 h-5 border-border/50">
                                +{question.categories.length - 1}
                              </Badge>
                            )}
                          </div>
                          {hasPlaceholders(question.text) ? (
                            <div className="flex items-center gap-1">
                              <Target className="h-3 w-3 text-primary/60" />
                              <ChevronRight className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                          ) : (
                            <ChevronRight className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
                          )}
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
                      <Tooltip key={category.name}>
                        <TooltipTrigger asChild>
                          <CommandItem
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
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{category.description}</p>
                        </TooltipContent>
                      </Tooltip>
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
              if (e.key === 'Enter') {
                // Submit the current search value as a question
                if (searchValue && searchValue.trim()) {
                  onQuestionSelect?.(searchValue.trim());
                }
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
              <div className="px-1 pb-3">
                <span className="text-xs text-muted-foreground/80">
                  {searchValue ? "Ask anything or tap suggestions" : "Browse questions or ask anything about your portfolio"}
                </span>
              </div>
            </div>
            <CommandList className="flex-1 px-2" data-search-overlay-mobile>
              {/* Enhanced mobile search results */}
              {searchValue && (
                <CommandGroup heading={
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground px-2 py-2">
                    <Search className="h-4 w-4" />
                    <span>Results ({filteredQuestions.length})</span>
                  </div>
                }>
                  {filteredQuestions.length > 0 ? (
                    filteredQuestions.map((question, index) => {
                      const categoryInfo = getCategoryInfo(question.categories[0]);
                      return (
                        <CommandItem
                          key={index}
                          value={question.text}
                          onSelect={() => {
                        // Clear any open placeholder dropdowns before question submission
                        if (editingPlaceholder) {
                          setEditingPlaceholder(null);
                        }
                        
                        if (hasPlaceholders(question.text)) {
                          const values = getInlineValues(question);
                          // Auto-submit if any placeholders have been configured, otherwise go to config mode
                          if (Object.keys(values).length > 0 || !hasMultiplePlaceholders(question)) {
                            handleInlineQuestionSubmit(question);
                          } else {
                            handleQuestionClick(question.text);
                          }
                        } else {
                          handleQuestionClick(question.text);
                        }
                      }}
                          className="px-4 py-4 rounded-lg mx-2 my-1 border border-border/30 hover:bg-accent/50 transition-all duration-200 active:scale-95"
                        >
                          <div className="flex flex-col gap-2 w-full">
                            <span className="text-sm font-medium">
                              {renderInteractiveQuestion(
                                question,
                                getInlineValues(question),
                                (placeholderId) => handleInlinePlaceholderClick(question, placeholderId),
                                editingPlaceholder,
                                (placeholderId, value) => handleInlinePlaceholderChange(question.text, placeholderId, value),
                                () => handleInlineQuestionSubmit(question),
                                hasMultiplePlaceholders(question)
                              )}
                            </span>
                            {categoryInfo && (
                              <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${categoryInfo.color}`} />
                                <span className="text-xs text-muted-foreground">{question.categories[0]}</span>
                              </div>
                            )}
                          </div>
                        </CommandItem>
                      );
                    })
                  ) : (
                    <CommandEmpty className="py-0">
                      <div className="px-4 py-8 text-center space-y-4">
                        <div className="space-y-3">
                          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <Search className="h-8 w-8 text-primary" />
                          </div>
                          <h4 className="text-base font-medium text-foreground">Ask Your Question</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Don't see what you're looking for? Ask me anything about your portfolio.
                          </p>
                        </div>
                        
                        <Button 
                          onClick={() => onQuestionSelect?.(searchValue.trim())}
                          className="w-full h-12 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
                          disabled={!searchValue.trim()}
                        >
                          Ask: "{searchValue}"
                        </Button>

                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground font-medium">Quick examples:</p>
                          <div className="grid grid-cols-1 gap-2">
                            {[
                              "What's my biggest risk?",
                              "Should I rebalance?",
                              "Which stocks are down?"
                            ].map((example, idx) => (
                              <button
                                key={idx}
                                onClick={() => onQuestionSelect?.(example)}
                                className="text-sm text-left p-3 rounded-lg bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all duration-200 border border-transparent hover:border-border/50 active:scale-95"
                              >
                                "{example}"
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CommandEmpty>
                  )}
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
                      const categoryInfo = getCategoryInfo(question.categories[0]);
                      return (
                        <CommandItem
                          key={index}
                          value={question.text}
                          onSelect={() => {
                        // Clear any open placeholder dropdowns before question submission
                        if (editingPlaceholder) {
                          setEditingPlaceholder(null);
                        }
                        
                        if (hasPlaceholders(question.text)) {
                          const values = getInlineValues(question);
                          // Auto-submit if any placeholders have been configured, otherwise go to config mode
                          if (Object.keys(values).length > 0 || !hasMultiplePlaceholders(question)) {
                            handleInlineQuestionSubmit(question);
                          } else {
                            handleQuestionClick(question.text);
                          }
                        } else {
                          handleQuestionClick(question.text);
                        }
                      }}
                          className="px-4 py-4 rounded-lg mx-2 my-1 border border-border/30 hover:bg-accent/50 transition-all duration-200 active:scale-95"
                        >
                          <div className="flex flex-col gap-2 w-full">
                            <span className="text-sm font-medium">
                              {renderInteractiveQuestion(
                                question,
                                getInlineValues(question),
                                (placeholderId) => handleInlinePlaceholderClick(question, placeholderId),
                                editingPlaceholder,
                                (placeholderId, value) => handleInlinePlaceholderChange(question.text, placeholderId, value),
                                () => handleInlineQuestionSubmit(question),
                                hasMultiplePlaceholders(question)
                              )}
                            </span>
                            {categoryInfo && (
                              <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${categoryInfo.color}`} />
                                <span className="text-xs text-muted-foreground">{question.categories[0]}</span>
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
                        <Tooltip key={category.name}>
                          <TooltipTrigger asChild>
                            <CommandItem
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
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{category.description}</p>
                          </TooltipContent>
                        </Tooltip>
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