import { useState, useEffect, memo } from 'react'
import { useTypingAnimation } from '@/hooks/useTypingAnimation'
import {
  Search,
  Menu,
  ChevronDown,
  Settings2,
  X,
  Moon,
  Sun,
  Clock,
} from 'lucide-react'

type Theme = 'dark' | 'light' | 'system'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AccountSelectorPanel } from '@/components/AccountSelectorPanel'
import { useSelection } from '@/components/SelectionContext'

// Account and group types
interface Account {
  id: string
  accountNumber: string
  name: string
  alias?: string
  type: string
  balance: number
  color: string
}

interface AccountGroup {
  id: string
  name: string
  description: string
  accountIds: string[]
  color: string
}

interface TopNavigationProps {
  onSearchFocus?: () => void
  onSearchChange?: (value: string) => void
  searchValue?: string
  onMenuClick?: () => void
  hideSearch?: boolean
  // Account selector props
  allAccounts: Account[]
  accountGroups: AccountGroup[]
  selectedAccounts: Account[]
  selectionMode: 'accounts' | 'group'
  selectedAccountIds: Set<string>
  selectedGroupId: string | null
  onSelectionModeChange: (mode: 'accounts' | 'group') => void
  onAccountSelection: (accountIds: Set<string>) => void
  onGroupSelection: (groupId: string) => void
  // Timeframe props
  timeframe: string
  onTimeframeChange: (timeframe: string) => void
  // Theme props
  theme?: Theme
  onThemeChange?: (theme: Theme) => void
}

// Timeframe options for financial analysis
const timeframes = [
  { value: 'mtd', short: 'MTD', label: 'Month to Date' },
  { value: 'ytd', short: 'YTD', label: 'Year to Date' },
  { value: 'prev_month', short: 'PM', label: 'Previous Month' },
  { value: 'prev_quarter', short: 'PQ', label: 'Previous Quarter' },
  { value: 'prev_year', short: 'PY', label: 'Previous Year' },
  { value: '1m', short: '1M', label: 'One Month' },
  { value: '1y', short: '1Y', label: 'One Year' },
]

