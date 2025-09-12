import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, RefreshCw, Download } from "lucide-react";
import FinancialChart from "@/components/FinancialChart";
import FollowUpChips from "@/components/FollowUpChips";

interface KPI {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
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

export default function AnswerCard({
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
              {question}
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
        {isUnmatched ? (
          /* Fallback content for unmatched questions */
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Question Added for Review</h4>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                We've added your question to our development list and will review it for inclusion in future platform updates. 
                Our team will work to provide comprehensive analytics for this type of query.
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              Pending Review
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

            {/* Chart */}
            {content.chartData && (
              <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${(content.kpis?.length || 0) * 150 + 400}ms` }}>
                <h4 className="text-sm font-medium mb-3 text-muted-foreground">Performance Comparison</h4>
                <div className="rounded-lg border border-border/50 p-4 bg-muted/30 hover-elevate transition-all duration-300">
                  <FinancialChart data={content.chartData} />
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
}