import AnswerCard from '../AnswerCard';

export default function AnswerCardExample() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <AnswerCard 
        question="What's the YTD performance vs S&P 500?"
        asOfDate="Dec 10, 2024"
        accounts={["Growth Portfolio", "Conservative Fund"]}
        timeframe="YTD"
        onRefresh={() => console.log('Refresh triggered')}
        onExport={() => console.log('Export triggered')}
        onFollowUpClick={(question) => console.log('Follow-up:', question)}
      />
    </div>
  );
}