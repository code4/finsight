import FinancialChart from '../FinancialChart';

export default function FinancialChartExample() {
  return (
    <div className="p-6 bg-card">
      <h3 className="text-lg font-semibold mb-4">Portfolio Performance</h3>
      <FinancialChart />
    </div>
  );
}