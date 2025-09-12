import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

interface Account {
  id: string;
  accountNumber: string;
  name: string;
  alias?: string;
  type: string;
  balance: number;
  color: string;
}

interface PortfolioSummary {
  totalAUM: number;
  ytdReturn: number;
  sharpeRatio: number;
  totalAccounts: number;
}

// Mock function to simulate portfolio performance calculations
// In a real app, this would fetch data from your API or perform complex calculations
const calculatePortfolioMetrics = (accounts: Account[]): PortfolioSummary => {
  if (accounts.length === 0) {
    return {
      totalAUM: 0,
      ytdReturn: 0,
      sharpeRatio: 0,
      totalAccounts: 0
    };
  }

  // Calculate total AUM (Assets Under Management)
  const totalAUM = accounts.reduce((sum, account) => sum + account.balance, 0);

  // Mock YTD return calculation based on account balances and types
  // In reality, this would be based on historical performance data
  const ytdReturn = accounts.reduce((weightedReturn, account) => {
    const weight = account.balance / totalAUM;
    // Different mock returns based on account type
    let accountReturn = 0;
    switch (account.type) {
      case 'Trust':
        accountReturn = 0.125; // 12.5%
      case 'IRA':
        accountReturn = 0.108; // 10.8%
        break;
      case 'Individual':
        accountReturn = 0.142; // 14.2%
        break;
      case 'Joint':
        accountReturn = 0.096; // 9.6%
        break;
      case 'LLC':
        accountReturn = 0.156; // 15.6%
        break;
      case 'REIT':
        accountReturn = 0.087; // 8.7%
        break;
      case '529 Plan':
        accountReturn = 0.113; // 11.3%
        break;
      default:
        accountReturn = 0.105; // 10.5%
    }
    return weightedReturn + (weight * accountReturn);
  }, 0);

  // Mock Sharpe ratio calculation (simplified)
  // In reality, this would be (portfolio return - risk-free rate) / portfolio standard deviation
  const avgReturn = ytdReturn;
  const riskFreeRate = 0.045; // 4.5% risk-free rate
  const mockVolatility = 0.12 + (accounts.length * 0.01); // Mock volatility based on diversification
  const sharpeRatio = (avgReturn - riskFreeRate) / mockVolatility;

  return {
    totalAUM,
    ytdReturn,
    sharpeRatio,
    totalAccounts: accounts.length
  };
};

export const usePortfolioSummary = (selectedAccounts: Account[], timeframe: string = 'ytd') => {
  // Create a stable key for the query based on selected accounts and timeframe
  const accountIds = useMemo(
    () => selectedAccounts.map(acc => acc.id).sort().join(','), 
    [selectedAccounts]
  );

  // Use React Query to manage the portfolio calculation
  // This makes it reactive to account selection changes and provides caching
  return useQuery({
    queryKey: ['portfolioSummary', accountIds, timeframe],
    queryFn: () => calculatePortfolioMetrics(selectedAccounts),
    enabled: selectedAccounts.length > 0,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false,
  });
};