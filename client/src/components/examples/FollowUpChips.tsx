import FollowUpChips from '../FollowUpChips';

export default function FollowUpChipsExample() {
  return (
    <div className="p-6">
      <FollowUpChips 
        questions={[
          "What drove the outperformance?", 
          "Show sector breakdown", 
          "Compare risk metrics"
        ]}
        onQuestionClick={(question) => console.log('Question clicked:', question)}
      />
    </div>
  );
}