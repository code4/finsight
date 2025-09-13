// Content generator that creates varied UI presentations based on answer data
export interface GeneratedContent {
  paragraph?: string;
  kpis?: Array<{
    label: string;
    value: string;
    change: string;
    isPositive: boolean;
  }>;
  chartData?: any[];
  tableData?: any[];
  highlights?: string[];
  metrics?: Array<{
    label: string;
    value: string;
    subtext?: string;
  }>;
}

export class ContentGenerator {
  static generateContent(answer: any): GeneratedContent {
    if (!answer.data) {
      return {
        paragraph: answer.content
      };
    }

    const { answerType, data } = answer;

    switch (answerType) {
      case 'performance':
        return this.generatePerformanceContent(data);
      
      case 'holdings':
        return this.generateHoldingsContent(data);
      
      case 'risk':
        return this.generateRiskContent(data);
      
      case 'allocation':
        return this.generateAllocationContent(data);
      
      case 'dividend':
        return this.generateDividendContent(data);
      
      case 'trading':
        return this.generateTradingContent(data);
      
      case 'esg':
        return this.generateESGContent(data);
      
      default:
        return {
          paragraph: answer.content
        };
    }
  }

  private static generatePerformanceContent(data: any): GeneratedContent {
    return {
      kpis: [
        {
          label: "YTD Return",
          value: `+${data.portfolioReturn}%`,
          change: `+${data.outperformance}% vs S&P`,
          isPositive: data.outperformance > 0
        },
        {
          label: "Sharpe Ratio",
          value: data.sharpeRatio.toString(),
          change: `vs ${data.benchmarkSharpe} benchmark`,
          isPositive: data.sharpeRatio > data.benchmarkSharpe
        },
        {
          label: "S&P 500 Return",
          value: `+${data.benchmarkReturn}%`,
          change: "Benchmark performance",
          isPositive: data.benchmarkReturn > 0
        },
        {
          label: "Outperformance",
          value: `+${data.outperformance}%`,
          change: "Above benchmark",
          isPositive: true
        }
      ],
      chartData: data.chartData,
      highlights: [
        `Portfolio outperformed S&P 500 by ${data.outperformance} percentage points`,
        `Top contributing sectors: ${data.topContributors.join(', ')}`,
        `Risk-adjusted returns superior with Sharpe ratio of ${data.sharpeRatio}`
      ]
    };
  }

  private static generateHoldingsContent(data: any): GeneratedContent {
    const topHoldings = data.topHoldings.slice(0, 6);
    
    return {
      kpis: [
        {
          label: "Top 10 Weight",
          value: `${data.totalWeight}%`,
          change: "of portfolio",
          isPositive: true
        },
        {
          label: "Average P/E",
          value: `${data.avgPE}x`,
          change: "Quality growth",
          isPositive: true
        },
        {
          label: "Contribution",
          value: `+${data.contribution}%`,
          change: "to performance",
          isPositive: true
        },
        {
          label: "Holdings Count",
          value: "10",
          change: "Top positions",
          isPositive: true
        }
      ],
      tableData: topHoldings.map((holding: any) => ({
        name: holding.name,
        symbol: holding.symbol,
        weight: `${holding.weight}%`,
        return: `${holding.return > 0 ? '+' : ''}${holding.return}%`,
        sector: holding.sector,
        isPositive: holding.return > 0
      })),
      highlights: [
        `Top holding: ${topHoldings[0].name} at ${topHoldings[0].weight}%`,
        `Technology represents ${topHoldings.filter((h: any) => h.sector === 'Technology').length} of top 10`,
        `Best performer: ${topHoldings.reduce((best: any, current: any) => current.return > best.return ? current : best).name} (+${topHoldings.reduce((best: any, current: any) => current.return > best.return ? current : best).return}%)`
      ]
    };
  }

  private static generateRiskContent(data: any): GeneratedContent {
    return {
      kpis: [
        {
          label: "Portfolio Beta",
          value: data.beta.toString(),
          change: `vs market 1.0`,
          isPositive: data.beta < 1.2
        },
        {
          label: "Volatility",
          value: `${data.volatility}%`,
          change: `vs ${data.marketVolatility}% market`,
          isPositive: data.volatility < data.marketVolatility
        },
        {
          label: "Max Drawdown",
          value: `${data.maxDrawdown}%`,
          change: "12-month worst",
          isPositive: data.maxDrawdown > -15
        },
        {
          label: "Value at Risk",
          value: `${data.var95}%`,
          change: "95% confidence",
          isPositive: data.var95 > -5
        },
        {
          label: "Sharpe Ratio",
          value: data.sharpeRatio.toString(),
          change: "Risk-adj return",
          isPositive: data.sharpeRatio > 1
        },
        {
          label: "Information Ratio",
          value: data.informationRatio.toString(),
          change: `TE: ${data.trackingError}%`,
          isPositive: data.informationRatio > 0
        }
      ],
      metrics: [
        { label: "Sortino Ratio", value: data.sortinoRatio.toString(), subtext: "Downside risk focus" },
        { label: "Market Correlation", value: data.correlationToMarket.toString(), subtext: "Diversification measure" }
      ]
    };
  }

