import { createContext, useContext, useState, ReactNode } from 'react';

// Selection state interface
interface SelectionState {
  selectionMode: 'accounts' | 'group';
  selectedAccountIds: Set<string>;
  selectedGroupId: string | null;
  timeframe: string;
}

// Context interface
interface SelectionContextType extends SelectionState {
  // Setters
  setSelectionMode: (mode: 'accounts' | 'group') => void;
  setSelectedAccountIds: (accountIds: Set<string>) => void;
  setSelectedGroupId: (groupId: string | null) => void;
  setTimeframe: (timeframe: string) => void;
  
  // Convenience methods
  updateSelection: (updates: Partial<SelectionState>) => void;
  resetSelection: () => void;
}

// Default values
const defaultSelection: SelectionState = {
  selectionMode: 'accounts',
  selectedAccountIds: new Set(['ACC001', 'ACC002']), // Default to first two accounts
  selectedGroupId: null,
  timeframe: 'ytd'
};

// Create context
const SelectionContext = createContext<SelectionContextType | null>(null);

// Provider component
interface SelectionProviderProps {
  children: ReactNode;
  initialState?: Partial<SelectionState>;
}

export function SelectionProvider({ children, initialState }: SelectionProviderProps) {
  const [selectionMode, setSelectionMode] = useState<'accounts' | 'group'>(
    initialState?.selectionMode || defaultSelection.selectionMode
  );
  const [selectedAccountIds, setSelectedAccountIds] = useState<Set<string>>(
    initialState?.selectedAccountIds || defaultSelection.selectedAccountIds
  );
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(
    initialState?.selectedGroupId || defaultSelection.selectedGroupId
  );
  const [timeframe, setTimeframe] = useState<string>(
    initialState?.timeframe || defaultSelection.timeframe
  );

  // Update multiple selection properties at once
  const updateSelection = (updates: Partial<SelectionState>) => {
    if (updates.selectionMode !== undefined) setSelectionMode(updates.selectionMode);
    if (updates.selectedAccountIds !== undefined) setSelectedAccountIds(updates.selectedAccountIds);
    if (updates.selectedGroupId !== undefined) setSelectedGroupId(updates.selectedGroupId);
    if (updates.timeframe !== undefined) setTimeframe(updates.timeframe);
  };

  // Reset to default values
  const resetSelection = () => {
    setSelectionMode(defaultSelection.selectionMode);
    setSelectedAccountIds(new Set(defaultSelection.selectedAccountIds));
    setSelectedGroupId(defaultSelection.selectedGroupId);
    setTimeframe(defaultSelection.timeframe);
  };

  const contextValue: SelectionContextType = {
    // State
    selectionMode,
    selectedAccountIds,
    selectedGroupId,
    timeframe,
    
    // Setters
    setSelectionMode,
    setSelectedAccountIds,
    setSelectedGroupId,
    setTimeframe,
    
    // Convenience methods
    updateSelection,
    resetSelection
  };

  return (
    <SelectionContext.Provider value={contextValue}>
      {children}
    </SelectionContext.Provider>
  );
}

// Hook to use the selection context
export function useSelection(): SelectionContextType {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
}

// Export the context and types
export { SelectionContext };
export type { SelectionState, SelectionContextType };