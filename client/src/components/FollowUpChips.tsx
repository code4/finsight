import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface FollowUpChipsProps {
  questions?: string[];
  onQuestionClick?: (question: string) => void;
}

export default function FollowUpChips({ 
  questions = [], 
  onQuestionClick 
}: FollowUpChipsProps) {
  if (!questions.length) return null;

  const handleQuestionClick = (question: string) => {
    onQuestionClick?.(question);
    console.log('Follow-up question clicked:', question);
  };

  return (
    <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500" style={{ animationDelay: '800ms' }}>
      <h4 className="text-sm font-medium mb-3 text-muted-foreground">Follow-up Questions</h4>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1 hover-elevate transition-all duration-200 hover:scale-105 group animate-in fade-in-50 slide-in-from-left-2"
            onClick={() => handleQuestionClick(question)}
            data-testid={`button-followup-${index}`}
            style={{ animationDelay: `${900 + index * 100}ms` }}
          >
            <span className="group-hover:text-primary transition-colors duration-200">{question}</span>
            <ChevronRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
          </Button>
        ))}
      </div>
    </div>
  );
}