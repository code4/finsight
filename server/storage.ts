import { 
  type User, 
  type InsertUser,
  type Question,
  type InsertQuestion, 
  type Answer,
  type InsertAnswer,
  type Feedback,
  type InsertFeedback
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Question methods
  createQuestion(question: InsertQuestion): Promise<Question>;
  getQuestion(id: string): Promise<Question | undefined>;
  updateQuestionStatus(id: string, status: string, matchedAnswerId?: string): Promise<Question | undefined>;
  getQuestionsForReview(): Promise<Question[]>;
  
  // Answer methods
  createAnswer(answer: InsertAnswer): Promise<Answer>;
  getAnswer(id: string): Promise<Answer | undefined>;
  searchAnswers(query: string): Promise<Answer[]>;
  getAnswersByCategory(category: string): Promise<Answer[]>;
  getAllAnswers(): Promise<Answer[]>;
  
  // Feedback methods
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getFeedback(id: string): Promise<Feedback | undefined>;
  getFeedbackForAnswer(answerId: string): Promise<Feedback[]>;
  getAllFeedback(): Promise<Feedback[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private questions: Map<string, Question>;
  private answers: Map<string, Answer>;
  private feedback: Map<string, Feedback>;

  constructor() {
    this.users = new Map();
    this.questions = new Map();
    this.answers = new Map();
    this.feedback = new Map();
    
    // Initialize with some default answers for demo
    this.initializeDefaultAnswers();
  }

  private async initializeDefaultAnswers() {
    const defaultAnswers = [
      {
        title: "YTD Performance vs S&P 500",
        content: "Your portfolio has delivered exceptional performance year-to-date, achieving a +14.7% return compared to the S&P 500's +11.2% return. This represents a significant 3.5 percentage point outperformance, driven primarily by strategic overweights in technology (+28.3%) and healthcare (+19.6%) sectors. The portfolio's risk-adjusted returns demonstrate superior efficiency with a Sharpe ratio of 1.34 versus the benchmark's 1.12, indicating better return per unit of risk taken.",
        category: "Performance",
        keywords: ["ytd", "performance", "s&p", "sp", "500", "benchmark", "comparison", "return", "outperform"],
        answerType: "performance",
        data: {
          portfolioReturn: 14.7,
          benchmarkReturn: 11.2,
          outperformance: 3.5,
          sharpeRatio: 1.34,
          benchmarkSharpe: 1.12,
          topContributors: ["Technology", "Healthcare", "Financials"],
          chartData: [
            { month: "Jan", portfolio: 2.1, benchmark: 1.8 },
            { month: "Feb", portfolio: 4.3, benchmark: 3.2 },
            { month: "Mar", portfolio: 6.8, benchmark: 5.1 },
            { month: "Apr", portfolio: 8.2, benchmark: 6.7 },
            { month: "May", portfolio: 10.5, benchmark: 8.3 },
            { month: "Jun", portfolio: 12.1, benchmark: 9.8 },
            { month: "Jul", portfolio: 13.6, benchmark: 10.9 },
            { month: "Aug", portfolio: 14.7, benchmark: 11.2 }
          ]
        }
      },
      {
        title: "Top 10 Holdings Analysis",
        content: "Your portfolio's largest positions represent 43.2% of total assets, providing strong concentration in high-conviction investments while maintaining diversification. Microsoft (4.8%) leads as your top holding, followed by Apple (4.2%) and NVIDIA (3.9%). The weighted average P/E ratio of your top 10 holdings is 24.3x, reflecting a quality growth orientation. These positions have contributed +2.8% to overall portfolio performance this year.",
        category: "Holdings", 
        keywords: ["top", "holdings", "weight", "positions", "largest", "biggest", "concentration", "diversification"],
        answerType: "holdings",
        data: {
          topHoldings: [
            { name: "Microsoft Corp", symbol: "MSFT", weight: 4.8, return: 16.2, sector: "Technology" },
            { name: "Apple Inc", symbol: "AAPL", weight: 4.2, return: 12.4, sector: "Technology" },
            { name: "NVIDIA Corp", symbol: "NVDA", weight: 3.9, return: 34.7, sector: "Technology" },
            { name: "Amazon.com Inc", symbol: "AMZN", weight: 3.6, return: 18.9, sector: "Consumer Disc." },
            { name: "Alphabet Inc", symbol: "GOOGL", weight: 3.4, return: 15.3, sector: "Technology" },
            { name: "Tesla Inc", symbol: "TSLA", weight: 3.2, return: 22.1, sector: "Consumer Disc." },
            { name: "Johnson & Johnson", symbol: "JNJ", weight: 3.1, return: 8.7, sector: "Healthcare" },
            { name: "Berkshire Hathaway", symbol: "BRK.B", weight: 2.9, return: 11.3, sector: "Financials" },
            { name: "UnitedHealth Group", symbol: "UNH", weight: 2.8, return: 13.9, sector: "Healthcare" },
            { name: "Procter & Gamble", symbol: "PG", weight: 2.7, return: 9.4, sector: "Consumer Staples" }
          ],
          totalWeight: 43.2,
          avgPE: 24.3,
          contribution: 2.8
        }
      },
      {
        title: "Risk Metrics & Portfolio Beta",
        content: "Your portfolio exhibits a beta of 1.08 relative to the S&P 500, indicating slightly higher systematic risk than the market. The annual volatility stands at 16.4%, compared to the market's 18.1%, suggesting effective risk management through diversification. Maximum drawdown over the past 12 months was -8.2%, occurring during the March correction, with recovery completed within 6 weeks. The portfolio's Value at Risk (95% confidence) is -2.1% over a 1-day period.",
        category: "Risk",
        keywords: ["beta", "volatility", "risk", "metrics", "standard", "deviation", "var", "drawdown"],
        answerType: "risk",
        data: {
          beta: 1.08,
          volatility: 16.4,
          marketVolatility: 18.1,
          maxDrawdown: -8.2,
          var95: -2.1,
          sharpeRatio: 1.34,
          sortinoRatio: 1.89,
          informationRatio: 0.67,
          trackingError: 4.2,
          correlationToMarket: 0.87
        }
      },
      {
        title: "Sector Allocation Strategy", 
        content: "Your portfolio maintains a strategic sector allocation designed to capitalize on secular growth trends while providing defensive characteristics. Technology leads at 28.3% (vs S&P 500: 22.1%), reflecting conviction in digital transformation themes. Healthcare at 15.2% and Financials at 14.8% provide balance, while Consumer Discretionary (12.4%) captures economic reopening themes. The allocation generated +1.9% of excess return through sector selection this year.",
        category: "Allocation",
        keywords: ["sector", "allocation", "breakdown", "diversification", "strategy", "weight"],
        answerType: "allocation",
        data: {
          sectors: [
            { name: "Technology", portfolio: 28.3, benchmark: 22.1, excess: 6.2, return: 18.7 },
            { name: "Healthcare", portfolio: 15.2, benchmark: 13.8, excess: 1.4, return: 11.4 },
            { name: "Financials", portfolio: 14.8, benchmark: 16.2, excess: -1.4, return: 9.8 },
            { name: "Consumer Discretionary", portfolio: 12.4, benchmark: 10.9, excess: 1.5, return: 15.2 },
            { name: "Consumer Staples", portfolio: 8.9, benchmark: 7.1, excess: 1.8, return: 6.3 },
            { name: "Industrials", portfolio: 7.8, benchmark: 8.4, excess: -0.6, return: 12.1 },
            { name: "Energy", portfolio: 4.2, benchmark: 5.8, excess: -1.6, return: 24.6 },
            { name: "Materials", portfolio: 3.1, benchmark: 2.9, excess: 0.2, return: 8.9 },
            { name: "Communication", portfolio: 2.8, benchmark: 8.1, excess: -5.3, return: 14.3 },
            { name: "Utilities", portfolio: 1.9, benchmark: 2.8, excess: -0.9, return: 4.2 },
            { name: "Real Estate", portfolio: 0.6, benchmark: 1.9, excess: -1.3, return: 7.8 }
          ],
          excessReturn: 1.9
        }
      },
      {
        title: "Dividend Income & Yield Analysis",
        content: "Your portfolio generates substantial dividend income with a current yield of 2.8%, exceeding the S&P 500's 1.9% yield. Annual dividend income totals $42,300, representing a 12.4% increase from last year. The portfolio features 67 dividend-paying stocks, with 23 classified as Dividend Aristocrats. Forward dividend growth is projected at 8.2% annually, supported by strong corporate fundamentals and payout ratios averaging 52%.",
        category: "Income",
        keywords: ["dividend", "yield", "income", "distribution", "payout", "aristocrats"],
        answerType: "dividend",
        data: {
          currentYield: 2.8,
          benchmarkYield: 1.9,
          annualIncome: 42300,
          incomeGrowth: 12.4,
          dividendStocks: 67,
          aristocrats: 23,
          forwardGrowth: 8.2,
          avgPayoutRatio: 52,
          topDividendStocks: [
            { name: "Microsoft", yield: 0.9, payment: 1847 },
            { name: "Johnson & Johnson", yield: 2.6, payment: 1623 },
            { name: "Procter & Gamble", yield: 2.4, payment: 1344 },
            { name: "Coca-Cola", yield: 3.1, payment: 987 },
            { name: "Chevron", yield: 3.4, payment: 856 }
          ]
        }
      },
      {
        title: "Trading Activity Summary",
        content: "Portfolio turnover for the past 12 months was 23%, indicating an active but measured approach to position management. Total trading volume reached $2.8M across 147 transactions, with an average holding period of 14.2 months. The most significant trades included adding $180K to NVIDIA (+2.1% position) and reducing Tesla exposure by $95K (-1.3% position). Transaction costs averaged 0.08% of trade value, well below industry benchmarks.",
        category: "Trading",
        keywords: ["trading", "activity", "turnover", "transactions", "buy", "sell", "volume"],
        answerType: "trading",
        data: {
          turnoverRate: 23,
          totalVolume: 2800000,
          transactionCount: 147,
          avgHoldingPeriod: 14.2,
          transactionCost: 0.08,
          majorTrades: [
            { type: "Buy", security: "NVIDIA Corp", amount: 180000, impact: 2.1, date: "2024-08-15" },
            { type: "Sell", security: "Tesla Inc", amount: -95000, impact: -1.3, date: "2024-07-22" },
            { type: "Buy", security: "Microsoft Corp", amount: 125000, impact: 1.8, date: "2024-06-10" },
            { type: "Sell", security: "Meta Platforms", amount: -87000, impact: -1.1, date: "2024-05-18" }
          ]
        }
      },
      {
        title: "ESG Scoring & Sustainable Investing",
        content: "Your portfolio demonstrates strong ESG characteristics with an overall MSCI ESG score of 8.4 (AAA rating), significantly outpacing the S&P 500's score of 6.2. Environmental score of 8.7 reflects substantial clean energy and technology exposure, while Social score of 8.1 and Governance score of 8.3 indicate focus on responsible corporate practices. Carbon intensity is 65% lower than the benchmark at 47.2 tons CO2e per $1M invested.",
        category: "ESG",
        keywords: ["esg", "sustainable", "environmental", "social", "governance", "carbon", "responsible"],
        answerType: "esg",
        data: {
          overallScore: 8.4,
          benchmarkScore: 6.2,
          rating: "AAA",
          environmentalScore: 8.7,
          socialScore: 8.1,
          governanceScore: 8.3,
          carbonIntensity: 47.2,
          benchmarkCarbon: 134.7,
          carbonReduction: 65,
          sustainableRevenue: 34.2
        }
      },
      {
        title: "Expense Ratio Analysis",
        content: "Your portfolio maintains a cost-efficient structure with a weighted average expense ratio of 0.47%, significantly below the industry average of 0.68% for actively managed funds. Index funds comprise 38% of holdings with ultra-low fees averaging 0.08%, while active strategies represent 62% with an average expense ratio of 0.71%. Total annual fees across all holdings amount to approximately $7,100, representing strong value given the portfolio's active management and outperformance.",
        category: "Costs",
        keywords: ["expense", "ratio", "fees", "costs", "management", "fee", "cheap", "expensive"],
        answerType: "costs",
        data: {
          avgExpenseRatio: 0.47,
          industryAverage: 0.68,
          indexFundRatio: 0.08,
          activeFundRatio: 0.71,
          indexAllocation: 38,
          activeAllocation: 62,
          totalAnnualFees: 7100,
          costBreakdown: [
            { type: "Index Funds", allocation: 38, avgFee: 0.08, totalCost: 1200 },
            { type: "Active Equity", allocation: 45, avgFee: 0.68, totalCost: 4600 },
            { type: "Active Fixed Income", allocation: 17, avgFee: 0.81, totalCost: 1300 }
          ]
        }
      },
      {
        title: "Geographic Diversification",
        content: "Your portfolio exhibits strong international diversification with 72% US equity exposure, 18% developed international markets, and 10% emerging markets allocation. European holdings (12%) are led by strong positions in ASML and Nestlé, while Asia-Pacific exposure (14%) includes Taiwan Semiconductor and Samsung. Currency hedging covers 60% of international positions, reducing volatility while maintaining global growth exposure.",
        category: "Geographic",
        keywords: ["geographic", "international", "global", "region", "country", "foreign", "domestic", "us", "europe", "asia"],
        answerType: "geographic",
        data: {
          usExposure: 72,
          developedIntl: 18,
          emergingMarkets: 10,
          europeanHoldings: 12,
          asiaPacific: 14,
          currencyHedged: 60,
          topIntlHoldings: [
            { name: "ASML Holding", country: "Netherlands", weight: 1.8, sector: "Technology" },
            { name: "Taiwan Semiconductor", country: "Taiwan", weight: 1.6, sector: "Technology" },
            { name: "Nestlé SA", country: "Switzerland", weight: 1.4, sector: "Consumer Staples" },
            { name: "Samsung Electronics", country: "South Korea", weight: 1.2, sector: "Technology" },
            { name: "LVMH", country: "France", weight: 1.1, sector: "Consumer Discretionary" }
          ]
        }
      },
      {
        title: "Bond Portfolio Analysis",
        content: "Your fixed income allocation of 25% provides portfolio stability with a duration of 4.2 years and average credit quality of AA-. Government bonds represent 60% of fixed income (15% of total portfolio), with corporate investment grade at 35% and high yield at 5%. The bond portfolio yields 4.3% currently, contributing $6,400 annually to income. Interest rate sensitivity is well-managed with laddered maturities from 2025 to 2034.",
        category: "Fixed Income",
        keywords: ["bond", "fixed", "income", "duration", "yield", "credit", "government", "corporate", "treasury", "municipal"],
        answerType: "fixed_income",
        data: {
          fixedIncomeAllocation: 25,
          duration: 4.2,
          averageCredit: "AA-",
          currentYield: 4.3,
          annualIncome: 6400,
          governmentBonds: 60,
          corporateIG: 35,
          highYield: 5,
          maturityLadder: [
            { year: "2025", allocation: 15, yield: 3.8 },
            { year: "2026", allocation: 18, yield: 4.1 },
            { year: "2027", allocation: 20, yield: 4.3 },
            { year: "2028", allocation: 17, yield: 4.5 },
            { year: "2029-2034", allocation: 30, yield: 4.7 }
          ]
        }
      },
      {
        title: "Alternative Investments Overview",
        content: "Alternative investments comprise 8% of your total portfolio allocation, providing diversification and inflation protection. REITs represent the largest alternative holding at 4.2%, delivering 9.1% returns year-to-date. Commodities exposure (2.3%) includes gold ETFs and energy futures, while private equity allocations (1.5%) are accessed through interval funds. These alternatives have contributed +0.7% to overall portfolio performance.",
        category: "Alternatives",
        keywords: ["alternatives", "reit", "commodities", "private", "equity", "gold", "real", "estate"],
        answerType: "alternatives",
        data: {
          totalAlternatives: 8,
          reitAllocation: 4.2,
          reitReturn: 9.1,
          commoditiesAllocation: 2.3,
          privateEquityAllocation: 1.5,
          performanceContribution: 0.7,
          alternativeBreakdown: [
            { type: "REITs", allocation: 4.2, return: 9.1, income: 3.8 },
            { type: "Commodities", allocation: 2.3, return: 12.4, income: 0 },
            { type: "Private Equity", allocation: 1.5, return: 15.2, income: 0 }
          ]
        }
      },
      {
        title: "Tax Efficiency Analysis",
        content: "Your portfolio demonstrates strong tax efficiency with 67% of holdings in tax-advantaged accounts (401k, IRA). Tax-loss harvesting generated $3,200 in realized losses to offset gains, while municipal bonds provide $1,800 in tax-free income annually. Asset location optimization places growth stocks in IRAs and dividend stocks in taxable accounts. The effective tax rate on portfolio income is 18.3%, well below your marginal rate of 28%.",
        category: "Tax",
        keywords: ["tax", "efficiency", "harvest", "loss", "municipal", "ira", "401k", "taxable", "deferred"],
        answerType: "tax",
        data: {
          taxAdvantaged: 67,
          taxLossHarvesting: 3200,
          municipalIncome: 1800,
          effectiveTaxRate: 18.3,
          marginalTaxRate: 28,
          accountTypes: [
            { type: "401(k)", allocation: 42, strategy: "Growth focus" },
            { type: "Traditional IRA", allocation: 18, strategy: "International equity" },
            { type: "Roth IRA", allocation: 7, strategy: "High-growth positions" },
            { type: "Taxable", allocation: 33, strategy: "Municipal bonds, tax-efficient equity" }
          ]
        }
      },
      {
        title: "Market Volatility Impact",
        content: "During recent market volatility, your portfolio demonstrated strong defensive characteristics with a maximum 30-day rolling volatility of 14.2% versus the S&P 500's 19.8%. The portfolio's low-volatility tilt and quality factor exposure provided downside protection during the March correction. Beta-adjusted performance shows +2.1% excess return after accounting for the portfolio's 1.08 beta, indicating genuine alpha generation beyond market exposure.",
        category: "Risk",
        keywords: ["volatility", "risk", "market", "correction", "drawdown", "beta", "alpha", "defensive"],
        answerType: "risk",
        data: {
          portfolioVolatility: 14.2,
          marketVolatility: 19.8,
          maxDrawdown: -8.2,
          recoveryDays: 42,
          beta: 1.08,
          betaAdjustedReturn: 2.1,
          riskMetrics: [
            { metric: "Volatility", portfolio: 14.2, benchmark: 19.8, advantage: "Lower" },
            { metric: "Max Drawdown", portfolio: -8.2, benchmark: -12.4, advantage: "Better" },
            { metric: "Downside Deviation", portfolio: 9.8, benchmark: 13.7, advantage: "Lower" },
            { metric: "Up Capture", portfolio: 94, benchmark: 100, advantage: "Slightly Lower" },
            { metric: "Down Capture", portfolio: 78, benchmark: 100, advantage: "Much Better" }
          ]
        }
      }
    ];

    for (const answer of defaultAnswers) {
      await this.createAnswer(answer);
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Question methods
  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const id = randomUUID();
    const now = new Date();
    const question: Question = {
      id,
      question: insertQuestion.question,
      context: insertQuestion.context,
      status: "pending",
      matchedAnswerId: null,
      createdAt: now,
      updatedAt: now,
    };
    this.questions.set(id, question);
    return question;
  }

  async getQuestion(id: string): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  async updateQuestionStatus(id: string, status: string, matchedAnswerId?: string): Promise<Question | undefined> {
    const question = this.questions.get(id);
    if (!question) return undefined;

    const updatedQuestion = {
      ...question,
      status,
      matchedAnswerId: matchedAnswerId || question.matchedAnswerId,
      updatedAt: new Date(),
    };
    this.questions.set(id, updatedQuestion);
    return updatedQuestion;
  }

  async getQuestionsForReview(): Promise<Question[]> {
    return Array.from(this.questions.values()).filter(
      (question) => question.status === "review"
    );
  }

  // Answer methods
  async createAnswer(insertAnswer: InsertAnswer): Promise<Answer> {
    const id = randomUUID();
    const now = new Date();
    const answer: Answer = {
      id,
      title: insertAnswer.title,
      content: insertAnswer.content,
      category: insertAnswer.category || null,
      keywords: insertAnswer.keywords || [],
      answerType: insertAnswer.answerType || null,
      data: insertAnswer.data || null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    this.answers.set(id, answer);
    return answer;
  }

  async getAnswer(id: string): Promise<Answer | undefined> {
    return this.answers.get(id);
  }

  async searchAnswers(query: string): Promise<Answer[]> {
    const searchTerms = query.toLowerCase().split(/\s+/);
    const answers = Array.from(this.answers.values()).filter(answer => answer.isActive);
    
    return answers.filter(answer => {
      const searchableText = [
        answer.title,
        answer.content,
        answer.category || "",
        ...(answer.keywords || [])
      ].join(" ").toLowerCase();

      return searchTerms.some(term => searchableText.includes(term));
    });
  }

  async getAnswersByCategory(category: string): Promise<Answer[]> {
    return Array.from(this.answers.values()).filter(
      (answer) => answer.isActive && answer.category === category
    );
  }

  async getAllAnswers(): Promise<Answer[]> {
    return Array.from(this.answers.values()).filter(answer => answer.isActive);
  }

  // Feedback methods
  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const id = randomUUID();
    const now = new Date();
    const feedback: Feedback = {
      id,
      answerId: insertFeedback.answerId || null,
      questionId: insertFeedback.questionId || null,
      question: insertFeedback.question ?? null,
      sentiment: insertFeedback.sentiment,
      reasons: insertFeedback.reasons || [],
      comment: insertFeedback.comment || null,
      createdAt: now,
    };
    this.feedback.set(id, feedback);
    return feedback;
  }

  async getFeedback(id: string): Promise<Feedback | undefined> {
    return this.feedback.get(id);
  }

  async getFeedbackForAnswer(answerId: string): Promise<Feedback[]> {
    return Array.from(this.feedback.values()).filter(
      (feedback) => feedback.answerId === answerId
    );
  }

  async getAllFeedback(): Promise<Feedback[]> {
    return Array.from(this.feedback.values());
  }
}

export const storage = new MemStorage();
