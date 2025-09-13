import { type QuestionRequest, type QuestionResponse } from "@shared/schema";

class ApiService {
  private baseUrl = "/api";

  async submitQuestion(request: QuestionRequest): Promise<QuestionResponse> {
    const response = await fetch(`${this.baseUrl}/questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getReviewQuestions() {
    const response = await fetch(`${this.baseUrl}/questions/review`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getAllAnswers() {
    const response = await fetch(`${this.baseUrl}/answers`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async createAnswer(answer: any) {
    const response = await fetch(`${this.baseUrl}/answers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(answer),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const apiService = new ApiService();