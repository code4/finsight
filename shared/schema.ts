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
});

// Request/Response schemas for API
export const questionRequestSchema = z.object({
  question: z.string().min(1, "Question cannot be empty"),
  context: z.object({
    accounts: z.array(z.string()).optional(),
    timeframe: z.string().optional(),
    selectionMode: z.enum(["accounts", "group"]).optional(),
  }).optional(),
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
export type QuestionRequest = z.infer<typeof questionRequestSchema>;
export type QuestionResponse = z.infer<typeof questionResponseSchema>;
