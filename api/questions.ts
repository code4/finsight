import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

// Mock schema definitions
const questionRequestSchema = z.object({
  question: z.string(),
  context: z.object({
    accounts: z.array(z.string()).optional(),
    timeframe: z.string().optional(),
    selectionMode: z.string().optional(),
  }).optional(),
  placeholders: z.record(z.string()).optional(),
});

interface QuestionResponse {
  id: string;
  question: string;
  answer: any;
  confidence: "high" | "medium" | "low";
  timestamp: string;
  match: boolean;
}

// Mock answers data
const mockAnswers = [
  {
    id: "1",
    title: "Portfolio Performance Analysis",
    content: "Your portfolio has shown strong performance this year with a 12.4% return YTD, outperforming the S&P 500 by 2.1%.",
    keywords: ["performance", "return", "ytd", "s&p", "outperform"],
    phrases: ["YTD performance", "portfolio return", "vs S&P 500"],
    category: "Performance Analysis"
  },
  {
    id: "2", 
    title: "Risk Assessment",
    content: "Your portfolio shows moderate risk with a beta of 0.85 and volatility of 14.2%.",
    keywords: ["risk", "beta", "volatility", "assessment"],
    phrases: ["risk metrics", "beta volatility"],
    category: "Risk Assessment"
  },
  {
    id: "3",
    title: "Top Holdings",
    content: "Your top 10 holdings represent 45% of your portfolio, with Apple (8.2%) and Microsoft (6.1%) being the largest positions.",
    keywords: ["holdings", "top", "positions", "apple", "microsoft"],
    phrases: ["top holdings", "largest positions"],
    category: "Holdings Analysis"
  }
];

// Question matching service
class QuestionMatchingService {
  async findBestMatch(question: string, placeholders?: Record<string, string>): Promise<{ answer: any; confidence: "high" | "medium" | "low" } | null> {
    const answers = mockAnswers;
    let processedQuestion = question.toLowerCase();
    
    // Replace placeholders with actual values for better matching
    if (placeholders) {
      for (const [key, value] of Object.entries(placeholders)) {
        const placeholderPattern = new RegExp(`\\{${key}\\}`, 'gi');
        processedQuestion = processedQuestion.replace(placeholderPattern, value.toLowerCase());
      }
    }
    
    let bestMatch = null;
    let highestScore = 0;
    
    for (const answer of answers) {
      let score = 0;
      const keywords = answer.keywords || [];
      
      // Check exact phrase matches (higher weight)
      const phrases = answer.phrases || [];
      for (const phrase of phrases) {
        if (processedQuestion.includes(phrase.toLowerCase())) {
          score += phrase.length * 3; // Weight by phrase length
        }
      }
      
      // Check individual keyword matches
      for (const keyword of keywords) {
        if (processedQuestion.includes(keyword.toLowerCase())) {
          score += 1;
        }
      }
      
      // Bonus for matching multiple keywords
      const matchingKeywords = keywords.filter(k => 
        processedQuestion.includes(k.toLowerCase())
      );
      if (matchingKeywords.length > 1) {
        score += matchingKeywords.length; // Bonus for multiple matches
      }
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = answer;
      }
    }
    
    // Determine confidence based on score
    if (highestScore >= 8) {
      return { answer: bestMatch, confidence: "high" };
    } else if (highestScore >= 4) {
      return { answer: bestMatch, confidence: "medium" };
    } else if (highestScore >= 2) {
      return { answer: bestMatch, confidence: "low" };
    }
    
    return null;
  }
}

const questionMatcher = new QuestionMatchingService();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question, placeholders } = questionRequestSchema.parse(req.body);
    
    // Find best match
    const match = await questionMatcher.findBestMatch(question, placeholders);
    
    if (match) {
      const response: QuestionResponse = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        question,
        answer: match.answer,
        confidence: match.confidence,
        timestamp: new Date().toISOString(),
        match: true
      };
      
      return res.status(200).json(response);
    } else {
      // No match found - return unmatched response
      const response: QuestionResponse = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        question,
        answer: {
          content: `We've added your question "${question}" to our development queue. Our team will review it for inclusion in future platform updates.`,
          fallbackType: "portfolio"
        },
        confidence: "low",
        timestamp: new Date().toISOString(),
        match: false
      };
      
      return res.status(200).json(response);
    }
  } catch (error) {
    console.error('Error processing question:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid request format',
        details: error.errors 
      });
    }
    
    return res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
}