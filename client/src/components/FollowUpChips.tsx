import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronRight, TrendingUp, PieChart, BarChart3, Calculator, Target, Activity } from "lucide-react";
import { useState } from "react";

interface FollowUpQuestion {
  text: string;
  category: 'performance' | 'risk' | 'allocation' | 'costs' | 'analysis' | 'comparison';
  priority: 'high' | 'medium' | 'low';
  description?: string;
}

interface FollowUpChipsProps {
  questions?: (string | FollowUpQuestion)[];
  onQuestionClick?: (question: string) => void;
  maxVisible?: number;
}

const getCategoryIcon = (category: FollowUpQuestion['category']) => {
  switch (category) {
    case 'performance': return TrendingUp;
    case 'risk': return Activity;
    case 'allocation': return PieChart;
    case 'costs': return Calculator;
    case 'analysis': return BarChart3;
    case 'comparison': return Target;
    default: return ChevronRight;
  }
};

const getCategoryColor = (category: FollowUpQuestion['category']) => {
  switch (category) {
    case 'performance': return 'bg-green-100 text-green-700 border-green-200';
    case 'risk': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'allocation': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'costs': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'analysis': return 'bg-gray-100 text-gray-700 border-gray-200';
    case 'comparison': return 'bg-teal-100 text-teal-700 border-teal-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export default function FollowUpChips({ 
  questions = [], 
  onQuestionClick,
  maxVisible = 6
}: FollowUpChipsProps) {
  const [showAll, setShowAll] = useState(false);
  
  if (!questions.length) return null;

  // Normalize questions to FollowUpQuestion objects
  const normalizedQuestions: FollowUpQuestion[] = questions.map(q => 
    typeof q === 'string' 
      ? { text: q, category: 'analysis', priority: 'medium' }
      : q
  );

  // Sort by priority and limit visibility
  const sortedQuestions = normalizedQuestions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  const visibleQuestions = showAll ? sortedQuestions : sortedQuestions.slice(0, maxVisible);

  const handleQuestionClick = (question: FollowUpQuestion) => {
    onQuestionClick?.(question.text);
    console.log('Follow-up question clicked:', question.text);
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500" style={{ animationDelay: '800ms' }}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-muted-foreground">Follow-up Questions</h4>
        {normalizedQuestions.length > maxVisible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="text-xs h-6 px-2"
          >
            {showAll ? 'Show Less' : `+${normalizedQuestions.length - maxVisible} More`}
          </Button>
        )}
      </div>
      
      <div className="grid gap-2">
        {visibleQuestions.map((question, index) => {
          const Icon = getCategoryIcon(question.category);
          const isLong = question.text.length > 60;
          
          return (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card
                    className={`p-3 cursor-pointer hover-elevate transition-all duration-200 hover:scale-[1.02] group animate-in fade-in-50 slide-in-from-left-2 border-l-4 ${
                      question.priority === 'high' ? 'border-l-green-500' :
                      question.priority === 'medium' ? 'border-l-blue-500' :
                      'border-l-gray-400'
                    }`}
                    onClick={() => handleQuestionClick(question)}
                    data-testid={`card-followup-${index}`}
                    style={{ animationDelay: `${900 + index * 100}ms` }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <div className={`p-1.5 rounded-full ${getCategoryColor(question.category)} mt-0.5`}>
                          <Icon className="h-3 w-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground group-hover:text-primary transition-colors duration-200 leading-relaxed">
                            {isLong ? truncateText(question.text, 100) : question.text}
                          </p>
                          {question.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {question.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Badge variant="outline" className="text-xs capitalize">
                          {question.category}
                        </Badge>
                        <ChevronRight className="h-3 w-3 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                      </div>
                    </div>
                  </Card>
                </TooltipTrigger>
                {(isLong || question.description) && (
                  <TooltipContent side="top" className="max-w-96">
                    <p className="text-xs">{question.text}</p>
                    {question.description && (
                      <p className="text-xs text-muted-foreground mt-1">{question.description}</p>
                    )}
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
}