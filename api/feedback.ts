import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';
import { feedbackRequestSchema } from '../shared/schema';
import { z } from 'zod';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const feedbackData = feedbackRequestSchema.parse(req.body);
      
      // Store feedback
      const feedbackId = await storage.storeFeedback(feedbackData);
      
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
      const feedback = await storage.getAllFeedback();
      return res.status(200).json(feedback);
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