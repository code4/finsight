import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

// Mock schema definition
const feedbackRequestSchema = z.object({
  answerId: z.string().optional(),
  questionId: z.string().optional(), 
  question: z.string().min(1, "Question text is required"),
  sentiment: z.enum(["up", "down"]),
  reasons: z.array(z.enum(["incorrect_data", "outdated", "not_relevant", "unclear", "missing_info", "wrong_timeframe", "wrong_accounts", "other"])).optional(),
  comment: z.string().max(1000).optional(),
});

// Mock feedback storage (in-memory for demo)
const mockFeedbackStore: any[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const feedbackData = feedbackRequestSchema.parse(req.body);
      
      // Generate mock feedback ID and store in memory
      const feedbackId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const feedbackEntry = {
        id: feedbackId,
        ...feedbackData,
        createdAt: new Date().toISOString(),
      };
      
      mockFeedbackStore.push(feedbackEntry);
      
      return res.status(200).json({ 
        success: true,
        feedbackId,
        message: 'Feedback submitted successfully' 
      });
    } catch (error) {
      console.error('Error storing feedback:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Invalid feedback format',
          details: error.errors 
        });
      }
      
      return res.status(500).json({ 
        error: 'Failed to submit feedback' 
      });
    }
  } else if (req.method === 'GET') {
    try {
      return res.status(200).json(mockFeedbackStore);
    } catch (error) {
      console.error('Error retrieving feedback:', error);
      return res.status(500).json({ 
        error: 'Failed to retrieve feedback' 
      });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}