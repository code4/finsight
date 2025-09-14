// Enhanced Financial Question Data with Comprehensive Timeframes and Categories
// SINGLE SOURCE OF TRUTH for all financial data across the application

export interface PlaceholderOption {
  value: string;
  label: string;
  description?: string;
}

export interface PlaceholderDefinition {
  type: string;
  label: string;
  description: string;
  examples: string;
  editorType: 'OPTIONS' | 'DATE' | 'TEXT' | 'NUMBER';
  isName: boolean;
  options: PlaceholderOption[];
  defaultOption: PlaceholderOption;
}

export interface QuestionPlaceholder {
  type: string;
  name: string;
  value: string;
  label: string;
}

export interface FinancialQuestion {
  id: string;
  sentence: string;
  placeholders: QuestionPlaceholder[];
  category: string;
}

// New interface for simple text-based questions with placeholders
export interface SimpleQuestion {
  text: string;
  categories: string[];
  tags?: string[];
}

// Category information with icons and colors
export interface CategoryInfo {
  name: string;
  icon: string; // Icon name from lucide-react
  color: string;
  description?: string;
}

// Enhanced Timeframe Options
export const TIMEFRAME_OPTIONS: PlaceholderOption[] = [
  { value: "MTD", label: "Month to date" },
  { value: "1M", label: "One month" },
  { value: "1Y", label: "One year" },
  { value: "PY", label: "Previous calendar year" },
  { value: "PM", label: "Previous month" },
  { value: "PQ", label: "Previous quarter" },
  { value: "YTD", label: "Year to date" },
  { value: "3M", label: "Three months" },
  { value: "6M", label: "Six months" },
  { value: "2Y", label: "Two years" },
  { value: "5Y", label: "Five years" }
];

// Enhanced Benchmark Options with consistent IDs and descriptions
export const BENCHMARK_OPTIONS: PlaceholderOption[] = [
  { value: "spxtr", label: "S&P 500 TR Index", description: "Most common benchmark" },
  { value: "qqq", label: "Invesco QQQ Trust", description: "Tech-focused" },
  { value: "rlg", label: "Russell 1000 Growth", description: "Large cap growth" },
  { value: "rut", label: "Russell 2000", description: "Small cap" },
  { value: "bil", label: "Bloomberg T-Bill ETF", description: "Cash proxy" },
  { value: "vwo", label: "Vanguard Emerging Markets", description: "Emerging markets" },
  { value: "msci", label: "MSCI World Index", description: "Global developed markets" },
  { value: "agg", label: "Bloomberg Aggregate Bond", description: "Investment grade bonds" }
];

// Account Type Options
export const ACCOUNT_OPTIONS: PlaceholderOption[] = [
  { value: "all", label: "All Accounts", description: "Include all portfolio accounts" },
  { value: "taxable", label: "Taxable Accounts", description: "Only taxable investment accounts" },
  { value: "retirement", label: "Retirement Accounts", description: "401k, IRA, and other retirement accounts" },
  { value: "trust", label: "Trust Accounts", description: "Trust and estate accounts" }
];

// Sector Options with descriptions
export const SECTOR_OPTIONS: PlaceholderOption[] = [
  { value: "TECHNOLOGY", label: "Technology", description: "Software, hardware, semiconductors" },
  { value: "HEALTHCARE", label: "Healthcare", description: "Pharmaceuticals, biotech, devices" },
  { value: "FINANCIALS", label: "Financials", description: "Banks, insurance, real estate" },
  { value: "CONSUMER_CYCLICALS", label: "Consumer Cyclicals", description: "Retail, automotive, entertainment" },
  { value: "CONSUMER_NON_CYC", label: "Consumer Non-Cyclicals", description: "Food, beverages, household products" },
  { value: "INDUSTRIALS", label: "Industrials", description: "Manufacturing, aerospace, defense" },
  { value: "ENERGY", label: "Energy", description: "Oil, gas, renewable energy" },
  { value: "UTILITIES", label: "Utilities", description: "Electric, gas, water utilities" },
  { value: "BASIC_MATERIALS", label: "Basic Materials", description: "Chemicals, metals, mining" },
  { value: "REAL_ESTATE", label: "Real Estate", description: "REITs and real estate companies" },
  { value: "TELECOMM", label: "Telecom", description: "Telecommunications services" }
];

