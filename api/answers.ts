import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

// Mock answers data
const mockAnswers = [
  {
    id: "1",
    title: "Portfolio Performance Analysis",
    content: "Your portfolio has shown strong performance this year with a 12.4% return YTD, outperforming the S&P 500 by 2.1%.",
    keywords: ["performance", "return", "ytd", "s&p", "outperform"],
    phrases: ["YTD performance", "portfolio return", "vs S&P 500"],
    category: "Performance Analysis",
    answerType: "portfolio",
    data: {
      chart: {
        type: "line",
        data: [
          { period: "Jan", value: 2.1 },
          { period: "Feb", value: 3.8 },
          { period: "Mar", value: 5.2 },
          { period: "Apr", value: 7.1 },
          { period: "May", value: 8.9 },
          { period: "Jun", value: 10.3 },
          { period: "Jul", value: 11.8 },
          { period: "Aug", value: 12.4 }
        ]
      }
    }
  },
  {
    id: "2",
    title: "Risk Assessment",
    content: "Your portfolio shows moderate risk with a beta of 0.85 and volatility of 14.2%.",
    keywords: ["risk", "beta", "volatility", "assessment"],
    phrases: ["risk metrics", "beta volatility"],
    category: "Risk Assessment",
    answerType: "risk",
    data: {
      metrics: {
        beta: 0.85,
        volatility: 14.2,
        sharpeRatio: 1.23
      }
    }
  },
  {
    id: "3",
    title: "Top Holdings",
    content: "Your top 10 holdings represent 45% of your portfolio, with Apple (8.2%) and Microsoft (6.1%) being the largest positions.",
    keywords: ["holdings", "top", "positions", "apple", "microsoft"],
    phrases: ["top holdings", "largest positions"],
    category: "Holdings Analysis",
    answerType: "holdings",
    data: {
      holdings: [
        { symbol: "AAPL", name: "Apple Inc.", percentage: 8.2 },
        { symbol: "MSFT", name: "Microsoft Corp.", percentage: 6.1 },
        { symbol: "GOOGL", name: "Alphabet Inc.", percentage: 4.8 }
      ]
    }
  }
];

// Answer creation schema
const answerSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.string().optional(),
  answerType: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  phrases: z.array(z.string()).optional(),
  data: z.any().optional()
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      return res.status(200).json(mockAnswers);
    } catch (error) {
      console.error('Error fetching answers:', error);
      return res.status(500).json({
        error: 'Failed to fetch answers'
      });
    }
  }

  else if (req.method === 'POST') {
    try {
      const answerData = answerSchema.parse(req.body);

      // Create new answer with generated ID
      const newAnswer = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...answerData,
        createdAt: new Date().toISOString()
      };

      // Add to mock storage
      mockAnswers.push(newAnswer);

      return res.status(201).json(newAnswer);
    } catch (error) {
      console.error('Error creating answer:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Invalid answer format',
          details: error.errors
        });
      }

      return res.status(500).json({
        error: 'Failed to create answer'
      });
    }
  }

  else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}