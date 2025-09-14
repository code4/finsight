export interface Question {
  id: string;
  text: string;
  intentKey?: string;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  icon: string;
  questions: Question[];
}

export const questionCatalog: Category[] = [
  {
    id: "performance",
    title: "Performance Analysis",
    description: "Review returns, benchmarks, and performance metrics",
    icon: "📈",
    questions: [
      { id: "ytd-performance", text: "What's the YTD performance vs S&P 500?" },
      { id: "total-return", text: "What's the total return over the past 3 years?" },
      { id: "performance-drivers", text: "What's driving my portfolio's outperformance this quarter?" },
      { id: "peer-comparison", text: "How does my risk-adjusted return compare to peers?" },
      { id: "performance-attribution", text: "What are the top contributors to performance?" },
      { id: "underperformers", text: "Which positions are dragging down performance?" },
      { id: "rolling-returns", text: "Show me 12-month rolling returns" },
      { id: "drawdown-analysis", text: "What's the maximum drawdown period?" }
    ]
  },
  {
    id: "risk",
    title: "Risk Assessment",
    description: "Analyze volatility, correlation, and risk metrics",
    icon: "⚖️",
    questions: [
      { id: "beta-volatility", text: "What's the portfolio's beta and volatility?" },
      { id: "sharpe-ratio", text: "What's the current Sharpe ratio?" },
      { id: "vix-correlation", text: "What's my correlation to the VIX?" },
      { id: "sector-risk", text: "How concentrated is my portfolio by sector?" },
      { id: "value-at-risk", text: "What's the portfolio's Value at Risk (VaR)?" },
      { id: "stress-testing", text: "How would a 2008-style crisis affect my positions?" },
      { id: "interest-rate-risk", text: "How would rising rates affect my positions?" },
      { id: "currency-exposure", text: "What's my exposure to currency risk?" }
    ]
  },
  {
    id: "holdings",
    title: "Holdings Analysis",
    description: "Deep dive into positions and portfolio composition",
    icon: "🏆",
    questions: [
      { id: "top-holdings", text: "Show me the top 10 holdings by weight" },
      { id: "sector-allocation", text: "How is the portfolio allocated by sector?" },
      { id: "regional-allocation", text: "What's my geographic allocation?" },
      { id: "position-sizing", text: "Are any positions overweight relative to benchmarks?" },
      { id: "recent-additions", text: "What are the most recent additions to the portfolio?" },
      { id: "holding-analysis", text: "Analyze my largest holding in detail" },
      { id: "style-analysis", text: "What's the growth vs value tilt?" },
      { id: "market-cap", text: "Show me the market cap distribution" }
    ]
  },
  {
    id: "allocation",
    title: "Allocation Analysis", 
    description: "Asset allocation and diversification insights",
    icon: "🏢",
    questions: [
      { id: "asset-allocation", text: "What's my current asset allocation?" },
      { id: "sector-breakdown", text: "Show sector allocation breakdown" },
      { id: "geographic-weights", text: "What are my geographic weights?" },
      { id: "style-allocation", text: "How is the portfolio allocated by investment style?" },
      { id: "concentration-risk", text: "Where is my portfolio most concentrated?" },
      { id: "diversification", text: "How well diversified is my portfolio?" },
      { id: "benchmark-comparison", text: "How does my allocation compare to S&P 500?" },
      { id: "rebalancing", text: "What positions need rebalancing?" }
    ]
  },
  {
    id: "activity",
    title: "Activity & Trading",
    description: "Transaction history and trading patterns",
    icon: "📊",
    questions: [
      { id: "recent-trades", text: "What were the largest trades last month?" },
      { id: "trading-activity", text: "Show me recent portfolio activity summary" },
      { id: "turnover-rate", text: "What's the portfolio turnover rate?" },
      { id: "cash-flows", text: "Show me cash flows in and out this year" },
      { id: "trade-analysis", text: "Analyze my best and worst trades" },
      { id: "cost-basis", text: "What's the cost basis of major positions?" },
      { id: "realized-gains", text: "Show realized gains and losses YTD" },
      { id: "pending-orders", text: "Are there any pending trades or orders?" }
    ]
  },
  {
    id: "income",
    title: "Income & Dividends",
    description: "Dividend analysis and income generation",
    icon: "💰",
    questions: [
      { id: "dividend-income", text: "How much dividend income was generated this year?" },
      { id: "yield-analysis", text: "What's my portfolio's current yield?" },
      { id: "dividend-growth", text: "Which holdings have growing dividends?" },
      { id: "payout-schedule", text: "When are my next dividend payments?" },
      { id: "yield-comparison", text: "How does my yield compare to benchmarks?" },
      { id: "dividend-quality", text: "What's the quality of my dividend-paying stocks?" },
      { id: "income-sustainability", text: "Are my dividend payments sustainable?" },
      { id: "tax-efficiency", text: "How tax-efficient is my income strategy?" }
    ]
  },
  {
    id: "comparison",
    title: "Comparison & Benchmarks",
    description: "Compare against indices and peer groups",
    icon: "🔍",
    questions: [
      { id: "benchmark-performance", text: "How do I compare to relevant benchmarks?" },
      { id: "peer-analysis", text: "How does my performance compare to similar portfolios?" },
      { id: "index-tracking", text: "How closely do I track major indices?" },
      { id: "alpha-generation", text: "Am I generating alpha vs benchmarks?" },
      { id: "correlation-analysis", text: "What's my correlation to major asset classes?" },
      { id: "relative-strength", text: "Which holdings show relative strength?" },
      { id: "factor-exposure", text: "What's my exposure to factor tilts?" },
      { id: "momentum-analysis", text: "Which holdings have the highest momentum?" }
    ]
  }
];