  private static generateAllocationContent(data: any): GeneratedContent {
    const topSectors = data.sectors.slice(0, 6);
    
    return {
      kpis: [
        {
          label: "Excess Return",
          value: `+${data.excessReturn}%`,
          change: "from allocation",
          isPositive: data.excessReturn > 0
        },
        {
          label: "Technology",
          value: `${data.sectors[0].portfolio}%`,
          change: `+${data.sectors[0].excess}% vs S&P`,
          isPositive: data.sectors[0].excess > 0
        },
        {
          label: "Healthcare",
          value: `${data.sectors[1].portfolio}%`,
          change: `+${data.sectors[1].excess}% vs S&P`,
          isPositive: data.sectors[1].excess > 0
        },
        {
          label: "Top Sector Return",
          value: `+${Math.max(...data.sectors.map((s: any) => s.return))}%`,
          change: "Best performing",
          isPositive: true
        }
      ],
      chartData: topSectors.map((sector: any) => ({
        sector: sector.name,
        portfolio: sector.portfolio,
        benchmark: sector.benchmark,
        excess: sector.excess
      })),
      tableData: topSectors.map((sector: any) => ({
        name: sector.name,
        portfolio: `${sector.portfolio}%`,
        benchmark: `${sector.benchmark}%`,
        excess: `${sector.excess > 0 ? '+' : ''}${sector.excess}%`,
        return: `+${sector.return}%`,
        isPositive: sector.excess > 0
      }))
    };
  }

  private static generateDividendContent(data: any): GeneratedContent {
    return {
      kpis: [
        {
          label: "Portfolio Yield",
          value: `${data.currentYield}%`,
          change: `vs ${data.benchmarkYield}% S&P`,
          isPositive: data.currentYield > data.benchmarkYield
        },
        {
          label: "Annual Income",
          value: `$${(data.annualIncome / 1000).toFixed(0)}K`,
          change: `+${data.incomeGrowth}% YoY`,
          isPositive: data.incomeGrowth > 0
        },
        {
          label: "Dividend Stocks",
          value: data.dividendStocks.toString(),
          change: `${data.aristocrats} aristocrats`,
          isPositive: true
        },
        {
          label: "Growth Rate",
          value: `${data.forwardGrowth}%`,
          change: "Forward outlook",
          isPositive: data.forwardGrowth > 5
        }
      ],
      tableData: data.topDividendStocks.map((stock: any) => ({
        name: stock.name,
        yield: `${stock.yield}%`,
        payment: `$${stock.payment.toLocaleString()}`,
        isPositive: stock.yield > 2
      })),
      metrics: [
        { label: "Average Payout Ratio", value: `${data.avgPayoutRatio}%`, subtext: "Sustainable levels" }
      ]
    };
  }

  private static generateTradingContent(data: any): GeneratedContent {
    return {
      kpis: [
        {
          label: "Turnover Rate",
          value: `${data.turnoverRate}%`,
          change: "Annual activity",
          isPositive: data.turnoverRate < 50
        },
        {
          label: "Total Volume",
          value: `$${(data.totalVolume / 1000000).toFixed(1)}M`,
          change: `${data.transactionCount} trades`,
          isPositive: true
        },
        {
          label: "Avg Holding",
          value: `${data.avgHoldingPeriod}m`,
          change: "months",
          isPositive: data.avgHoldingPeriod > 6
        },
        {
          label: "Transaction Cost",
          value: `${data.transactionCost}%`,
          change: "of trade value",
          isPositive: data.transactionCost < 0.1
        }
      ],
      tableData: data.majorTrades.map((trade: any) => ({
        type: trade.type,
        security: trade.security,
        amount: `${trade.amount < 0 ? '-' : ''}$${Math.abs(trade.amount / 1000)}K`,
        impact: `${trade.impact > 0 ? '+' : ''}${trade.impact}%`,
        date: new Date(trade.date).toLocaleDateString(),
        isPositive: trade.type === 'Buy'
      }))
    };
  }

  private static generateESGContent(data: any): GeneratedContent {
    return {
      kpis: [
        {
          label: "ESG Score",
          value: data.overallScore.toString(),
          change: `${data.rating} Rating`,
          isPositive: data.overallScore > 7
        },
        {
          label: "vs S&P 500",
          value: `+${(data.overallScore - data.benchmarkScore).toFixed(1)}`,
          change: "Above benchmark",
          isPositive: data.overallScore > data.benchmarkScore
        },
        {
          label: "Carbon Intensity",
          value: `${data.carbonIntensity}`,
          change: `${data.carbonReduction}% lower`,
          isPositive: true
        },
        {
          label: "Sustainable Rev",
          value: `${data.sustainableRevenue}%`,
          change: "of portfolio",
          isPositive: data.sustainableRevenue > 25
        }
      ],
      metrics: [
        { label: "Environmental", value: data.environmentalScore.toString(), subtext: "Clean energy focus" },
        { label: "Social", value: data.socialScore.toString(), subtext: "Responsible practices" },
        { label: "Governance", value: data.governanceScore.toString(), subtext: "Corporate quality" }
      ],
      chartData: [
        { category: "Environmental", portfolio: data.environmentalScore, benchmark: 6.0 },
        { category: "Social", portfolio: data.socialScore, benchmark: 6.1 },
        { category: "Governance", portfolio: data.governanceScore, benchmark: 6.5 }
      ]
    };
  }
}