// Comprehensive Placeholder Definitions
export const PLACEHOLDER_DEFINITIONS: Record<string, PlaceholderDefinition> = {
  TIMEFRAME: {
    type: "TIMEFRAME",
    label: "Time period",
    description: "The time period for analysis",
    examples: "YTD, 1M, 1Y, Previous quarter",
    editorType: "OPTIONS",
    isName: false,
    options: TIMEFRAME_OPTIONS,
    defaultOption: { value: "YTD", label: "Year to date" }
  },
  // Alias for backward compatibility
  timeperiod: {
    type: "TIMEFRAME",
    label: "Time Period",
    description: "The time period for analysis",
    examples: "YTD, 1M, 1Y, Previous quarter",
    editorType: "OPTIONS",
    isName: false,
    options: TIMEFRAME_OPTIONS,
    defaultOption: { value: "YTD", label: "Year to date" }
  },
  BENCHMARK_CONTRACT_ID: {
    type: "BENCHMARK_CONTRACT_ID",
    label: "Benchmark index",
    description: "A benchmark index for comparison",
    examples: "S&P 500, NASDAQ, Russell 2000",
    editorType: "OPTIONS",
    isName: false,
    options: BENCHMARK_OPTIONS,
    defaultOption: { value: "spxtr", label: "S&P 500 TR Index" }
  },
  // Alias for simple benchmark placeholder
  benchmark: {
    type: "BENCHMARK",
    label: "Benchmark",
    description: "A benchmark index for comparison",
    examples: "S&P 500, NASDAQ, Russell 2000",
    editorType: "OPTIONS",
    isName: false,
    options: BENCHMARK_OPTIONS,
    defaultOption: { value: "spxtr", label: "S&P 500 TR Index" }
  },
  FINANCIAL_INSTRUMENT: {
    type: "FINANCIAL_INSTRUMENT",
    label: "Financial instrument type",
    description: "The name of a financial instrument",
    examples: "ETF, FUT, CRYPTO, CASH",
    editorType: "OPTIONS",
    isName: false,
    options: [
      { value: "STK", label: "Stocks" },
      { value: "ETF", label: "Exchange Traded Fund" },
      { value: "BOND", label: "Bonds" },
      { value: "OPT", label: "Options" },
      { value: "FUT", label: "Futures" },
      { value: "CRYPTO", label: "Crypto" },
      { value: "CASH", label: "Cash" },
      { value: "FUND", label: "Funds" },
      { value: "CMDTY", label: "Commodities" },
      { value: "CFD", label: "CFDs" }
    ],
    defaultOption: { value: "STK", label: "Stocks" }
  },
  SECTOR: {
    type: "SECTOR",
    label: "Sector",
    description: "The name of a sector",
    examples: "TECHNOLOGY, INDUSTRIALS",
    editorType: "OPTIONS",
    isName: false,
    options: SECTOR_OPTIONS,
    defaultOption: { value: "TECHNOLOGY", label: "Technology" }
  },
  // Alias for simple sector placeholder
  sector: {
    type: "SECTOR",
    label: "Sector",
    description: "The name of a sector",
    examples: "technology, healthcare, financials",
    editorType: "OPTIONS",
    isName: false,
    options: SECTOR_OPTIONS,
    defaultOption: { value: "TECHNOLOGY", label: "Technology" }
  },
  ACCOUNT: {
    type: "ACCOUNT",
    label: "Account Type",
    description: "The account type to analyze",
    examples: "all, taxable, retirement",
    editorType: "OPTIONS",
    isName: false,
    options: ACCOUNT_OPTIONS,
    defaultOption: { value: "all", label: "All Accounts" }
  },
  // Alias for simple account placeholder
  account: {
    type: "ACCOUNT",
    label: "Account Type",
    description: "The account type to analyze",
    examples: "all, taxable, retirement",
    editorType: "OPTIONS",
    isName: false,
    options: ACCOUNT_OPTIONS,
    defaultOption: { value: "all", label: "All Accounts" }
  },
  COUNT: {
    type: "COUNT",
    label: "Number",
    description: "A numeric count or quantity",
    examples: "1, 5, 10",
    editorType: "NUMBER",
    isName: false,
    options: [
      { value: "1", label: "1" },
      { value: "3", label: "3" },
      { value: "5", label: "5" },
      { value: "10", label: "10" },
      { value: "15", label: "15" },
      { value: "20", label: "20" }
    ],
    defaultOption: { value: "5", label: "5" }
  },
  START_DATE: {
    type: "START_DATE",
    label: "Start date",
    description: "A date value indicating the start of a date range",
    examples: "2024-01-30, 2025-03-15",
    editorType: "DATE",
    isName: false,
    options: [],
    defaultOption: { value: "2025-01-01", label: "2025-01-01" }
  },
  END_DATE: {
    type: "END_DATE",
    label: "End date",
    description: "A date value indicating the end of a date range",
    examples: "2024-01-30, 2025-03-15",
    editorType: "DATE",
    isName: false,
    options: [],
    defaultOption: { value: "2025-09-14", label: "2025-09-14" }
  },
  SECURITY_FUNDAMENTAL_DATA_FIELD: {
    type: "SECURITY_FUNDAMENTAL_DATA_FIELD",
    label: "Security fundamental field",
    description: "A fundamental data field for securities",
    examples: "12-Month Total Return, Dividend Yield, P/E Ratio",
    editorType: "OPTIONS",
    isName: false,
    options: [
      { value: "price_return_12month", label: "12-Month Total Return" },
      { value: "dividend_yield", label: "Dividend Yield" },
      { value: "pe_ratio", label: "P/E Ratio" },
      { value: "market_cap", label: "Market Capitalization" },
      { value: "revenue_growth", label: "Revenue Growth" },
      { value: "earnings_growth", label: "Earnings Growth" },
      { value: "debt_to_equity", label: "Debt-to-Equity Ratio" },
      { value: "roe", label: "Return on Equity" }
    ],
    defaultOption: { value: "price_return_12month", label: "12-Month Total Return" }
  }
};

