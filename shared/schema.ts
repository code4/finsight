import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Questions asked by FAs
export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  question: text("question").notNull(),
  context: jsonb("context"), // Account selection, timeframe, etc.
  status: text("status").notNull().default("pending"), // pending, matched, review, answered
  matchedAnswerId: varchar("matched_answer_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Pre-defined answers and user-generated answers
export const answers = pgTable("answers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category"), 
  keywords: text("keywords").array(), // For matching
  answerType: text("answer_type"), // Type for UI presentation
  data: jsonb("data"), // Rich data for visualizations
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Question-Answer matches
export const questionMatches = pgTable("question_matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  questionId: varchar("question_id").notNull(),
  answerId: varchar("answer_id").notNull(),
  confidence: text("confidence").notNull(), // high, medium, low
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Feedback on answers from FAs
export const feedback = pgTable("feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  answerId: varchar("answer_id"), // Optional - could be feedback on a question without match
  questionId: varchar("question_id"), // Optional - for context
  question: text("question"), // Store the original question text for context
  sentiment: text("sentiment").notNull(), // 'up' or 'down'
  reasons: text("reasons").array(), // Array of reason codes
  comment: text("comment"), // Optional detailed feedback
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertQuestionSchema = createInsertSchema(questions).pick({
  question: true,
  context: true,
});

export const insertAnswerSchema = createInsertSchema(answers).pick({
  title: true,
  content: true,
  category: true,
  keywords: true,
  answerType: true,
  data: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).pick({
  answerId: true,
  questionId: true,
  question: true,
  sentiment: true,
  reasons: true,
  comment: true,
});

// Request/Response schemas for API
export const questionRequestSchema = z.object({
  question: z.string().min(1, "Question cannot be empty"),
  context: z.object({
    accounts: z.array(z.string()).optional(),
    timeframe: z.string().optional(),
    selectionMode: z.enum(["accounts", "group"]).optional(),
  }).optional(),
  placeholders: z.record(z.string()).optional(), // For placeholder replacements
});

export const feedbackRequestSchema = z.object({
  answerId: z.string().optional(),
  questionId: z.string().optional(), 
  question: z.string().min(1, "Question text is required"),
  sentiment: z.enum(["up", "down"]),
  reasons: z.array(z.enum(["incorrect_data", "outdated", "not_relevant", "unclear", "missing_info", "wrong_timeframe", "wrong_accounts", "other"])).optional(),
  comment: z.string().max(1000).optional(),
});

export const questionResponseSchema = z.object({
  id: z.string(),
  status: z.enum(["matched", "review", "no_match"]),
  answer: z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    category: z.string().optional(),
    answerType: z.string().optional(),
    data: z.any().optional(),
  }).optional(),
  confidence: z.enum(["high", "medium", "low"]).optional(),
  message: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Answer = typeof answers.$inferSelect;
export type InsertAnswer = z.infer<typeof insertAnswerSchema>;
export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type QuestionRequest = z.infer<typeof questionRequestSchema>;
export type QuestionResponse = z.infer<typeof questionResponseSchema>;
export type FeedbackRequest = z.infer<typeof feedbackRequestSchema>;

// Import enhanced data from single source of truth
export { TIMEFRAME_OPTIONS } from "./enhanced-financial-data";

// Enhanced Financial Questions by Category
export const FINANCIAL_QUESTIONS = [
  // Performance Analysis
  {
    id: "perf-001",
    category: "Performance Analysis",
    question: "How does performance compare to S&P 500 over year to date?",
    timeframe: "YTD",
    accounts: ["Growth Portfolio", "Conservative Fund"],
    answerType: "performance" as const
  },
  {
    id: "perf-002", 
    category: "Performance Analysis",
    question: "What's the risk-adjusted return this year?",
    timeframe: "YTD",
    accounts: ["Growth Portfolio"],
    answerType: "performance" as const
  },
  {
    id: "perf-003",
    category: "Performance Analysis", 
    question: "Calculate tracking error vs S&P 500 for one year",
    timeframe: "1Y",
    accounts: ["Growth Portfolio"],
    answerType: "performance" as const
  },
  {
    id: "perf-004",
    category: "Performance Analysis",
    question: "Show longest outperformance streak vs S&P 500 in previous quarter", 
    timeframe: "PQ",
    accounts: ["Growth Portfolio"],
    answerType: "performance" as const
  },
  {
    id: "perf-005",
    category: "Performance Analysis",
    question: "How many days did portfolio outperform benchmark in month to date?",
    timeframe: "MTD", 
    accounts: ["Growth Portfolio"],
    answerType: "performance" as const
  },
  {
    id: "perf-006",
    category: "Performance Analysis",
    question: "Portfolio's Sharpe ratio vs benchmark for previous calendar year",
    timeframe: "PY",
    accounts: ["Growth Portfolio", "Conservative Fund"],
    answerType: "performance" as const
  },
  // Risk Assessment
  {
    id: "risk-001",
    category: "Risk Assessment",
    question: "Can you provide a drawdown analysis for year to date?",
    timeframe: "YTD",
    accounts: ["Growth Portfolio"],
    answerType: "risk" as const
  },
  {
    id: "risk-002",
    category: "Risk Assessment",
    question: "What's the portfolio volatility vs S&P 500 for one year?",
    timeframe: "1Y",
    accounts: ["Growth Portfolio"],
    answerType: "risk" as const
  },
  {
    id: "risk-003",
    category: "Risk Assessment",
    question: "Show Value at Risk analysis for previous month",
    timeframe: "PM",
    accounts: ["Growth Portfolio"],
    answerType: "risk" as const
  },
  {
    id: "risk-004",
    category: "Risk Assessment",
    question: "Calculate portfolio beta for previous quarter",
    timeframe: "PQ",
    accounts: ["Growth Portfolio"],
    answerType: "risk" as const
  },
  // Holdings Analysis
  {
    id: "hold-001",
    category: "Holdings Analysis",
    question: "What's the portfolio concentration by Technology sector for year to date?",
    timeframe: "YTD",
    accounts: ["Growth Portfolio"],
    answerType: "holdings" as const
  },
  {
    id: "hold-002",
    category: "Holdings Analysis",
    question: "Show top 10 performing securities in year to date",
    timeframe: "YTD",
    accounts: ["Growth Portfolio"],
    answerType: "holdings" as const
  },
  {
    id: "hold-003",
    category: "Holdings Analysis",
    question: "List holdings with dividend yield above market average for one year",
    timeframe: "1Y",
    accounts: ["Growth Portfolio"],
    answerType: "holdings" as const
  },
  {
    id: "hold-004",
    category: "Holdings Analysis",
    question: "How much of portfolio is in ETFs over previous quarter?",
    timeframe: "PQ",
    accounts: ["Growth Portfolio"],
    answerType: "holdings" as const
  },
  // Allocation Analysis
  {
    id: "alloc-001",
    category: "Allocation Analysis",
    question: "Show sector allocation changes from previous calendar year to current",
    timeframe: "PY",
    accounts: ["Growth Portfolio"],
    answerType: "allocation" as const
  },
  {
    id: "alloc-002",
    category: "Allocation Analysis", 
    question: "What's the geographic allocation performance for year to date?",
    timeframe: "YTD",
    accounts: ["Growth Portfolio"],
    answerType: "allocation" as const
  },
  {
    id: "alloc-003",
    category: "Allocation Analysis",
    question: "Compare current vs target allocation across sectors for year to date",
    timeframe: "YTD",
    accounts: ["Growth Portfolio"],
    answerType: "allocation" as const
  },
  {
    id: "alloc-004",
    category: "Allocation Analysis",
    question: "Show ETF allocation efficiency over one year",
    timeframe: "1Y",
    accounts: ["Growth Portfolio"],
    answerType: "allocation" as const
  },
  // Activity & Trading
  {
    id: "activity-001",
    category: "Activity & Trading",
    question: "Show trading activity summary for month to date",
    timeframe: "MTD",
    accounts: ["Growth Portfolio"],
    answerType: "activity" as const
  },
  {
    id: "activity-002",
    category: "Activity & Trading",
    question: "List worst 5 performing trades in year to date",
    timeframe: "YTD",
    accounts: ["Growth Portfolio"],
    answerType: "activity" as const
  },
  {
    id: "activity-003",
    category: "Activity & Trading",
    question: "Show cash flow deposits and withdrawals for previous quarter",
    timeframe: "PQ",
    accounts: ["Growth Portfolio", "Conservative Fund"],
    answerType: "activity" as const
  },
  {
    id: "activity-004",
    category: "Activity & Trading",
    question: "What were transaction costs and fees for year to date?",
    timeframe: "YTD",
    accounts: ["Growth Portfolio"],
    answerType: "activity" as const
  },
  // Income & Dividends
  {
    id: "income-001",
    category: "Income & Dividends",
    question: "Show dividend income analysis for year to date",
    timeframe: "YTD",
    accounts: ["Growth Portfolio"],
    answerType: "income" as const
  },
  {
    id: "income-002",
    category: "Income & Dividends",
    question: "List dividend-paying securities with yield above 3% for one year",
    timeframe: "1Y",
    accounts: ["Growth Portfolio"],
    answerType: "income" as const
  },
  {
    id: "income-003",
    category: "Income & Dividends",
    question: "Compare dividend growth vs inflation for previous calendar year",
    timeframe: "PY",
    accounts: ["Growth Portfolio"],
    answerType: "income" as const
  },
  // Comparison Analysis  
  {
    id: "comp-001",
    category: "Comparison",
    question: "Compare performance across multiple accounts for year to date",
    timeframe: "YTD",
    accounts: ["Growth Portfolio", "Conservative Fund", "Balanced Portfolio"],
    answerType: "comparison" as const
  },
  {
    id: "comp-002",
    category: "Comparison",
    question: "Compare risk metrics across selected accounts for one year",
    timeframe: "1Y",
    accounts: ["Growth Portfolio", "Conservative Fund"],
    answerType: "comparison" as const
  },
  {
    id: "comp-003",
    category: "Comparison",
    question: "Show security overlap across accounts for year to date",
    timeframe: "YTD",
    accounts: ["Growth Portfolio", "Conservative Fund"],
    answerType: "comparison" as const
  }
] as const;

// Question categories for organization
export const QUESTION_CATEGORIES = [
  "Performance Analysis",
  "Risk Assessment", 
  "Holdings Analysis",
  "Allocation Analysis",
  "Activity & Trading",
  "Income & Dividends",
  "Comparison"
] as const;

// Placeholder types for dynamic questions
export const PLACEHOLDER_TYPES = {
  TIMEFRAME: "TIMEFRAME",
  BENCHMARK: "BENCHMARK_CONTRACT_ID",
  COUNT: "COUNT",
  SECTOR: "SECTOR",
  FINANCIAL_INSTRUMENT: "FINANCIAL_INSTRUMENT",
  START_DATE: "START_DATE", 
  END_DATE: "END_DATE"
} as const;

// Helper functions
export function getQuestionsByCategory(category: string) {
  return FINANCIAL_QUESTIONS.filter(q => q.category === category);
}

export function getQuestionsByTimeframe(timeframe: string) {
  return FINANCIAL_QUESTIONS.filter(q => q.timeframe === timeframe);
}

export function getAllCategories() {
  return QUESTION_CATEGORIES;
}
