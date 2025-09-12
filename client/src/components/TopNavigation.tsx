import { useState } from "react";
import { Search, Menu, ChevronDown, Settings2, X, Moon, Sun, Clock } from "lucide-react";

type Theme = "dark" | "light" | "system";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Account and group types
interface Account {
  id: string;
  accountNumber: string;
  name: string;
  alias?: string;
  type: string;
  balance: number;
  color: string;
}

interface AccountGroup {
  id: string;
  name: string;
  description: string;
  accountIds: string[];
  color: string;
}

interface TopNavigationProps {
  onSearchFocus?: () => void;
  onSearchChange?: (value: string) => void;
  searchValue?: string;
  onMenuClick?: () => void;
  // Account selector props
  allAccounts: Account[];
  accountGroups: AccountGroup[];
  selectedAccounts: Account[];
  selectionMode: 'accounts' | 'group';
  selectedAccountIds: Set<string>;
  selectedGroupId: string | null;
  onSelectionModeChange: (mode: 'accounts' | 'group') => void;
  onAccountSelection: (accountIds: Set<string>) => void;
  onGroupSelection: (groupId: string) => void;
  // Timeframe props
  timeframe: string;
  onTimeframeChange: (timeframe: string) => void;
  // Theme props
  theme?: Theme;
  onThemeChange?: (theme: Theme) => void;
}

// Timeframe options
const timeframes = [
  { value: "1d", label: "1D" },
  { value: "1w", label: "1W" },
  { value: "1m", label: "1M" },
  { value: "ytd", label: "YTD" },
  { value: "1y", label: "1Y" }
];

