// Mock API server for Vercel deployment
import { parse } from 'url';

// Mock data
const mockAnswers = [
  {
    id: "1",
    title: "Portfolio Performance Analysis",
    content: "Your portfolio has shown strong performance this year with a 12.4% return YTD, outperforming the S&P 500 by 2.1%.",
    keywords: ["performance", "return", "ytd", "s&p", "outperform"],
    phrases: ["YTD performance", "portfolio return", "vs S&P 500"],
    category: "Performance Analysis",
    answerType: "performance",
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
      },
      ytdReturn: 12.4,
      benchmarkReturn: 10.3,
      excess: 2.1,
      volatility: 14.2
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
        sharpeRatio: 1.23,
        maxDrawdown: -8.5,
        var95: -3.2,
        tracking: 2.1
      },
      riskProfile: "Moderate",
      grade: "B+",
      benchmarkBeta: 1.0,
      benchmarkVol: 16.8
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
      topHoldings: [
        { symbol: "AAPL", name: "Apple Inc.", percentage: 8.2, return: 14.5, ytdReturn: 12.3 },
        { symbol: "MSFT", name: "Microsoft Corp.", percentage: 6.1, return: 18.2, ytdReturn: 15.7 },
        { symbol: "GOOGL", name: "Alphabet Inc.", percentage: 4.8, return: 22.1, ytdReturn: 18.9 },
        { symbol: "AMZN", name: "Amazon.com Inc.", percentage: 4.2, return: 16.7, ytdReturn: 13.4 },
        { symbol: "TSLA", name: "Tesla Inc.", percentage: 3.9, return: 28.3, ytdReturn: 24.1 },
        { symbol: "NVDA", name: "NVIDIA Corp.", percentage: 3.7, return: 45.6, ytdReturn: 38.2 },
        { symbol: "META", name: "Meta Platforms Inc.", percentage: 3.2, return: 19.8, ytdReturn: 16.5 },
        { symbol: "BRK.B", name: "Berkshire Hathaway Inc.", percentage: 2.8, return: 8.4, ytdReturn: 7.1 },
        { symbol: "JNJ", name: "Johnson & Johnson", percentage: 2.5, return: 5.2, ytdReturn: 4.8 },
        { symbol: "V", name: "Visa Inc.", percentage: 2.3, return: 12.7, ytdReturn: 10.9 }
      ],
      totalWeight: 42.5,
      avgPE: 24.8,
      avgReturn: 19.2,
      ytdReturn: 16.4,
      contribution: 3.2
    }
  },
  {
    id: "4",
    title: "Sector Allocation Analysis",
    content: "Your portfolio shows strong diversification across sectors with Technology (28%) and Healthcare (18%) as top allocations.",
    keywords: ["allocation", "sector", "diversification", "technology", "healthcare"],
    phrases: ["sector allocation", "asset allocation"],
    category: "Allocation Analysis",
    answerType: "allocation",
    data: {
      sectors: [
        { name: "Technology", portfolio: 28.5, benchmark: 25.2, excess: 3.3, return: 18.7 },
        { name: "Healthcare", portfolio: 18.2, benchmark: 16.8, excess: 1.4, return: 12.4 },
        { name: "Financials", portfolio: 15.1, benchmark: 18.3, excess: -3.2, return: 8.9 },
        { name: "Consumer Discretionary", portfolio: 12.4, benchmark: 11.7, excess: 0.7, return: 15.2 },
        { name: "Communication Services", portfolio: 8.8, benchmark: 9.1, excess: -0.3, return: 14.6 },
        { name: "Industrials", portfolio: 7.9, benchmark: 8.2, excess: -0.3, return: 11.3 }
      ],
      excessReturn: 2.1
    }
  },
  {
    id: "5",
    title: "Dividend Income Analysis",
    content: "Your portfolio generates a 2.8% dividend yield with consistent quarterly payments totaling $14,250 annually.",
    keywords: ["dividend", "yield", "income", "quarterly", "payments"],
    phrases: ["dividend yield", "dividend income"],
    category: "Income Analysis",
    answerType: "dividend",
    data: {
      currentYield: 2.8,
      annualIncome: 14250,
      quarterlyIncome: 3562.5,
      yieldGrowth: 6.2,
      payoutRatio: 45.3,
      dividendGrowthRate: 8.1,
      topDividendStocks: [
        { symbol: "JNJ", yield: 2.9, income: 1247 },
        { symbol: "PG", yield: 2.6, income: 1089 },
        { symbol: "KO", yield: 3.1, income: 892 }
      ]
    }
  }
];

const mockQuestions = [];
const mockFeedback = [];

// Question matching service
class QuestionMatchingService {
  async findBestMatch(question, placeholders) {
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
          score += phrase.length * 3;
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
        score += matchingKeywords.length;
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

// Helper function to parse request body
async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

// Main handler function
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { pathname } = parse(req.url, true);
  const path = pathname.replace('/api', '');

  try {
    // Questions endpoint
    if (path === '/questions' && req.method === 'POST') {
      const body = await parseBody(req);
      const { question, placeholders } = body;

      if (!question) {
        return res.status(400).json({ error: 'Question is required' });
      }

      // Store question
      const questionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      mockQuestions.push({
        id: questionId,
        question,
        timestamp: new Date().toISOString()
      });

      // Find match
      const match = await questionMatcher.findBestMatch(question, placeholders);

      if (match) {
        const response = {
          id: questionId,
          status: "matched",
          answer: {
            id: match.answer.id,
            title: match.answer.title,
            content: match.answer.content,
            category: match.answer.category,
            answerType: match.answer.answerType,
            data: match.answer.data
          },
          confidence: match.confidence,
          message: `Found ${match.confidence} confidence match`
        };
        return res.status(200).json(response);
      } else {
        const response = {
          id: questionId,
          status: "no_match",
          answer: {
            id: `fallback-${questionId}`,
            title: "Question Added to Queue",
            content: `We've added your question "${question}" to our development queue. Our team will review it for inclusion in future platform updates.`,
            category: "Fallback",
            answerType: "portfolio",
            data: {
              fallbackType: "portfolio",
              isUnmatched: true
            }
          },
          confidence: "low",
          message: "No match found, added to review queue"
        };
        return res.status(200).json(response);
      }
    }

    // Questions review endpoint
    else if (path === '/questions/review' && req.method === 'GET') {
      return res.status(200).json(mockQuestions);
    }

    // Answers endpoint
    else if (path === '/answers') {
      if (req.method === 'GET') {
        return res.status(200).json(mockAnswers);
      } else if (req.method === 'POST') {
        const body = await parseBody(req);
        const newAnswer = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ...body,
          createdAt: new Date().toISOString()
        };
        mockAnswers.push(newAnswer);
        return res.status(201).json(newAnswer);
      }
    }

    // Feedback endpoint
    else if (path === '/feedback' && req.method === 'POST') {
      const body = await parseBody(req);
      const feedbackId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const feedbackEntry = {
        id: feedbackId,
        ...body,
        createdAt: new Date().toISOString()
      };
      mockFeedback.push(feedbackEntry);
      return res.status(200).json({
        success: true,
        feedbackId,
        message: 'Feedback submitted successfully'
      });
    }

    // Default 404
    else {
      return res.status(404).json({ error: 'Endpoint not found' });
    }

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}