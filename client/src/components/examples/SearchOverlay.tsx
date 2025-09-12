import SearchOverlay from '../SearchOverlay';

export default function SearchOverlayExample() {
  return (
    <div className="relative w-full h-96 bg-background p-4">
      <SearchOverlay 
        isOpen={true}
        onCategorySelect={(category) => console.log('Category:', category)}
        onQuestionSelect={(question) => console.log('Question:', question)}
      />
    </div>
  );
}