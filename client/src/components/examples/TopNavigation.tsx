import TopNavigation from '../TopNavigation';

export default function TopNavigationExample() {
  return (
    <TopNavigation 
      onSearchFocus={() => console.log('Search focused')}
      onSearchChange={(value) => console.log('Search:', value)}
      onMenuClick={() => console.log('Menu clicked')}
    />
  );
}