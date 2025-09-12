import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ChartDataPoint {
  month: string;
  portfolio: number;
  benchmark: number;
}

interface FinancialChartProps {
  data?: ChartDataPoint[];
}

const defaultData: ChartDataPoint[] = [
  { month: "Jan", portfolio: 4000, benchmark: 3800 },
  { month: "Feb", portfolio: 4200, benchmark: 4000 },
  { month: "Mar", portfolio: 4100, benchmark: 4100 },
  { month: "Apr", portfolio: 4400, benchmark: 4200 },
  { month: "May", portfolio: 4600, benchmark: 4300 },
  { month: "Jun", portfolio: 4800, benchmark: 4400 }
];

export default function FinancialChart({ data = defaultData }: FinancialChartProps) {
  return (
    <div className="h-64 md:h-80 lg:h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              fontSize: '12px'
            }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="portfolio" 
            stroke="hsl(var(--chart-1))" 
            strokeWidth={2}
            name="Portfolio"
            dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="benchmark" 
            stroke="hsl(var(--chart-2))" 
            strokeWidth={2}
            name="S&P 500"
            dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}