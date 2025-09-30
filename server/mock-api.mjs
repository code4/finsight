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