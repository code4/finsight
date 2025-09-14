import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, RefreshCw, Wifi, Server, Clock, HelpCircle } from "lucide-react";

interface ErrorCardProps {
  question: string;
  asOfDate: string;
  accounts: string[];
  timeframe: string;
  error: string;
  errorType?: 'network' | 'server' | 'timeout' | 'unknown';
  onRetry?: () => void;
  onReportIssue?: () => void;
}

const getErrorIcon = (errorType: string) => {
  switch (errorType) {
    case 'network':
      return Wifi;
    case 'server':
      return Server;
    case 'timeout':
      return Clock;
    default:
      return AlertTriangle;
  }
};

const getErrorMessage = (errorType: string, error: string) => {
  switch (errorType) {
    case 'network':
      return {
        title: "Connection Issue",
        description: "Unable to reach the server. Please check your internet connection and try again.",
        suggestion: "This is usually temporary. Try refreshing the page or checking your network connection."
      };
    case 'server':
      return {
        title: "Server Error",
        description: "Our servers are experiencing some issues. We're working to resolve this quickly.",
        suggestion: "Please try again in a few moments. If the issue persists, our team has been notified."
      };
    case 'timeout':
      return {
        title: "Request Timeout",
        description: "The analysis is taking longer than expected. This might be due to high server load.",
        suggestion: "Try simplifying your question or waiting a moment before retrying."
      };
    default:
      return {
        title: "Analysis Failed",
        description: error || "We encountered an unexpected issue while processing your question.",
        suggestion: "Please try rephrasing your question or contact support if this continues."
      };
  }
};

const getErrorColor = (errorType: string) => {
  switch (errorType) {
    case 'network':
      return 'border-l-orange-500 bg-orange-50/50';
    case 'server':
      return 'border-l-red-500 bg-red-50/50';
    case 'timeout':
      return 'border-l-yellow-500 bg-yellow-50/50';
    default:
      return 'border-l-gray-500 bg-gray-50/50';
  }
};

const ErrorCard = memo(function ErrorCard({
  question,
  asOfDate,
  accounts,
  timeframe,
  error,
  errorType = 'unknown',
  onRetry,
  onReportIssue
}: ErrorCardProps) {
  const Icon = getErrorIcon(errorType);
  const { title, description, suggestion } = getErrorMessage(errorType, error);
  const colorClass = getErrorColor(errorType);

  return (
    <Card className={`mb-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500 border-l-4 ${colorClass} transition-all duration-300`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2 text-foreground" data-testid="text-error-question">
              {question}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {accounts.map((account, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs transition-all duration-200"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {account}
                </Badge>
              ))}
              <Badge variant="secondary" className="text-xs">
                {timeframe}
              </Badge>
              <Badge variant="outline" className="text-xs gap-1">
                <Clock className="h-3 w-3" />
                As of {asOfDate}
              </Badge>
            </div>
          </div>
          <div className="flex gap-1">
            {onRetry && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                onClick={onRetry}
                data-testid="button-retry"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            {onReportIssue && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-secondary transition-all duration-200"
                onClick={onReportIssue}
                data-testid="button-report-issue"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className={`p-3 rounded-full ${
              errorType === 'network' ? 'bg-orange-100 text-orange-600' :
              errorType === 'server' ? 'bg-red-100 text-red-600' :
              errorType === 'timeout' ? 'bg-yellow-100 text-yellow-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
          
          <div className="flex-1 space-y-3">
            <div>
              <h4 className="font-semibold text-foreground mb-1">{title}</h4>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
              <p className="text-sm text-muted-foreground">
                <strong>What you can try:</strong> {suggestion}
              </p>
            </div>
            
            <div className="flex items-center gap-2 pt-2">
              {onRetry && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRetry}
                  className="gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                  data-testid="button-retry-primary"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              )}
              {onReportIssue && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onReportIssue}
                  className="gap-2"
                  data-testid="button-report-primary"
                >
                  <HelpCircle className="h-4 w-4" />
                  Report Issue
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default ErrorCard;