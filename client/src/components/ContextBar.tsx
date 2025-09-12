import { useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Clock, Wifi } from "lucide-react";

interface Account {
  id: string;
  accountNumber: string;
  name: string;
  alias?: string;
  type: string;
  balance: number;
}

interface ContextBarProps {
  selectedAccounts: Account[];
  timeframe: string;
  onTimeframeChange: (timeframe: string) => void;
}

const timeframes = [
  { value: "ytd", label: "YTD" },
  { value: "1m", label: "1M" },
  { value: "3m", label: "3M" },
  { value: "6m", label: "6M" },
  { value: "1y", label: "1Y" },
  { value: "3y", label: "3Y" },
  { value: "prev_quarter", label: "Previous Quarter" },
  { value: "custom", label: "Custom Range" }
];

export default function ContextBar({ 
  selectedAccounts,
  timeframe,
  onTimeframeChange
}: ContextBarProps) {
  const formatBalance = (balance: number): string => {
    if (balance >= 1_000_000) {
      return `$${(balance / 1_000_000).toFixed(1)}M`;
    } else if (balance >= 1_000) {
      return `$${(balance / 1_000).toFixed(0)}K`;
    }
    return `$${balance.toLocaleString()}`;
  };

  const handleTimeframeChange = (value: string) => {
    onTimeframeChange(value);
  };

  // Calculate portfolio summary metrics
  const portfolioSummary = useMemo(() => {
    const totalValue = selectedAccounts.reduce((sum, account) => sum + account.balance, 0);
    // Mock performance data - in real app, this would come from props or API
    const mockPerformance = {
      ytdReturn: 12.4,
      dayChange: 1.8,
      isPositive: true
    };
    
    return {
      totalValue,
      performance: mockPerformance
    };
  }, [selectedAccounts]);

  // Mock data freshness (in real app, this would be passed as prop)
  const lastUpdateTime = useMemo(() => {
    return new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
  }, []);

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  return (
    <div className="bg-card border-b border-card-border">
      {/* Top row - Portfolio Summary */}
      <div className="px-2 sm:px-4 py-2 border-b border-border/30">
        <div className="flex items-center justify-between">
          {/* Portfolio Value & Performance */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Portfolio Value:</span>
              <span className="text-lg font-mono font-bold" data-testid="text-portfolio-value">
                {formatBalance(portfolioSummary.totalValue)}
              </span>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                portfolioSummary.performance.isPositive 
                  ? 'bg-chart-2/20 text-chart-2' 
                  : 'bg-chart-3/20 text-chart-3'
              }`}>
                {portfolioSummary.performance.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{portfolioSummary.performance.isPositive ? '+' : ''}{portfolioSummary.performance.ytdReturn}%</span>
                <span className="text-muted-foreground">YTD</span>
              </div>
            </div>
          </div>
          
          {/* Connection Status & Data Freshness */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Wifi className="h-3 w-3 text-chart-2" />
              <span className="hidden sm:inline">Live</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatRelativeTime(lastUpdateTime)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row - Timeframe Selection */}
      <div className="px-2 sm:px-4 py-3">
        <div className="flex items-center justify-between w-full min-h-9">
          {/* Left side - Account info */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-sm font-medium text-muted-foreground">
              {selectedAccounts.length} account{selectedAccounts.length !== 1 ? 's' : ''} selected
            </span>
          </div>

          {/* Right side - Timeframe Selection */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-medium text-muted-foreground hidden sm:block">Period:</span>
            <Select value={timeframe} onValueChange={handleTimeframeChange}>
              <SelectTrigger className="w-24 sm:w-32" data-testid="select-timeframe-trigger">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeframes.map((tf) => (
                  <SelectItem key={tf.value} value={tf.value} data-testid={`select-item-${tf.value}`}>
                    {tf.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}