import HistoryDrawer from '../HistoryDrawer';

export default function HistoryDrawerExample() {
  return (
    <div className="p-6">
      <HistoryDrawer 
        onEntryClick={(entry) => console.log('Entry clicked:', entry.question)}
      />
    </div>
  );
}