export default function TopNavigation({ 
  onSearchFocus, 
  onSearchChange, 
  searchValue = "",
  onMenuClick,
  allAccounts,
  accountGroups,
  selectedAccounts,
  selectionMode,
  selectedAccountIds,
  selectedGroupId,
  onSelectionModeChange,
  onAccountSelection,
  onGroupSelection,
  timeframe,
  onTimeframeChange,
  theme,
  onThemeChange
}: TopNavigationProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isAccountSelectorOpen, setIsAccountSelectorOpen] = useState(false);
  
  // Local state for pending changes (to prevent API calls on every selection)
  const [pendingSelectionMode, setPendingSelectionMode] = useState(selectionMode);
  const [pendingSelectedAccountIds, setPendingSelectedAccountIds] = useState(selectedAccountIds);
  const [pendingSelectedGroupId, setPendingSelectedGroupId] = useState(selectedGroupId);
  const [hasUnappliedChanges, setHasUnappliedChanges] = useState(false);

  // Account selection handlers for local state
  const handleAccountToggle = (accountId: string) => {
    const newSelection = new Set(pendingSelectedAccountIds);
    
    if (newSelection.has(accountId)) {
      // Prevent removing the last account
      if (newSelection.size > 1) {
        newSelection.delete(accountId);
      } else {
        console.warn('Cannot deselect the last account');
        return;
      }
    } else {
      newSelection.add(accountId);
    }
    
    setPendingSelectedAccountIds(newSelection);
    setHasUnappliedChanges(true);
  };

  const handleGroupSelect = (groupId: string) => {
    setPendingSelectedGroupId(groupId);
    setHasUnappliedChanges(true);
  };

  const handleSelectionModeToggle = (mode: 'accounts' | 'group') => {
    if (mode === pendingSelectionMode) return;
    
    if (mode === 'accounts') {
      // Switch to accounts mode: clear group selection and keep current accounts
      if (pendingSelectedAccountIds.size === 0) {
        setPendingSelectedAccountIds(new Set([allAccounts[0].id]));
      }
      setPendingSelectedGroupId(null);
    } else {
      // Switch to group mode: select first group
      setPendingSelectedGroupId(accountGroups[0].id);
      setPendingSelectedAccountIds(new Set());
    }
    setPendingSelectionMode(mode);
    setHasUnappliedChanges(true);
  };

  // Apply changes
  const handleApplyChanges = () => {
    onSelectionModeChange(pendingSelectionMode);
    if (pendingSelectionMode === 'accounts') {
      onAccountSelection(pendingSelectedAccountIds);
    } else if (pendingSelectedGroupId) {
      onGroupSelection(pendingSelectedGroupId);
    }
    setHasUnappliedChanges(false);
    setIsAccountSelectorOpen(false);
  };

  // Cancel changes
  const handleCancelChanges = () => {
    setPendingSelectionMode(selectionMode);
    setPendingSelectedAccountIds(selectedAccountIds);
    setPendingSelectedGroupId(selectedGroupId);
    setHasUnappliedChanges(false);
    setIsAccountSelectorOpen(false);
  };

  // Get display name for current selection
  const getSelectionDisplayName = () => {
    if (selectionMode === 'group' && selectedGroupId) {
      const group = accountGroups.find(g => g.id === selectedGroupId);
      return group ? group.name : 'Unknown Group';
    }
    return `${selectedAccounts.length} account${selectedAccounts.length === 1 ? '' : 's'}`;
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    onSearchFocus?.();
    console.log('Search focused');
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(e.target.value);
  };

  return (
    <nav className="bg-card border-b border-card-border px-2 sm:px-4 py-1.5">
      <div className="flex items-center justify-between w-full h-10">
        {/* Left: Logo */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden h-8 w-8"
            onClick={onMenuClick}
            data-testid="button-menu"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">FS</span>
            </div>
            <span className="font-semibold text-sm text-foreground hidden md:block">FinSight</span>
          </div>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-2xl mx-2 sm:mx-4">
          <div className="relative">
            <Search className={`absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 transition-colors duration-200 ${
              isSearchFocused ? 'text-primary' : 'text-muted-foreground'
            }`} />
            <Input
              type="search"
              placeholder="Search portfolio..."
              className={`h-8 pl-8 pr-3 text-sm rounded-md bg-background border transition-all duration-200 ${
                isSearchFocused ? 'ring-2 ring-primary/20 border-primary/30' : 'border-border'
              }`}
              value={searchValue}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              data-testid="input-search"
            />
          </div>
        </div>

        {/* Right: Timeframe, Theme Toggle, and Account Selection */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Timeframe selector - compact */}
          <div className="hidden sm:flex items-center gap-1">
            <Select value={timeframe} onValueChange={onTimeframeChange}>
              <SelectTrigger className="h-8 w-16 text-xs border-none bg-muted/50 hover:bg-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeframes.map((tf) => (
                  <SelectItem key={tf.value} value={tf.value} className="text-xs">
                    {tf.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Account scope chip */}
          <div className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded text-xs text-muted-foreground">
            <span className="hidden sm:inline">{selectedAccounts.length}</span>
            <span className="hidden sm:inline">acct{selectedAccounts.length !== 1 ? 's' : ''}</span>
            <span className="sm:hidden">{selectedAccounts.length}</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onThemeChange?.(theme === 'light' ? 'dark' : 'light')}
            data-testid="button-theme-toggle"
          >
            {theme === 'light' ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
          </Button>

          {/* Account selector popover */}
          <Popover open={isAccountSelectorOpen} onOpenChange={setIsAccountSelectorOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 hover-elevate h-8 px-2"
                data-testid="button-account-selector"
              >
                <Settings2 className="h-4 w-4" />
                <span className="hidden sm:block text-sm">{getSelectionDisplayName()}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
                {hasUnappliedChanges && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end">
              <Tabs 
                value={pendingSelectionMode} 
                onValueChange={(value) => handleSelectionModeToggle(value as 'accounts' | 'group')}
              >
                {/* Mode Switcher */}
                <div className="p-3 border-b">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="accounts">Accounts</TabsTrigger>
                    <TabsTrigger value="group">Group</TabsTrigger>
                  </TabsList>
                </div>

                {/* Accounts Tab */}
                <TabsContent value="accounts" className="mt-0">
                  <Command>
                    <div className="flex items-center border-b px-3">
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <CommandInput placeholder="Search accounts..." className="flex h-10 w-full" />
                    </div>
                    <CommandList className="max-h-64">
                      <CommandEmpty>No accounts found.</CommandEmpty>
                      <CommandGroup>
                        {allAccounts.map((account) => {
                          const isSelected = pendingSelectedAccountIds.has(account.id);
                          const isLastSelected = pendingSelectedAccountIds.size === 1 && isSelected;
                          
                          return (
                            <CommandItem
                              key={account.id}
                              value={`${account.accountNumber} ${account.name} ${account.alias || ''}`}
                              onSelect={() => handleAccountToggle(account.id)}
                              className="flex items-center space-x-2 p-2 hover-elevate transition-all duration-200"
                              data-testid={`command-item-${account.id}`}
                            >
                              <Checkbox
                                checked={isSelected}
                                disabled={isLastSelected}
                                className={`data-[state=checked]:bg-primary ${isLastSelected ? 'opacity-50' : ''}`}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">
                                  {account.alias || account.name}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {account.accountNumber} • {account.type}
                                </div>
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </TabsContent>

                {/* Groups Tab */}
                <TabsContent value="group" className="mt-0">
                  <Command>
                    <div className="flex items-center border-b px-3">
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <CommandInput placeholder="Search groups..." className="flex h-10 w-full" />
                    </div>
                    <CommandList className="max-h-64">
                      <CommandEmpty>No groups found.</CommandEmpty>
                      <CommandGroup>
                        <RadioGroup 
                          value={pendingSelectedGroupId || ''} 
                          onValueChange={handleGroupSelect}
                        >
                          {accountGroups.map((group) => (
                            <CommandItem
                              key={group.id}
                              value={`${group.name} ${group.description}`}
                              onSelect={() => handleGroupSelect(group.id)}
                              className="flex items-center space-x-2 p-2 hover-elevate transition-all duration-200"
                              data-testid={`command-item-${group.id}`}
                            >
                              <RadioGroupItem 
                                value={group.id} 
                                id={group.id} 
                                className="data-[state=checked]:bg-primary"
                              />
                              <Label htmlFor={group.id} className="flex-1 min-w-0 cursor-pointer">
                                <div className="font-medium truncate">{group.name}</div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {group.description} • {group.accountIds.length} accounts
                                </div>
                              </Label>
                            </CommandItem>
                          ))}
                        </RadioGroup>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </TabsContent>
              </Tabs>

              {/* Apply/Cancel buttons */}
              <div className="flex items-center justify-between p-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelChanges}
                  data-testid="button-cancel-selection"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleApplyChanges}
                  disabled={!hasUnappliedChanges}
                  data-testid="button-apply-selection"
                >
                  Apply Changes
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </nav>
  );
}