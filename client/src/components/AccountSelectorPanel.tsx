import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';

// Account and Group interfaces
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
}

interface AccountSelectorPanelProps {
  // Data
  allAccounts: Account[];
  accountGroups: AccountGroup[];
  
  // Initial state
  initialMode: 'accounts' | 'group';
  initialSelectedAccountIds: Set<string>;
  initialSelectedGroupId: string | null;
  
  // Behavior configuration
  variant?: 'single' | 'multi'; // single = radio selection, multi = checkbox selection
  showTabs?: boolean; // whether to show Accounts/Group tabs
  
  // Callbacks
  onApply: (selection: {
    mode: 'accounts' | 'group';
    accountIds: Set<string>;
    groupId: string | null;
  }) => void;
  onCancel: () => void;
  onHasChanges?: (hasChanges: boolean) => void; // Called when change status updates
  
  // Optional styling
  className?: string;
}

export function AccountSelectorPanel({
  allAccounts,
  accountGroups,
  initialMode,
  initialSelectedAccountIds,
  initialSelectedGroupId,
  variant = 'multi',
  showTabs = true,
  onApply,
  onCancel,
  onHasChanges,
  className = ''
}: AccountSelectorPanelProps) {
  // Local pending state
  const [pendingMode, setPendingMode] = useState(initialMode);
  const [pendingSelectedAccountIds, setPendingSelectedAccountIds] = useState(new Set(initialSelectedAccountIds));
  const [pendingSelectedGroupId, setPendingSelectedGroupId] = useState(initialSelectedGroupId);

  // Reset local state when initial props change
  useEffect(() => {
    setPendingMode(initialMode);
    setPendingSelectedAccountIds(new Set(initialSelectedAccountIds));
    setPendingSelectedGroupId(initialSelectedGroupId);
  }, [initialMode, initialSelectedAccountIds, initialSelectedGroupId]);

  // Handle mode toggle between accounts and group
  const handleModeToggle = (mode: 'accounts' | 'group') => {
    setPendingMode(mode);
  };

  // Handle individual account toggle (multi-select)
  const handleAccountToggle = (accountId: string) => {
    const newSelected = new Set(pendingSelectedAccountIds);
    
    if (variant === 'single') {
      // Single selection - replace current selection
      newSelected.clear();
      newSelected.add(accountId);
    } else {
      // Multi selection - toggle
      if (newSelected.has(accountId)) {
        // Prevent deselecting the last account in multi-select
        if (newSelected.size > 1) {
          newSelected.delete(accountId);
        }
      } else {
        newSelected.add(accountId);
      }
    }
    
    setPendingSelectedAccountIds(newSelected);
  };

  // Handle group selection
  const handleGroupSelect = (groupId: string) => {
    setPendingSelectedGroupId(groupId);
  };

  // Check if there are unapplied changes
  const hasUnappliedChanges = 
    pendingMode !== initialMode ||
    !setsEqual(pendingSelectedAccountIds, initialSelectedAccountIds) ||
    pendingSelectedGroupId !== initialSelectedGroupId;

  // Notify parent of change status
  useEffect(() => {
    onHasChanges?.(hasUnappliedChanges);
  }, [hasUnappliedChanges, onHasChanges]);

  // Apply changes
  const handleApply = () => {
    onApply({
      mode: pendingMode,
      accountIds: new Set(pendingSelectedAccountIds),
      groupId: pendingSelectedGroupId
    });
  };

  // Cancel changes
  const handleCancel = () => {
    setPendingMode(initialMode);
    setPendingSelectedAccountIds(new Set(initialSelectedAccountIds));
    setPendingSelectedGroupId(initialSelectedGroupId);
    onCancel();
  };

  return (
    <div className={`w-full ${className}`}>
      {showTabs ? (
        <Tabs value={pendingMode} onValueChange={(value) => handleModeToggle(value as 'accounts' | 'group')}>
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
                <CommandInput
                  placeholder="Search accounts..."
                  className="flex h-10 w-full"
                />
              </div>
              <div className="max-h-64 overflow-y-auto">
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
                        {variant === 'single' ? (
                          // Single selection - radio button style
                          <div className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                            isSelected
                              ? 'bg-primary border-primary' 
                              : 'border-border hover:border-primary/50'
                          }`}>
                            {isSelected && (
                              <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                            )}
                          </div>
                        ) : (
                          // Multi selection - checkbox
                          <Checkbox
                            checked={isSelected}
                            disabled={isLastSelected}
                            className={`data-[state=checked]:bg-primary ${
                              isLastSelected ? 'opacity-50' : ''
                            }`}
                          />
                        )}
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
              </div>
            </Command>
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="group" className="mt-0">
            <Command>
              <div className="flex items-center border-b px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <CommandInput
                  placeholder="Search groups..."
                  className="flex h-10 w-full"
                />
              </div>
              <div className="max-h-64 overflow-y-auto">
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
                        <Label
                          htmlFor={group.id}
                          className="flex-1 min-w-0 cursor-pointer"
                        >
                          <div className="font-medium truncate">
                            {group.name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {group.description} • {group.accountIds.length} accounts
                          </div>
                        </Label>
                      </CommandItem>
                    ))}
                  </RadioGroup>
                </CommandGroup>
              </div>
            </Command>
          </TabsContent>
        </Tabs>
      ) : (
        // No tabs - show accounts only
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Search accounts..."
              className="flex h-10 w-full"
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
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
                    {variant === 'single' ? (
                      // Single selection - radio button style
                      <div className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                        isSelected
                          ? 'bg-primary border-primary' 
                          : 'border-border hover:border-primary/50'
                      }`}>
                        {isSelected && (
                          <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                        )}
                      </div>
                    ) : (
                      // Multi selection - checkbox
                      <Checkbox
                        checked={isSelected}
                        disabled={isLastSelected}
                        className={`data-[state=checked]:bg-primary ${
                          isLastSelected ? 'opacity-50' : ''
                        }`}
                      />
                    )}
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
          </div>
        </Command>
      )}

      {/* Apply/Cancel buttons */}
      <div className="flex items-center justify-between p-3 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          data-testid="button-cancel-selection"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleApply}
          disabled={!hasUnappliedChanges}
          data-testid="button-apply-selection"
        >
          Apply Changes
        </Button>
      </div>
    </div>
  );
}

// Helper function to compare Sets
function setsEqual<T>(setA: Set<T>, setB: Set<T>): boolean {
  if (setA.size !== setB.size) return false;
  return Array.from(setA).every(item => setB.has(item));
}

export type { Account, AccountGroup, AccountSelectorPanelProps };