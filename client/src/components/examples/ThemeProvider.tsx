import { ThemeProvider, useTheme } from '../ThemeProvider';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      data-testid="button-theme-toggle"
    >
      {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Button>
  );
}

export default function ThemeProviderExample() {
  return (
    <ThemeProvider>
      <div className="p-6 bg-background text-foreground">
        <div className="flex items-center gap-4">
          <span>Theme Toggle:</span>
          <ThemeToggle />
        </div>
      </div>
    </ThemeProvider>
  );
}