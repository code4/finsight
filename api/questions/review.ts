import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mock questions for review (in-memory for demo)
const mockReviewQuestions: any[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    return res.status(200).json(mockReviewQuestions);
  } catch (error) {
    console.error('Error fetching review questions:', error);
    return res.status(500).json({
      error: 'Failed to fetch questions for review'
    });
  }
}