const TopNavigation = memo(function TopNavigation({
  onSearchFocus,
  onSearchChange,
  searchValue = '',
  onMenuClick,
  hideSearch = false,
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
  onThemeChange,
}: TopNavigationProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isAccountSelectorOpen, setIsAccountSelectorOpen] = useState(false)

  // Typing animation for search placeholder with responsive questions
  const placeholderQuestions = [
    "What's the YTD performance vs S&P 500?",
    'Show me the top 10 holdings by weight',
    "What's the portfolio's beta and volatility?",
    'How is the portfolio allocated by sector?',
    'What are the biggest risk exposures?',
    'Which positions had the best performance?',
    "What's driving current performance attribution?",
    'Show me recent portfolio activity summary',
  ]

  const tabletQuestions = [
    "YTD performance vs S&P 500?",
    'Top 10 holdings by weight',
    "Portfolio beta and volatility?",
    'Sector allocation breakdown',
    'Biggest risk exposures?',
    'Best performing positions?',
    "Performance attribution?",
    'Recent portfolio activity',
  ]

  const mobileQuestions = [
    "YTD vs S&P 500?",
    'Top holdings',
    "Portfolio risk?",
    'Sector allocation',
    'Risk exposure?',
    'Best positions?',
    "Performance?",
    'Recent activity',
  ]

  const { displayedText } = useTypingAnimation({
    questions: placeholderQuestions,
    tabletQuestions,
    mobileQuestions,
    isActive: !searchValue && !isSearchFocused,
    typingSpeed: 50,
    erasingSpeed: 30,
    pauseDuration: 2000,
  })

  // Local state for pending changes (to prevent API calls on every selection)
  const [pendingSelectionMode, setPendingSelectionMode] =
    useState(selectionMode)
  const [pendingSelectedAccountIds, setPendingSelectedAccountIds] =
    useState(selectedAccountIds)
  const [pendingSelectedGroupId, setPendingSelectedGroupId] =
    useState(selectedGroupId)
  const [hasUnappliedChanges, setHasUnappliedChanges] = useState(false)

  // Account selection handlers for local state
  const handleAccountToggle = (accountId: string) => {
    const newSelection = new Set(pendingSelectedAccountIds)

    if (newSelection.has(accountId)) {
      // Prevent removing the last account
      if (newSelection.size > 1) {
        newSelection.delete(accountId)
      } else {
        console.warn('Cannot deselect the last account')
        return
      }
    } else {
      newSelection.add(accountId)
    }

    setPendingSelectedAccountIds(newSelection)
    setHasUnappliedChanges(true)
    
    // Auto-apply for immediate reactivity
    setTimeout(() => {
      onSelectionModeChange(pendingSelectionMode)
      onAccountSelection(newSelection)
      setHasUnappliedChanges(false)
    }, 0)
  }

  const handleGroupSelect = (groupId: string) => {
    setPendingSelectedGroupId(groupId)
    setHasUnappliedChanges(true)
    
    // Auto-apply for immediate reactivity
    setTimeout(() => {
      onSelectionModeChange('group')
      onGroupSelection(groupId)
      setHasUnappliedChanges(false)
    }, 0)
  }

  const handleSelectionModeToggle = (mode: 'accounts' | 'group') => {
    if (mode === pendingSelectionMode) return

    let newAccountIds = pendingSelectedAccountIds
    let newGroupId = pendingSelectedGroupId

    if (mode === 'accounts') {
      // Switch to accounts mode: clear group selection and keep current accounts
      if (pendingSelectedAccountIds.size === 0) {
        newAccountIds = new Set([allAccounts[0].id])
        setPendingSelectedAccountIds(newAccountIds)
      }
      newGroupId = null
      setPendingSelectedGroupId(null)
    } else {
      // Switch to group mode: select first group
      newGroupId = accountGroups[0].id
      setPendingSelectedGroupId(newGroupId)
      newAccountIds = new Set()
      setPendingSelectedAccountIds(newAccountIds)
    }
    setPendingSelectionMode(mode)
    setHasUnappliedChanges(true)
    
    // Auto-apply for immediate reactivity
    setTimeout(() => {
      onSelectionModeChange(mode)
      if (mode === 'accounts') {
        onAccountSelection(newAccountIds)
      } else {
        onGroupSelection(newGroupId!)
      }
      setHasUnappliedChanges(false)
    }, 0)
  }

  // Apply changes
  const handleApplyChanges = () => {
    onSelectionModeChange(pendingSelectionMode)
    if (pendingSelectionMode === 'accounts') {
      onAccountSelection(pendingSelectedAccountIds)
    } else if (pendingSelectedGroupId) {
      onGroupSelection(pendingSelectedGroupId)
    }
    setHasUnappliedChanges(false)
    setIsAccountSelectorOpen(false)
  }

  // Cancel changes
  const handleCancelChanges = () => {
    setPendingSelectionMode(selectionMode)
    setPendingSelectedAccountIds(selectedAccountIds)
    setPendingSelectedGroupId(selectedGroupId)
    setHasUnappliedChanges(false)
    setIsAccountSelectorOpen(false)
  }

  // Get display name for current selection - use pending state to show live updates
  const getSelectionDisplayName = () => {
    if (pendingSelectionMode === 'group' && pendingSelectedGroupId) {
      const group = accountGroups.find(g => g.id === pendingSelectedGroupId)
      return group ? group.name : 'Unknown Group'
    }
    return `${pendingSelectedAccountIds.size} account${
      pendingSelectedAccountIds.size === 1 ? '' : 's'
    }`
  }

  const handleSearchFocus = () => {
    setIsSearchFocused(true)
    onSearchFocus?.()
    // Blur the header input so focus can transfer to overlay
    setTimeout(() => {
      if (
        document.activeElement &&
        document.activeElement instanceof HTMLElement
      ) {
        document.activeElement.blur()
      }
    }, 50)
    console.log('Search focused')
  }

  const handleSearchClick = () => {
    // Ensure overlay opens even if input is already focused
    onSearchFocus?.()
    // Blur the header input so focus can transfer to overlay
    setTimeout(() => {
      if (
        document.activeElement &&
        document.activeElement instanceof HTMLElement
      ) {
        document.activeElement.blur()
      }
    }, 50)
    console.log('Search clicked')
  }

  const handleSearchBlur = () => {
    // Don't blur immediately - let the overlay handle this
    // setIsSearchFocused(false);
  }

  return (
    <nav className="bg-card border-b border-card-border px-2 sm:px-4 py-2">
      <div className="grid grid-cols-[auto_1fr_auto] items-center w-full h-12 gap-x-2 sm:gap-x-3">
        {/* Left: Logo */}
        <div className="flex items-center gap-2 sm:gap-3 justify-start">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">
                FS
              </span>
            </div>
            <span className="font-semibold text-sm text-foreground hidden md:block">
              FinSight
            </span>
          </div>
        </div>

        {/* Center: Enhanced Search */}
        <div className="flex justify-center min-w-0">
          {!hideSearch && (
            <div className="relative w-full min-w-0 max-w-[420px] sm:max-w-[560px] md:max-w-lg lg:max-w-xl">
              {/* Search icon */}
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200 z-10 ${
                  isSearchFocused ? 'text-primary' : 'text-muted-foreground/60'
                }`}
              />

              {/* Search input */}
              <Input
                type="search"
                placeholder=""
                className={`h-10 pl-12 pr-16 text-base rounded-lg transition-all duration-200 w-full cursor-pointer font-medium truncate whitespace-nowrap
          ${
            isSearchFocused
              ? 'bg-background border-2 ring-4 ring-primary/10 border-primary shadow-lg shadow-primary/5'
              : 'bg-background/80 border-2 border-border/50 hover:bg-background hover:border-primary/30 hover:shadow-md shadow-sm'
          }`}
                value={searchValue}
                onChange={e => onSearchChange?.(e.target.value)}
                onFocus={handleSearchFocus}
                onClick={handleSearchClick}
                data-testid="input-search"
              />

              {/* Placeholder animation */}
              {!searchValue && (
                <div className="absolute inset-0 pl-12 pr-16 h-10 flex items-center pointer-events-none overflow-hidden">
                  <span className="text-base text-muted-foreground/70 font-normal truncate whitespace-nowrap">
                    {displayedText}
                    <span className="animate-pulse ml-1 opacity-70">|</span>
                  </span>
                </div>
              )}

              {/* ⌘K shortcut hint */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1 text-xs text-muted-foreground/60">
                <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted/50 border border-border/50 rounded">
                  ⌘
                </kbd>
                <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted/50 border border-border/50 rounded">
                  K
                </kbd>
              </div>
            </div>
          )}
        </div>

        {/* Right: Timeframe, Theme Toggle, and Account Selection */}
        <div className="flex items-center gap-1 sm:gap-2 justify-end whitespace-nowrap shrink-0">
          {/* Timeframe selector — visible on mobile too */}
          <div className="flex items-center gap-1 shrink-0">
            <Select value={timeframe} onValueChange={onTimeframeChange}>
              <SelectTrigger className="h-8 w-14 md:w-16 text-xs border-none bg-muted/50 hover:bg-muted px-2">
                <SelectValue>
                  {timeframes.find(tf => tf.value === timeframe)?.short || timeframe}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {timeframes.map(tf => (
                  <SelectItem
                    key={tf.value}
                    value={tf.value}
                    className="text-xs"
                  >
                    {tf.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              onThemeChange?.(theme === 'light' ? 'dark' : 'light')
            }
            data-testid="button-theme-toggle"
          >
            {theme === 'light' ? (
              <Moon className="h-3 w-3" />
            ) : (
              <Sun className="h-3 w-3" />
            )}
          </Button>

          {/* Account selector popover */}
          <Popover
            open={isAccountSelectorOpen}
            onOpenChange={setIsAccountSelectorOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 hover-elevate h-8 px-2"
                data-testid="button-account-selector"
              >
                <Settings2 className="h-4 w-4" />
                <span className="hidden sm:block text-sm">
                  {getSelectionDisplayName()}
                </span>
                <ChevronDown className="h-3 w-3 opacity-50" />
                {hasUnappliedChanges && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end">
              <AccountSelectorPanel
                allAccounts={allAccounts}
                accountGroups={accountGroups}
                initialMode={pendingSelectionMode}
                initialSelectedAccountIds={pendingSelectedAccountIds}
                initialSelectedGroupId={pendingSelectedGroupId}
                variant="multi"
                showTabs={true}
                onApply={(selection) => {
                  // Update selection mode if changed
                  if (selection.mode !== pendingSelectionMode) {
                    handleSelectionModeToggle(selection.mode);
                  }
                  
                  // Directly set the account selection instead of toggling individual accounts
                  if (selection.mode === 'accounts') {
                    setPendingSelectedAccountIds(new Set(selection.accountIds));
                  }
                  
                  // Update group selection if changed
                  if (selection.mode === 'group') {
                    setPendingSelectedGroupId(selection.groupId);
                  }
                  
                  // Mark changes as applied and trigger the save
                  setHasUnappliedChanges(true);
                  handleApplyChanges();
                }}
                onCancel={handleCancelChanges}
                onHasChanges={setHasUnappliedChanges}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </nav>
  )
})

export default TopNavigation
