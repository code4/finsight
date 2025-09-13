import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { questionRequestSchema, type QuestionResponse } from "@shared/schema";
import { z } from "zod";

// Question matching service
class QuestionMatchingService {
  // Simple keyword-based matching - could be enhanced with NLP/ML
  async findBestMatch(question: string): Promise<{ answer: any; confidence: "high" | "medium" | "low" } | null> {
    const answers = await storage.getAllAnswers();
    const questionLower = question.toLowerCase();
    
    let bestMatch = null;
    let highestScore = 0;
    
    for (const answer of answers) {
      let score = 0;
      const keywords = answer.keywords || [];
      
      // Check exact phrase matches (higher weight)
      if (answer.title.toLowerCase().includes(questionLower)) {
        score += 100;
      }
      
      // Check keyword matches
      for (const keyword of keywords) {
        if (questionLower.includes(keyword.toLowerCase())) {
          score += 10;
        }
      }
      
      // Check category matches
      if (answer.category && questionLower.includes(answer.category.toLowerCase())) {
        score += 20;
      }
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = answer;
      }
    }
    
    if (!bestMatch || highestScore < 10) {
      return null;
    }
    
    // Determine confidence based on score
    let confidence: "high" | "medium" | "low" = "low";
    if (highestScore >= 50) confidence = "high";
    else if (highestScore >= 25) confidence = "medium";
    
    return { answer: bestMatch, confidence };
  }

  // Classify unmatched questions for better fallback responses
  classifyQuestion(question: string): { type: "personal" | "market" | "financial_advice" | "portfolio"; message: string; actionText?: string } {
    const questionLower = question.toLowerCase();
    
    // Personal/Account Information
    const personalKeywords = ["name", "address", "phone", "email", "advisor", "contact", "who am i", "my information", "account details"];
    if (personalKeywords.some(keyword => questionLower.includes(keyword))) {
      return {
        type: "personal",
        message: "I can help with portfolio analysis, but I don't have access to personal account information. You can find your account details in the main dashboard or contact your advisor directly.",
        actionText: "View Account Details"
      };
    }
    
    // Market Data / External Information
    const marketKeywords = ["stock price", "market news", "interest rates", "fed", "inflation", "earnings", "when will", "what will happen"];
    if (marketKeywords.some(keyword => questionLower.includes(keyword))) {
      return {
        type: "market",
        message: "I specialize in your portfolio analysis. For real-time market data or economic forecasts, I'd recommend checking your trading platform or financial news sources.",
        actionText: "Open Market Data"
      };
    }
    
    // Financial Advice
    const adviceKeywords = ["should i", "what should", "recommend", "advice", "strategy", "buy", "sell", "rebalance", "allocate"];
    if (adviceKeywords.some(keyword => questionLower.includes(keyword))) {
      return {
        type: "financial_advice",
        message: "This is a great question for personalized advice. I've added it to your advisor's review queue for detailed analysis. You should receive a response within 24 hours.",
        actionText: "Track Review Status"
      };
    }
    
    // Default: Portfolio-related but not in our database
    return {
      type: "portfolio",
      message: "I don't have specific data for this portfolio question yet. I've added it to our development queue to enhance my capabilities. Meanwhile, your advisor can provide detailed insights.",
      actionText: "Contact Advisor"
    };
  }
}

const questionMatcher = new QuestionMatchingService();

export async function registerRoutes(app: Express): Promise<Server> {
  // Question processing endpoint
  app.post("/api/questions", async (req, res) => {
    try {
      // Validate request
      const validatedData = questionRequestSchema.parse(req.body);
      
      // Store the question
      const question = await storage.createQuestion({
        question: validatedData.question,
        context: validatedData.context || null,
      });
      
      // Try to find a matching answer
      const match = await questionMatcher.findBestMatch(validatedData.question);
      
      if (match) {
        // Found a match - update question status
        await storage.updateQuestionStatus(question.id, "matched", match.answer.id);
        
        const response: QuestionResponse = {
          id: question.id,
          status: "matched",
          answer: {
            id: match.answer.id,
            title: match.answer.title,
            content: match.answer.content,
            category: match.answer.category,
            answerType: match.answer.answerType,
            data: match.answer.data,
          },
          confidence: match.confidence,
          message: `Found ${match.confidence} confidence match`,
        };
        
        res.json(response);
      } else {
        // No match found - classify question for smart fallback
        const classification = questionMatcher.classifyQuestion(validatedData.question);
        
        // Update status based on classification
        const status = classification.type === "financial_advice" ? "review" : "no_match";
        await storage.updateQuestionStatus(question.id, status);
        
        const response: QuestionResponse = {
          id: question.id,
          status: status as "matched" | "review" | "no_match",
          message: classification.message,
          answer: classification.type !== "financial_advice" ? {
            id: `fallback-${classification.type}`,
            title: classification.type === "personal" ? "Account Information" :
                   classification.type === "market" ? "Market Data" : 
                   "Portfolio Analysis",
            content: classification.message,
            category: "Fallback",
            answerType: classification.type,
            data: {
              fallbackType: classification.type,
              actionText: classification.actionText,
              isUnmatched: true
            }
          } : undefined
        };
        
        res.json(response);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid request format", 
          errors: error.errors 
        });
      } else {
        console.error("Error processing question:", error);
        res.status(500).json({ 
          message: "Internal server error while processing question" 
        });
      }
    }
  });
  
  // Get questions for review (admin endpoint)
  app.get("/api/questions/review", async (req, res) => {
    try {
      const questions = await storage.getQuestionsForReview();
      res.json(questions);
    } catch (error) {
      console.error("Error fetching review questions:", error);
      res.status(500).json({ message: "Failed to fetch questions for review" });
    }
  });
  
  // Get all answers (for admin/debugging)
  app.get("/api/answers", async (req, res) => {
    try {
      const answers = await storage.getAllAnswers();
      res.json(answers);
    } catch (error) {
      console.error("Error fetching answers:", error);
      res.status(500).json({ message: "Failed to fetch answers" });
    }
  });
  
  // Create new answer (admin endpoint)
  app.post("/api/answers", async (req, res) => {
    try {
      const answer = await storage.createAnswer(req.body);
      res.json(answer);
    } catch (error) {
      console.error("Error creating answer:", error);
      res.status(500).json({ message: "Failed to create answer" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