// Enhanced Financial Questions by Category with Timeframes
export const ENHANCED_FINANCIAL_QUESTIONS: Record<string, FinancialQuestion[]> = {
  "Performance Analysis": [
    {
      id: "perf_001",
      sentence: "How does portfolio performance compare to {{BENCHMARK_CONTRACT_ID_1}} over {{TIMEFRAME_1}}?",
      placeholders: [
        { type: "BENCHMARK_CONTRACT_ID", name: "BENCHMARK_CONTRACT_ID_1", value: "70703934", label: "S&P 500 TR Index (SPXTR)" },
        { type: "TIMEFRAME", name: "TIMEFRAME_1", value: "YTD", label: "Year to date" }
      ],
      category: "Performance Analysis"
    },
    {
      id: "perf_002",
      sentence: "Calculate tracking error vs {{BENCHMARK_CONTRACT_ID_1}} for {{TIMEFRAME_1}}",
      placeholders: [
        { type: "BENCHMARK_CONTRACT_ID", name: "BENCHMARK_CONTRACT_ID_1", value: "70703934", label: "S&P 500 TR Index (SPXTR)" },
        { type: "TIMEFRAME", name: "TIMEFRAME_1", value: "1Y", label: "One year" }
      ],
      category: "Performance Analysis"
    },
    {
      id: "perf_003",
      sentence: "Show longest outperformance streak vs {{BENCHMARK_CONTRACT_ID_1}} in {{TIMEFRAME_1}}",
      placeholders: [
        { type: "BENCHMARK_CONTRACT_ID", name: "BENCHMARK_CONTRACT_ID_1", value: "70703934", label: "S&P 500 TR Index (SPXTR)" },
        { type: "TIMEFRAME", name: "TIMEFRAME_1", value: "YTD", label: "Year to date" }
      ],
      category: "Performance Analysis"
    },
    {
      id: "perf_004",
      sentence: "How many days did the portfolio outperform {{BENCHMARK_CONTRACT_ID_1}} in {{TIMEFRAME_1}}?",
      placeholders: [
        { type: "BENCHMARK_CONTRACT_ID", name: "BENCHMARK_CONTRACT_ID_1", value: "70703934", label: "S&P 500 TR Index (SPXTR)" },
        { type: "TIMEFRAME", name: "TIMEFRAME_1", value: "YTD", label: "Year to date" }
      ],
      category: "Performance Analysis"
    },
    {
      id: "perf_005",
      sentence: "What was the portfolio's risk-adjusted return (Sharpe ratio) for {{TIMEFRAME_1}}?",
      placeholders: [
        { type: "TIMEFRAME", name: "TIMEFRAME_1", value: "1Y", label: "One year" }
      ],
      category: "Performance Analysis"
    }
  ],
  "Risk Assessment": [
    {
      id: "risk_001",
      sentence: "Can you provide a drawdown analysis for {{TIMEFRAME_1}}?",
      placeholders: [
        { type: "TIMEFRAME", name: "TIMEFRAME_1", value: "YTD", label: "Year to date" }
      ],
      category: "Risk Assessment"
    },
    {
      id: "risk_002",
      sentence: "What's the portfolio volatility compared to {{BENCHMARK_CONTRACT_ID_1}} over {{TIMEFRAME_1}}?",
      placeholders: [
        { type: "BENCHMARK_CONTRACT_ID", name: "BENCHMARK_CONTRACT_ID_1", value: "70703934", label: "S&P 500 TR Index (SPXTR)" },
        { type: "TIMEFRAME", name: "TIMEFRAME_1", value: "1Y", label: "One year" }
      ],
      category: "Risk Assessment"
    },
    {
      id: "risk_003",
      sentence: "Show Value at Risk (VaR) analysis for {{TIMEFRAME_1}}",
      placeholders: [
        { type: "TIMEFRAME", name: "TIMEFRAME_1", value: "YTD", label: "Year to date" }
      ],
      category: "Risk Assessment"
    },
    {
      id: "risk_004",
      sentence: "Calculate portfolio beta vs {{BENCHMARK_CONTRACT_ID_1}} for {{TIMEFRAME_1}}",
      placeholders: [
        { type: "BENCHMARK_CONTRACT_ID", name: "BENCHMARK_CONTRACT_ID_1", value: "70703934", label: "S&P 500 TR Index (SPXTR)" },
        { type: "TIMEFRAME", name: "TIMEFRAME_1", value: "1Y", label: "One year" }
      ],
      category: "Risk Assessment"
    }
  ],
  "Holdings Analysis": [
    {
      id: "hold_001",
      sentence: "What's the portfolio concentration by {{SECTOR_1}} sector over {{TIMEFRAME_1}}?",
      placeholders: [
        { type: "SECTOR", name: "SECTOR_1", value: "TECHNOLOGY", label: "Technology" },
        { type: "TIMEFRAME", name: "TIMEFRAME_1", value: "YTD", label: "Year to date" }
      ],
      category: "Holdings Analysis"
    },
    {
      id: "hold_002",
      sentence: "Show top {{COUNT_1}} performing securities in {{TIMEFRAME_1}}",
      placeholders: [
        { type: "COUNT", name: "COUNT_1", value: "10", label: "10" },
        { type: "TIMEFRAME", name: "TIMEFRAME_1", value: "YTD", label: "Year to date" }
      ],
      category: "Holdings Analysis"
    },
    {
      id: "hold_003",
      sentence: "List holdings with {{SECURITY_FUNDAMENTAL_DATA_FIELD_1}} above market average in {{TIMEFRAME_1}}",
      placeholders: [
        { type: "SECURITY_FUNDAMENTAL_DATA_FIELD", name: "SECURITY_FUNDAMENTAL_DATA_FIELD_1", value: "dividend_yield", label: "Dividend Yield" },
        { type: "TIMEFRAME", name: "TIMEFRAME_1", value: "YTD", label: "Year to date" }
      ],
      category: "Holdings Analysis"
    },
    {
      id: "hold_004",
      sentence: "How much of the portfolio is in {{FINANCIAL_INSTRUMENT_1}} over {{TIMEFRAME_1}}?",
      placeholders: [
        { type: "FINANCIAL_INSTRUMENT", name: "FINANCIAL_INSTRUMENT_1", value: "ETF", label: "Exchange Traded Fund" },
        { type: "TIMEFRAME", name: "TIMEFRAME_1", value: "YTD", label: "Year to date" }
      ],
      category: "Holdings Analysis"
    }
  ],
  "Allocation Analysis": [
    {
      id: "alloc_001",
      sentence: "Show sector allocation changes from {{TIMEFRAME_1}} to current",
      placeholders: [
        { type: "TIMEFRAME", name: "TIMEFRAME_1", value: "PY", label: "Previous calendar year" }
      ],
      category: "Allocation Analysis"
    },
    {
      id: "alloc_002",
      sentence: "What's the geographic allocation performance for {{TIMEFRAME_1}}?",
      placeholders: [
        { type: "TIMEFRAME", name: "TIMEFRAME_1", value: "YTD", label: "Year to date" }
      ],
      category: "Allocation Analysis"
    },
    {
      id: "alloc_003",
      sentence: "Compare current vs target allocation across sectors for {{TIMEFRAME_1}}",
      placeholders: [
        { type: "TIMEFRAME", name: "TIMEFRAME_1", value: "YTD", label: "Year to date" }
      ],
      category: "Allocation Analysis"
    },
    {
      id: "alloc_004",
      sentence: "Show {{FINANCIAL_INSTRUMENT_1}} allocation efficiency over {{TIMEFRAME_1}}",
      placeholders: [
        { type: "FINANCIAL_INSTRUMENT", name: "FINANCIAL_INSTRUMENT_1", value: "ETF", label: "Exchange Traded Fund" },
        { type: "TIMEFRAME", name: "TIMEFRAME_1", value: "1Y", label: "One year" }
      ],
      category: "Allocation Analysis"
    }
  ],
  "Activity & Trading": [
    {
      id: "activity_001",
      sentence: "Show trading activity summary for {{TIMEFRAME_1}}",
      placeholders: [
        { type: "TIMEFRAME", name: "TIMEFRAME_1", value: "MTD", label: "Month to date" }
      ],
      category: "Activity & Trading"
    },
    {
      id: "activity_002",
      sentence: "List worst {{COUNT_1}} performing trades in {{TIMEFRAME_1}}",
      placeholders: [
        { type: "COUNT", name: "COUNT_1", value: "5", label: "5" },
        { type: "TIMEFRAME", name: "TIMEFRAME_1", value: "YTD", label: "Year to date" }
      ],
      category: "Activity & Trading"
    },
    {
      id: "activity_003",
      sentence: "Show cash flow (deposits and withdrawals) for {{TIMEFRAME_1}}",
      placeholders: [
        { type: "TIMEFRAME", name: "TIMEFRAME_1", value: "YTD", label: "Year to date" }
      ],
      category: "Activity & Trading"
    },
    {
      id: "activity_004",
      sentence: "What were the transaction costs and fees for {{TIMEFRAME_1}}?",
      placeholders: [
        { type: "TIMEFRAME", name: "TIMEFRAME_1", value: "YTD", label: "Year to date" }
      ],
      category: "Activity & Trading"
    }
  ],
  "Income & Dividends": [
    {
      id: "income_001",
      sentence: "Show dividend income analysis for {{TIMEFRAME_1}}",
      placeholders: [
        { type: "TIMEFRAME", name: "TIMEFRAME_1", value: "YTD", label: "Year to date" }
      ],
      category: "Income & Dividends"
    },
    {
      id: "income_002",
      sentence: "List dividend-paying securities with yield above {{COUNT_1}}% in {{TIMEFRAME_1}}",
      placeholders: [
        { type: "COUNT", name: "COUNT_1", value: "3", label: "3" },
        { type: "TIMEFRAME", name: "TIMEFRAME_1", value: "YTD", label: "Year to date" }
      ],
      category: "Income & Dividends"
    },
    {
      id: "income_003",
      sentence: "Compare dividend growth vs inflation for {{TIMEFRAME_1}}",
      placeholders: [
        { type: "TIMEFRAME", name: "TIMEFRAME_1", value: "1Y", label: "One year" }
      ],
      category: "Income & Dividends"
    }
  ]
};

// Helper function to get all questions as flat array
export function getAllQuestions(): FinancialQuestion[] {
  return Object.values(ENHANCED_FINANCIAL_QUESTIONS).flat();
}

// Helper function to get questions by category
export function getQuestionsByCategory(category: string): FinancialQuestion[] {
  return ENHANCED_FINANCIAL_QUESTIONS[category] || [];
}

// Helper function to get all categories
export function getAllCategories(): string[] {
  return Object.keys(ENHANCED_FINANCIAL_QUESTIONS);
}

// Helper function to replace placeholders in question sentence
export function replacePlaceholders(question: FinancialQuestion): string {
  let sentence = question.sentence;
  question.placeholders.forEach(placeholder => {
    sentence = sentence.replace(
      new RegExp(`{{${placeholder.name}}}`, 'g'),
      placeholder.label
    );
  });
  return sentence;
}