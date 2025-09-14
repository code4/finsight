import { memo, useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, RefreshCw, Download, User, TrendingUp, MessageCircle, ExternalLink, ArrowUpDown, ArrowUp, ArrowDown, Search, Filter } from "lucide-react";
import FinancialChart from "@/components/FinancialChart";
import FollowUpChips from "@/components/FollowUpChips";

// Utility function to clean up placeholder text for display
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
      return placeholder.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
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
  timeframe: string;
  isUnmatched?: boolean;
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
  accounts = ["Growth Portfolio", "Conservative Fund"],
  timeframe = "YTD",
  isUnmatched = false,
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
  onFollowUpClick
}: AnswerCardProps) {
  
  const handleRefresh = () => {
    onRefresh?.();
    console.log('Answer refreshed');
  };

  const handleExport = () => {
    onExport?.();
    console.log('Answer exported');
  };

  return (
    <Card className="mb-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500 hover-elevate transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-200" data-testid="text-question">
              {cleanQuestionText(question)}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {accounts.map((account, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs transition-all duration-200 hover:scale-105"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {account}
                </Badge>
              ))}
              <Badge variant="secondary" className="text-xs transition-all duration-200 hover:scale-105">
                {timeframe}
              </Badge>
              <Badge variant="outline" className="text-xs gap-1 transition-all duration-200 hover:scale-105">
                <Calendar className="h-3 w-3" />
                As of {asOfDate}
              </Badge>
            </div>
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover-elevate transition-all duration-200 hover:rotate-180"
              onClick={handleRefresh}
              data-testid="button-refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover-elevate transition-all duration-200 hover:scale-110"
              onClick={handleExport}
              data-testid="button-export"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {(isUnmatched || content?.isUnmatched) ? (
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
          /* Regular content for matched questions */
          <>
            {/* Paragraph */}
            {content.paragraph && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {content.paragraph}
              </p>
            )}

            {/* KPIs */}
            {content.kpis && (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {content.kpis.map((kpi, index) => (
                  <div 
                    key={index} 
                    className="bg-muted/50 rounded-lg p-4 text-center hover-elevate transition-all duration-300 hover:scale-105 group animate-in fade-in-50 slide-in-from-bottom-2"
                    style={{ animationDelay: `${index * 150 + 200}ms` }}
                  >
                    <div className="text-2xl lg:text-3xl font-mono font-bold mb-1 group-hover:scale-110 transition-transform duration-200" data-testid={`text-kpi-value-${index}`}>
                      {kpi.value}
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">{kpi.label}</div>
                    <div className={`text-xs font-medium transition-all duration-200 ${
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
              <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${(content.kpis?.length || 0) * 150 + 400}ms` }}>
                <h4 className="text-sm font-medium mb-3 text-muted-foreground">Performance Comparison</h4>
                <div className="rounded-lg border border-border/50 p-4 bg-muted/30 hover-elevate transition-all duration-300">
                  <FinancialChart data={content.chartData} />
                </div>
              </div>
            )}

            {/* Metrics */}
            {content.metrics && (
              <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${(content.kpis?.length || 0) * 150 + 500}ms` }}>
                <h4 className="text-sm font-medium mb-3 text-muted-foreground">Additional Metrics</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {content.metrics.map((metric, index) => (
                    <div key={index} className="bg-muted/50 rounded-lg p-4 hover-elevate transition-all duration-300 hover:scale-105">
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
                  {content.highlights.map((highlight, index) => (
                    <div key={index} className="bg-muted/30 rounded-lg p-3 border-l-4 border-primary/30 hover-elevate transition-all duration-300">
                      <p className="text-sm leading-relaxed">{highlight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-up Questions */}
            <FollowUpChips 
              questions={followUpQuestions}
              onQuestionClick={onFollowUpClick}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
});

export default AnswerCard;