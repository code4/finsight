import ContextBar from '../ContextBar';

export default function ContextBarExample() {
  return (
    <ContextBar 
      onAccountsChange={(accounts) => console.log('Accounts changed:', accounts.map(acc => acc.name))}
      onTimeframeChange={(timeframe) => console.log('Timeframe:', timeframe)}
    />
  );
}