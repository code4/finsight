# FinSight Vue 3 TDD Rebuild Requirements

## 📋 Project Overview

FinSight is a sophisticated financial portfolio analysis platform that transforms traditional portfolio reporting into an interactive, AI-powered experience. This document provides comprehensive requirements for rebuilding the application using Vue 3 with Test-Driven Development (TDD) practices.

## 🎯 Core Business Requirements

### Primary Value Proposition
- **Conversational Portfolio Analysis**: Natural language queries instead of complex dashboards
- **Intelligent Question Matching**: AI-powered understanding of financial terminology
- **Rich Data Visualization**: Interactive charts, metrics, and visual portfolio representations
- **Mobile-First Design**: Optimized experience across all devices
- **Real-Time Insights**: Immediate responses with confidence scoring

### Target Users
- **Primary**: Financial Advisors (FAs) managing client portfolios
- **Secondary**: Portfolio managers and investment professionals
- **Use Case**: Daily portfolio review, client meeting preparation, risk assessment

## 🏗️ Technical Architecture Requirements

### Vue 3 Technology Stack
```typescript
// Core Framework
{
  "vue": "^3.5.21",
  "typescript": "^5.5.4",
  "vite": "^5.4.5",

  // State & Routing
  "pinia": "^2.2.2",                   // State management
  "vue-router": "^4.4.3",              // Routing
  "@tanstack/vue-query": "^5.55.4",    // Server state management

  // UI Framework
  "primevue": "^4.3.9",
  "primeicons": "^7.0.0",
  "tailwindcss": "^3.4.10",
  "tailwindcss-primeui": "^0.3.4",
  "@primevue/themes": "^4.3.9",

  // Charts & Data Grids
  "highcharts": "^12.4.0",
  "highcharts-vue": "^2.0.1",
  "ag-grid-vue3": "^34.1.2",
  "ag-grid-community": "^34.1.2",

  // Animations
  "motion-v": "^1.0.0",
  "@vueuse/core": "^11.0.3",

  // Utilities
  "date-fns": "^3.6.0",
  "zod": "^3.23.8",
  "@vueuse/shared": "^11.0.3",

  // Testing
  "vitest": "^2.0.5",
  "@vue/test-utils": "^2.4.6",
  "jsdom": "^23.0.0",
  "msw": "^2.0.0",
  "@testing-library/vue": "^8.1.0"
}
```

### Bundle Size Analysis
```typescript
// Production Bundle Breakdown
{
  "vendor": "90KB",          // Vue 3.5 + core dependencies
  "ui-framework": "95KB",    // PrimeVue 4 (tree-shaken)
  "charts": "85KB",          // Highcharts (selective imports)
  "data-grid": "120KB",      // AG Grid Community
  "animations": "30KB",      // Motion for Vue
  "utilities": "45KB",       // Date-fns, Zod, VueUse
  "app-code": "85KB",        // Application logic
  "total": "550KB"
}
```

### Project Structure
```
finsight-vue/
├── src/
│   ├── components/
│   │   ├── ui/                  # Base UI components
│   │   ├── financial/           # Financial-specific components
│   │   └── layout/              # Layout components
│   ├── composables/             # Vue composition functions
│   ├── stores/                  # Pinia stores
│   ├── router/                  # Vue Router configuration
│   ├── services/                # API services
│   ├── types/                   # TypeScript interfaces
│   ├── utils/                   # Utility functions
│   └── tests/                   # Test files
├── tests/
│   ├── unit/                    # Unit tests
│   ├── integration/             # Integration tests
│   └── e2e/                     # End-to-end tests
└── docs/                        # Documentation
```

## 🎨 Design System Requirements

### Color Palette (HSL Values)
```scss
// Dark Mode Primary (Professional Financial Terminal)
--background: 210 25% 8%;           // Deep navy-charcoal
--surface: 210 20% 12%;             // Elevated panels
--text-primary: 0 0% 95%;           // Near white
--text-secondary: 210 10% 70%;      // Muted text

// Brand & Accent Colors
--primary-brand: 210 100% 60%;      // Professional blue
--success-gains: 142 76% 36%;       // Financial green
--warning-losses: 0 84% 60%;        // Financial red
--neutral-data: 45 7% 45%;          // Muted gold

// Chart Colors (Financial Data Visualization)
--chart-1: 210 100% 60%;            // Primary blue
--chart-2: 142 76% 36%;             // Success green
--chart-3: 0 84% 60%;               // Warning red
--chart-4: 280 75% 65%;             // Purple
--chart-5: 45 100% 55%;             // Gold
```

### Typography Requirements
```scss
// Font Families
--font-primary: "Inter", system-ui, sans-serif;           // UI text
--font-mono: "JetBrains Mono", Consolas, monospace;       // Financial data

// Typography Scale
--text-xs: 0.75rem;      // 12px - Small labels
--text-sm: 0.875rem;     // 14px - Secondary text
--text-base: 1rem;       // 16px - Body text
--text-lg: 1.125rem;     // 18px - Subheadings
--text-xl: 1.25rem;      // 20px - Card titles
--text-2xl: 1.5rem;      // 24px - Section headings
```

### Layout & Spacing System
```scss
// Tailwind Spacing (Dense Financial Layouts)
--space-1: 0.25rem;      // 4px
--space-2: 0.5rem;       // 8px
--space-4: 1rem;         // 16px
--space-6: 1.5rem;       // 24px
--space-8: 2rem;         // 32px
```

### Animation Guidelines
- **Minimal & Purposeful**: Subtle fade-ins for overlays
- **No Distracting Animations**: Data clarity priority
- **Performance**: Use CSS transforms and opacity only
- **Reduced Motion**: Respect user preferences

## 📱 Responsive Design Requirements

### Breakpoint Strategy
```scss
// Mobile-first approach with desktop optimization
--mobile: 0px;           // 320px+
--tablet: 768px;         // iPad and similar
--desktop: 1024px;       // Desktop screens
--wide: 1280px;          // Wide displays
```

### Screen-Specific Adaptations
1. **Mobile (320px-767px)**:
   - Full-screen search modal
   - Touch-optimized controls (44px minimum)
   - Simplified navigation
   - Abbreviated question text

2. **Tablet (768px-1023px)**:
   - Split-screen layouts
   - Gesture-friendly interfaces
   - Medium complexity controls

3. **Desktop (1024px+)**:
   - Multi-column layouts
   - Keyboard shortcuts
   - Advanced functionality
   - Dense information display

## 🔧 Core Components Requirements

### Component Architecture Overview

**UI Framework**: PrimeVue 4 with Tailwind CSS integration
**Chart Library**: Highcharts with Vue 3 wrapper
**Data Grid**: AG Grid Community Edition
**Animations**: Motion for Vue

### PortfolioDataGrid.vue - Enterprise Data Management

**Purpose**: Professional data grid for portfolio holdings using AG Grid

**Template**:
```vue
<template>
  <Motion
    :initial="{ opacity: 0, y: 20 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.5 }"
  >
    <Card>
      <template #header>
        <div class="flex justify-between items-center p-4">
          <h2 class="text-xl font-semibold">Portfolio Holdings</h2>
          <div class="flex gap-2">
            <Button icon="pi pi-refresh" severity="secondary" @click="refreshData" />
            <Button icon="pi pi-download" label="Export" @click="exportToExcel" />
          </div>
        </div>
      </template>

      <template #content>
        <div class="ag-theme-alpine-dark h-96">
          <ag-grid-vue
            :columnDefs="columnDefs"
            :rowData="portfolioHoldings"
            :defaultColDef="defaultColDef"
            :gridOptions="gridOptions"
            @grid-ready="onGridReady"
          />
        </div>
      </template>
    </Card>
  </Motion>
</template>
```

**AG Grid Financial Configuration**:
```typescript
<script setup lang="ts">
import { AgGridVue } from 'ag-grid-vue3'
import { ref, computed } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import { Motion } from 'motion-v'

const gridApi = ref()

// Financial-specific column definitions
const columnDefs = computed(() => [
  {
    field: 'symbol',
    headerName: 'Symbol',
    pinned: 'left',
    cellClass: 'font-mono font-medium',
    width: 100
  },
  {
    field: 'name',
    headerName: 'Security Name',
    flex: 2,
    tooltipField: 'description'
  },
  {
    field: 'marketValue',
    headerName: 'Market Value',
    type: 'numericColumn',
    valueFormatter: params => formatCurrency(params.value),
    cellClass: 'font-mono text-right font-semibold',
    aggFunc: 'sum'
  },
  {
    field: 'dayChange',
    headerName: 'Day Change',
    type: 'numericColumn',
    cellRenderer: 'dayChangeRenderer',
    cellClass: params => params.value >= 0 ? 'text-green-600' : 'text-red-600'
  }
])

const exportToExcel = () => {
  gridApi.value?.exportDataAsExcel({
    fileName: `portfolio-holdings-${new Date().toISOString().split('T')[0]}.xlsx`
  })
}
</script>
```

### 1. App.vue - Main Application Controller

**Purpose**: Root component managing global state and application flow

**Composition API Structure**:
```typescript
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { useSelectionStore } from '@/stores/selection'
import { useAnswerStore } from '@/stores/answers'

// Global application state
const isSearchFocused = ref(false)
const searchValue = ref('')
const isSearchTransitioning = ref(false)

// Answer management
const isGeneratingAnswer = ref(false)
const loadingProgress = ref(0)
const loadingStage = ref('')
const estimatedTime = ref(0)

// Store integrations
const selectionStore = useSelectionStore()
const answerStore = useAnswerStore()

// Business logic implementation
const handleQuestionSubmit = async (question: string) => {
  // Implementation with loading states and error handling
}

const handleSelectionModeChange = (mode: 'accounts' | 'group') => {
  // Mutually exclusive selection logic
}
</script>
```

**Key Business Rules to Test**:
```typescript
// TDD Test Requirements
describe('App.vue', () => {
  describe('Account Selection Business Logic', () => {
    it('should clear group selection when switching to accounts mode')
    it('should clear account selections when switching to group mode')
    it('should prevent selecting both accounts and groups simultaneously')
    it('should ensure minimum one account is always selected')
    it('should auto-select first account if none selected in accounts mode')
    it('should auto-select first group when switching to group mode')
  })

  describe('Question Submission Flow', () => {
    it('should trigger search transition animation for first question')
    it('should show loading skeleton with progress tracking')
    it('should handle API success responses with content generation')
    it('should categorize and display different error types')
    it('should handle unmatched questions with smart fallbacks')
    it('should manage answer refresh with timestamp updates')
  })
})
```

### 2. SearchOverlay.vue - Advanced Search Interface

**Purpose**: Sophisticated search with category browsing and question configuration

**Template Structure**:
```vue
<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 bg-black/80">
      <div class="container mx-auto px-4 py-8">
        <div class="mx-auto max-w-4xl bg-background rounded-lg border">
          <!-- Search input with typing animation -->
          <div class="relative p-6 border-b">
            <input
              v-model="searchValue"
              :placeholder="currentPlaceholder"
              class="w-full bg-transparent text-lg"
              @input="handleSearchChange"
            />
          </div>

          <!-- Mode-based content rendering -->
          <div class="p-6">
            <OverviewMode v-if="mode === 'overview'" />
            <CategoryMode v-else-if="mode === 'category'" />
            <ConfigureMode v-else-if="mode === 'configure'" />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
```

**Composition Logic**:
```typescript
<script setup lang="ts">
interface Props {
  isOpen?: boolean
  searchValue?: string
}

interface Emits {
  (e: 'searchChange', value: string): void
  (e: 'categorySelect', category: string): void
  (e: 'questionSelect', question: string): void
  (e: 'close'): void
}

// Component state
const mode = ref<'overview' | 'category' | 'configure'>('overview')
const selectedCategory = ref<string | null>(null)
const selectedQuestion = ref<Question | null>(null)
const placeholderValues = ref<Record<string, string>>({})

// Interactive placeholder system
const detectPlaceholders = (text: string): PlaceholderInfo[] => {
  // Regex to find {placeholder} patterns
}

const handlePlaceholderEdit = (questionId: string, placeholderId: string) => {
  // Open dropdown for placeholder editing
}
</script>
```

**TDD Requirements**:
```typescript
describe('SearchOverlay.vue', () => {
  describe('Interactive Placeholders', () => {
    it('should detect placeholders in question text')
    it('should render placeholder buttons with correct styling')
    it('should open dropdown when placeholder is clicked')
    it('should update placeholder values on selection')
    it('should replace placeholders with selected values before submission')
  })

  describe('Responsive Behavior', () => {
    it('should use different placeholder text sets based on screen size')
    it('should render desktop dropdown interface on larger screens')
    it('should render mobile dialog interface on smaller screens')
  })
})
```

### 3. TopNavigation.vue - Header with Account Selection

**Purpose**: Navigation header with search, account selection, and theme controls

**Template**:
```vue
<template>
  <header class="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
    <div class="container mx-auto px-4 h-16 flex items-center justify-between">
      <!-- Logo and brand -->
      <div class="flex items-center space-x-4">
        <h1 class="text-xl font-semibold">FinSight</h1>
      </div>

      <!-- Search input -->
      <div v-if="!hideSearch" class="flex-1 max-w-md mx-8">
        <div class="relative">
          <input
            v-model="searchValue"
            :placeholder="typingPlaceholder"
            class="w-full px-3 py-2 bg-muted rounded-md"
            @focus="handleSearchFocus"
            @blur="handleSearchBlur"
          />
          <kbd class="hidden md:inline-flex absolute right-2 top-2 text-xs">⌘K</kbd>
        </div>
      </div>

      <!-- Account selector and controls -->
      <div class="flex items-center space-x-2">
        <AccountSelector />
        <TimeframeSelector />
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>
```

**Account Selection Logic**:
```typescript
<script setup lang="ts">
// Pending state management for UX
const pendingSelectionMode = ref<'accounts' | 'group'>('accounts')
const pendingSelectedAccountIds = ref<Set<string>>(new Set())
const pendingSelectedGroupId = ref<string | null>(null)
const hasUnappliedChanges = ref(false)

const applyChanges = () => {
  selectionStore.updateSelection({
    selectionMode: pendingSelectionMode.value,
    selectedAccountIds: pendingSelectedAccountIds.value,
    selectedGroupId: pendingSelectedGroupId.value
  })
  hasUnappliedChanges.value = false
}

const cancelChanges = () => {
  // Reset to current store values
  hasUnappliedChanges.value = false
}
</script>
```

### 4. AnswerCard.vue - Rich Answer Display

**Purpose**: Complex financial data presentation with multiple layouts

**Template Structure**:
```vue
<template>
  <article class="bg-card rounded-lg border p-6 space-y-6">
    <!-- Question context header -->
    <header class="space-y-2">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-medium">{{ question }}</h2>
        <button v-if="!isError" @click="handleRefresh" class="p-2">
          <ArrowPathIcon class="h-4 w-4" />
        </button>
      </div>

      <div class="flex items-center space-x-4 text-sm text-muted-foreground">
        <span>{{ asOfDate }}</span>
        <span>{{ accountsDisplay }}</span>
        <span>{{ timeframe }}</span>
      </div>
    </header>

    <!-- Dynamic content layout -->
    <main>
      <ErrorState v-if="isError" :error-type="errorType" />
      <UnmatchedState v-else-if="isUnmatched" :fallback-type="content?.fallbackType" />
      <LoadingSkeleton v-else-if="isRefreshing" />
      <SpecializedContent v-else :content="content" :layout="detectedLayout" />
    </main>

    <!-- Footer with actions -->
    <footer v-if="!isError && !isUnmatched" class="space-y-4">
      <FollowUpChips :questions="followUpQuestions" @question-click="$emit('questionSubmit', $event)" />
      <FeedbackSystem :answer-id="id" />
    </footer>
  </article>
</template>
```

**Layout Detection Logic**:
```typescript
<script setup lang="ts">
const detectedLayout = computed(() => {
  if (!content) return 'generic'

  const { kpis, chartData, tableData, highlights, metrics } = content

  // Performance Analysis Layout
  if (kpis && chartData && highlights && !tableData) {
    return 'performance'
  }

  // Risk Analysis Layout
  if (kpis && metrics && !tableData && !chartData) {
    return 'risk'
  }

  // Holdings Analysis Layout
  if (kpis && tableData && highlights && !chartData) {
    return 'holdings'
  }

  // Allocation Analysis Layout
  if (kpis && chartData && tableData) {
    return 'allocation'
  }

  return 'generic'
})
</script>
```

**TDD Requirements**:
```typescript
describe('AnswerCard.vue', () => {
  describe('Content Layout Detection', () => {
    it('should render performance layout for performance data')
    it('should render risk layout for risk data')
    it('should render holdings layout for holdings data')
    it('should render allocation layout for allocation data')
    it('should render generic layout for mixed/unknown data')
  })

  describe('Interactive Placeholders', () => {
    it('should detect placeholders in question text')
    it('should track placeholder modifications')
    it('should show submit button when placeholders are modified')
  })

  describe('Feedback System', () => {
    it('should render feedback buttons for matched answers')
    it('should require reason selection for negative feedback')
    it('should submit feedback to API with proper schema')
    it('should prevent multiple feedback submissions')
  })
})
```

### 5. FinancialChart.vue - Data Visualization

**Purpose**: Professional financial charts using Highcharts with Vue 3

**Template**:
```vue
<template>
  <div class="financial-chart w-full h-64 md:h-80">
    <Motion
      :initial="{ opacity: 0, scale: 0.95 }"
      :animate="{ opacity: 1, scale: 1 }"
      :transition="{ duration: 0.6, ease: 'easeOut' }"
    >
      <highcharts
        :options="chartOptions"
        :callback="chartCallback"
        ref="chart"
        class="w-full h-full"
      />
    </Motion>
  </div>
</template>
```

**Professional Financial Chart Configuration**:
```typescript
<script setup lang="ts">
import { computed, ref } from 'vue'
import Highcharts from 'highcharts/es-modules/Core/Globals.js'
import LineSeries from 'highcharts/es-modules/Series/Line/LineSeries.js'
import ColumnSeries from 'highcharts/es-modules/Series/Column/ColumnSeries.js'
import { Motion } from 'motion-v'

// Register only needed Highcharts components (tree-shaking)
LineSeries.compose(Highcharts)
ColumnSeries.compose(Highcharts)

interface Props {
  data?: ChartDataPoint[]
  type?: 'line' | 'bar' | 'area'
}

interface ChartDataPoint {
  month: string
  portfolio: number
  benchmark: number
}

const chartOption = computed(() => ({
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  tooltip: {
    trigger: 'axis',
    formatter: (params: any) => {
      // Custom financial formatting
      return params.map((param: any) =>
        `${param.seriesName}: ${formatCurrency(param.value)}`
      ).join('<br/>')
    }
  },
  legend: {
    data: ['Portfolio', 'Benchmark']
  },
  xAxis: {
    type: 'category',
    data: props.data?.map(d => d.month) || []
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: (value: number) => formatCurrency(value)
    }
  },
  series: [
    {
      name: 'Portfolio',
      type: props.type || 'line',
      data: props.data?.map(d => d.portfolio) || [],
      itemStyle: { color: 'hsl(var(--chart-1))' }
    },
    {
      name: 'Benchmark',
      type: props.type || 'line',
      data: props.data?.map(d => d.benchmark) || [],
      itemStyle: { color: 'hsl(var(--chart-2))' }
    }
  ]
}))
</script>
```

## 🏪 State Management Requirements (Pinia)

### Selection Store
```typescript
// stores/selection.ts
import { defineStore } from 'pinia'

interface SelectionState {
  selectionMode: 'accounts' | 'group'
  selectedAccountIds: Set<string>
  selectedGroupId: string | null
  timeframe: string
}

export const useSelectionStore = defineStore('selection', () => {
  const state = ref<SelectionState>({
    selectionMode: 'accounts',
    selectedAccountIds: new Set(['ACC001', 'ACC002']),
    selectedGroupId: null,
    timeframe: 'ytd'
  })

  // Computed values
  const selectedAccounts = computed(() => {
    if (state.value.selectionMode === 'accounts') {
      return accounts.value.filter(acc =>
        state.value.selectedAccountIds.has(acc.id)
      )
    } else if (state.value.selectedGroupId) {
      const group = accountGroups.value.find(g =>
        g.id === state.value.selectedGroupId
      )
      return accounts.value.filter(acc =>
        group?.accountIds.includes(acc.id)
      )
    }
    return []
  })

  // Actions with business rule enforcement
  const setSelectionMode = (mode: 'accounts' | 'group') => {
    if (mode === 'accounts') {
      state.value.selectedGroupId = null
      if (state.value.selectedAccountIds.size === 0) {
        state.value.selectedAccountIds.add('ACC001') // Auto-select first
      }
    } else {
      state.value.selectedAccountIds.clear()
      state.value.selectedGroupId = accountGroups.value[0]?.id || null
    }
    state.value.selectionMode = mode
  }

  const updateSelection = (updates: Partial<SelectionState>) => {
    Object.assign(state.value, updates)
  }

  return {
    // State
    ...toRefs(state.value),

    // Computed
    selectedAccounts,

    // Actions
    setSelectionMode,
    updateSelection
  }
})
```

### Answer Store
```typescript
// stores/answers.ts
import { defineStore } from 'pinia'

interface Answer {
  id: string
  question: string
  asOfDate: string
  accounts: string[]
  timeframe: string
  content?: AnswerContent
  isUnmatched?: boolean
  isError?: boolean
  errorType?: 'network' | 'server' | 'timeout' | 'unknown'
  timestamp: Date
}

export const useAnswerStore = defineStore('answers', () => {
  const answers = ref<Answer[]>([])
  const newAnswerId = ref<string | null>(null)

  const addAnswer = (answer: Answer) => {
    answers.value.unshift(answer) // Add to beginning
    newAnswerId.value = answer.id

    // Clear highlight after 3 seconds
    setTimeout(() => {
      if (newAnswerId.value === answer.id) {
        newAnswerId.value = null
      }
    }, 3000)
  }

  const updateAnswer = (id: string, updates: Partial<Answer>) => {
    const index = answers.value.findIndex(a => a.id === id)
    if (index !== -1) {
      answers.value[index] = { ...answers.value[index], ...updates }
    }
  }

  const refreshAnswer = async (id: string) => {
    const answer = answers.value.find(a => a.id === id)
    if (!answer) return

    // Set refreshing state
    updateAnswer(id, { isRefreshing: true })

    try {
      // Re-submit question
      const refreshedAnswer = await apiService.submitQuestion({
        question: answer.question,
        accounts: answer.accounts,
        timeframe: answer.timeframe
      })

      updateAnswer(id, {
        ...refreshedAnswer,
        timestamp: new Date(),
        isRefreshing: false
      })
    } catch (error) {
      updateAnswer(id, {
        isError: true,
        errorType: 'network',
        isRefreshing: false
      })
    }
  }

  return {
    answers: readonly(answers),
    newAnswerId: readonly(newAnswerId),
    addAnswer,
    updateAnswer,
    refreshAnswer
  }
})
```

## 🎮 Composables Requirements

### usePortfolioSummary
```typescript
// composables/usePortfolioSummary.ts
import { useQuery } from '@tanstack/vue-query'

export const usePortfolioSummary = (
  selectedAccounts: Ref<Account[]>,
  timeframe: Ref<string> = ref('ytd')
) => {
  const accountIds = computed(() =>
    selectedAccounts.value.map(acc => acc.id).sort().join(',')
  )

  return useQuery({
    queryKey: ['portfolioSummary', accountIds, timeframe],
    queryFn: () => calculatePortfolioMetrics(selectedAccounts.value),
    enabled: computed(() => selectedAccounts.value.length > 0),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  })
}

const calculatePortfolioMetrics = (accounts: Account[]) => {
  const totalAUM = accounts.reduce((sum, acc) => sum + acc.balance, 0)

  // Weighted YTD return calculation
  const weightedReturn = accounts.reduce((sum, acc) => {
    const weight = acc.balance / totalAUM
    return sum + (acc.ytdReturn * weight)
  }, 0)

  // Sharpe ratio calculation (simplified)
  const riskFreeRate = 0.025 // 2.5%
  const portfolioStdDev = 0.12 // 12% (would be calculated from historical data)
  const sharpeRatio = (weightedReturn - riskFreeRate) / portfolioStdDev

  return {
    totalAUM,
    ytdReturn: weightedReturn,
    sharpeRatio,
    accountCount: accounts.length
  }
}
```

### useTypingAnimation
```typescript
// composables/useTypingAnimation.ts
import { useBreakpoints } from '@vueuse/core'

interface UseTypingAnimationOptions {
  questions: string[]
  isActive: Ref<boolean>
  typingSpeed?: number
  erasingSpeed?: number
  pauseDuration?: number
  mobileQuestions?: string[]
  tabletQuestions?: string[]
}

export const useTypingAnimation = (options: UseTypingAnimationOptions) => {
  const {
    questions,
    isActive,
    typingSpeed = 50,
    erasingSpeed = 30,
    pauseDuration = 2000,
    mobileQuestions = [],
    tabletQuestions = []
  } = options

  const currentText = ref('')
  const currentQuestionIndex = ref(0)
  const isTyping = ref(true)

  const breakpoints = useBreakpoints({
    mobile: 768,
    tablet: 1024
  })

  const currentQuestions = computed(() => {
    if (breakpoints.smaller('mobile').value && mobileQuestions.length > 0) {
      return mobileQuestions
    } else if (breakpoints.smaller('tablet').value && tabletQuestions.length > 0) {
      return tabletQuestions
    }
    return questions
  })

  let timeoutId: number | null = null
  let currentCharIndex = 0

  const typeText = () => {
    if (!isActive.value) {
      currentText.value = ''
      return
    }

    const targetText = currentQuestions.value[currentQuestionIndex.value]

    if (isTyping.value) {
      if (currentCharIndex <= targetText.length) {
        currentText.value = targetText.slice(0, currentCharIndex)
        currentCharIndex++
        timeoutId = setTimeout(typeText, typingSpeed + Math.random() * 20) // Natural variation
      } else {
        // Pause before erasing
        timeoutId = setTimeout(() => {
          isTyping.value = false
          typeText()
        }, pauseDuration)
      }
    } else {
      if (currentCharIndex > 0) {
        currentCharIndex--
        currentText.value = targetText.slice(0, currentCharIndex)
        timeoutId = setTimeout(typeText, erasingSpeed)
      } else {
        // Move to next question
        currentQuestionIndex.value = (currentQuestionIndex.value + 1) % currentQuestions.value.length
        isTyping.value = true
        typeText()
      }
    }
  }

  watch(isActive, (newValue) => {
    if (newValue) {
      typeText()
    } else {
      if (timeoutId) clearTimeout(timeoutId)
      currentText.value = ''
    }
  })

  watch(currentQuestions, () => {
    // Reset animation when question set changes
    currentQuestionIndex.value = 0
    currentCharIndex = 0
    isTyping.value = true
    if (isActive.value) typeText()
  })

  onUnmounted(() => {
    if (timeoutId) clearTimeout(timeoutId)
  })

  return {
    currentText: readonly(currentText),
    currentQuestionIndex: readonly(currentQuestionIndex)
  }
}
```

## 🧪 TDD Testing Strategy

### Test Architecture
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],

    // Financial app specific test configuration
    testTimeout: 10000, // Financial calculations might take longer
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        'dist/',
        'coverage/'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

### Test Setup
```typescript
// tests/setup.ts
import { config } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import PrimeVue from 'primevue/config'
import { Motion } from 'motion-v'

// Global test configuration
config.global.plugins = [
  createPinia(),
  [VueQueryPlugin, { queryClient: new QueryClient({
    defaultOptions: {
      queries: { retry: false, cacheTime: 0 },
      mutations: { retry: false }
    }
  })}],
  [PrimeVue, {
    // Disable ripple effects in tests
    ripple: false
  }]
]

// Global component stubs for testing
config.global.stubs = {
  Motion: true,
  Transition: false,
  TransitionGroup: false
}

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})
```

### Component Test Examples

#### App.vue Tests
```typescript
// tests/unit/App.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import App from '@/App.vue'
import { useSelectionStore } from '@/stores/selection'

describe('App.vue', () => {
  let wrapper: VueWrapper
  let selectionStore: ReturnType<typeof useSelectionStore>

  beforeEach(() => {
    wrapper = mount(App, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })]
      }
    })
    selectionStore = useSelectionStore()
  })

  describe('Account Selection Business Logic', () => {
    it('should clear group selection when switching to accounts mode', async () => {
      // Setup: Start with group mode
      selectionStore.selectionMode = 'group'
      selectionStore.selectedGroupId = 'GROUP001'

      // Action: Switch to accounts mode
      await wrapper.vm.handleSelectionModeChange('accounts')

      // Assert: Group selection cleared
      expect(selectionStore.selectedGroupId).toBeNull()
      expect(selectionStore.selectionMode).toBe('accounts')
    })

    it('should clear account selections when switching to group mode', async () => {
      // Setup: Start with accounts selected
      selectionStore.selectedAccountIds = new Set(['ACC001', 'ACC002'])

      // Action: Switch to group mode
      await wrapper.vm.handleSelectionModeChange('group')

      // Assert: Account selections cleared, first group selected
      expect(selectionStore.selectedAccountIds.size).toBe(0)
      expect(selectionStore.selectedGroupId).toBeTruthy()
      expect(selectionStore.selectionMode).toBe('group')
    })

    it('should ensure minimum one account is always selected', async () => {
      // Setup: Clear all selections
      selectionStore.selectedAccountIds.clear()
      selectionStore.selectedGroupId = null

      // Action: Switch to accounts mode
      await wrapper.vm.handleSelectionModeChange('accounts')

      // Assert: At least one account auto-selected
      expect(selectionStore.selectedAccountIds.size).toBeGreaterThan(0)
    })
  })

  describe('Question Submission Flow', () => {
    it('should trigger search transition animation for first question', async () => {
      // Setup: No existing answers
      expect(wrapper.vm.answers).toHaveLength(0)

      // Action: Submit first question
      await wrapper.vm.handleQuestionSubmit('What is my YTD performance?')

      // Assert: Search transition triggered
      expect(wrapper.vm.isSearchTransitioning).toBe(true)
    })

    it('should show loading skeleton with progress tracking', async () => {
      // Action: Submit question
      const questionPromise = wrapper.vm.handleQuestionSubmit('Test question')

      // Assert: Loading state active
      expect(wrapper.vm.isGeneratingAnswer).toBe(true)
      expect(wrapper.find('[data-testid="answer-card-skeleton"]').exists()).toBe(true)

      await questionPromise
    })

    it('should handle API success responses with content generation', async () => {
      // Mock successful API response
      const mockResponse = {
        status: 'matched',
        answer: {
          content: {
            paragraph: 'Your portfolio performed well...',
            kpis: [{ label: 'YTD Return', value: '12.5%' }]
          }
        }
      }

      vi.mocked(apiService.submitQuestion).mockResolvedValue(mockResponse)

      // Action: Submit question
      await wrapper.vm.handleQuestionSubmit('Test question')

      // Assert: Answer added to store
      const answerStore = useAnswerStore()
      expect(answerStore.answers).toHaveLength(1)
      expect(answerStore.answers[0].content.paragraph).toBe('Your portfolio performed well...')
    })
  })
})
```

#### PrimeVue Component Tests
```typescript
// tests/unit/PortfolioDataGrid.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PortfolioDataGrid from '@/components/PortfolioDataGrid.vue'
import Card from 'primevue/card'
import Button from 'primevue/button'

describe('PortfolioDataGrid.vue', () => {
  const mockHoldings = [
    { symbol: 'AAPL', name: 'Apple Inc.', marketValue: 50000, dayChange: 2.5 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', marketValue: 45000, dayChange: -1.2 }
  ]

  beforeEach(() => {
    // Mock AG Grid API
    global.agGrid = {
      createGrid: vi.fn(),
      exportDataAsExcel: vi.fn()
    }
  })

  it('should render portfolio holdings correctly', async () => {
    const wrapper = mount(PortfolioDataGrid, {
      props: { portfolioHoldings: mockHoldings },
      global: {
        components: { Card, Button }
      }
    })

    expect(wrapper.find('[data-testid="portfolio-grid"]').exists()).toBe(true)
    expect(wrapper.findComponent(Card).exists()).toBe(true)
  })

  it('should handle Excel export', async () => {
    const wrapper = mount(PortfolioDataGrid, {
      props: { portfolioHoldings: mockHoldings }
    })

    const exportButton = wrapper.find('[data-testid="export-button"]')
    await exportButton.trigger('click')

    expect(wrapper.emitted('export')).toBeTruthy()
  })

  it('should format currency values correctly', () => {
    const wrapper = mount(PortfolioDataGrid, {
      props: { portfolioHoldings: mockHoldings }
    })

    const formatCurrency = wrapper.vm.formatCurrency
    expect(formatCurrency(50000)).toBe('$50,000')
    expect(formatCurrency(1234.56)).toBe('$1,235')
  })
})
```

#### SearchOverlay.vue Tests
```typescript
// tests/unit/SearchOverlay.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchOverlay from '@/components/SearchOverlay.vue'

describe('SearchOverlay.vue', () => {
  describe('Interactive Placeholders', () => {
    it('should detect placeholders in question text', () => {
      const question = 'What is my {timeframe} performance vs {benchmark}?'
      const placeholders = wrapper.vm.detectPlaceholders(question)

      expect(placeholders).toHaveLength(2)
      expect(placeholders[0].key).toBe('timeframe')
      expect(placeholders[1].key).toBe('benchmark')
    })

    it('should render placeholder buttons with correct styling', async () => {
      const question = 'Show me {sector} allocation'
      await wrapper.setProps({ question })

      const placeholderButton = wrapper.find('[data-testid="placeholder-sector"]')
      expect(placeholderButton.exists()).toBe(true)
      expect(placeholderButton.classes()).toContain('bg-primary/20')
    })

    it('should open dropdown when placeholder is clicked', async () => {
      const placeholderButton = wrapper.find('[data-testid="placeholder-timeframe"]')
      await placeholderButton.trigger('click')

      const dropdown = wrapper.find('[data-testid="placeholder-dropdown"]')
      expect(dropdown.exists()).toBe(true)
      expect(dropdown.isVisible()).toBe(true)
    })

    it('should update placeholder values on selection', async () => {
      // Open dropdown
      await wrapper.find('[data-testid="placeholder-timeframe"]').trigger('click')

      // Select option
      await wrapper.find('[data-testid="option-ytd"]').trigger('click')

      // Assert value updated
      expect(wrapper.vm.placeholderValues.timeframe).toBe('YTD')
    })

    it('should replace placeholders with selected values before submission', async () => {
      // Setup placeholder values
      wrapper.vm.placeholderValues = {
        timeframe: 'YTD',
        benchmark: 'S&P 500'
      }

      const originalQuestion = 'What is my {timeframe} performance vs {benchmark}?'
      const finalQuestion = wrapper.vm.replacePlaceholders(originalQuestion)

      expect(finalQuestion).toBe('What is my YTD performance vs S&P 500?')
    })
  })

  describe('Responsive Behavior', () => {
    it('should use mobile questions on small screens', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375 })
      window.dispatchEvent(new Event('resize'))

      await nextTick()

      const questions = wrapper.vm.currentQuestions
      expect(questions).toEqual(expect.arrayContaining(['YTD return?', 'Risk level?']))
    })

    it('should render mobile dialog interface on smaller screens', async () => {
      // Set mobile viewport
      wrapper.vm.isMobile = true
      await nextTick()

      const dialog = wrapper.find('[data-testid="mobile-dialog"]')
      const dropdown = wrapper.find('[data-testid="desktop-dropdown"]')

      expect(dialog.exists()).toBe(true)
      expect(dropdown.exists()).toBe(false)
    })
  })
})
```

### Integration Test Examples
```typescript
// tests/integration/question-flow.spec.ts
describe('Complete Question Submission Flow', () => {
  it('should complete full question submission flow', async () => {
    // 1. Setup: Mount app with mock providers
    const wrapper = mount(App, {
      global: {
        plugins: [createTestingPinia(), VueQueryPlugin]
      }
    })

    // 2. Account Selection: Change account selection
    const accountSelector = wrapper.find('[data-testid="account-selector"]')
    await accountSelector.trigger('click')

    const accountOption = wrapper.find('[data-testid="account-ACC001"]')
    await accountOption.trigger('click')

    const applyButton = wrapper.find('[data-testid="apply-selection"]')
    await applyButton.trigger('click')

    // 3. Search: Open search overlay
    const searchInput = wrapper.find('[data-testid="search-input"]')
    await searchInput.trigger('focus')

    expect(wrapper.find('[data-testid="search-overlay"]').exists()).toBe(true)

    // 4. Question Selection: Select a question
    const questionButton = wrapper.find('[data-testid="question-ytd-performance"]')
    await questionButton.trigger('click')

    // 5. Loading: Verify loading state
    expect(wrapper.find('[data-testid="answer-card-skeleton"]').exists()).toBe(true)

    // 6. Results: Wait for answer to appear
    await waitFor(() => {
      expect(wrapper.find('[data-testid="answer-card"]').exists()).toBe(true)
    })

    // 7. Verification: Check answer content
    expect(wrapper.find('[data-testid="kpi-ytd-return"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="financial-chart"]').exists()).toBe(true)
  })
})
```

### Mock Service Worker Setup
```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  // Question submission endpoint
  http.post('/api/questions', async ({ request }) => {
    const body = await request.json()

    // Simulate different response scenarios
    if (body.question.includes('error')) {
      return HttpResponse.json(
        { error: 'Server error' },
        { status: 500 }
      )
    }

    if (body.question.includes('unmatched')) {
      return HttpResponse.json({
        status: 'no_match',
        message: 'No matching answer found',
        fallbackType: 'portfolio'
      })
    }

    // Default successful response
    return HttpResponse.json({
      status: 'matched',
      confidence: 'high',
      answer: {
        id: crypto.randomUUID(),
        content: {
          paragraph: 'Your portfolio has performed well this year...',
          kpis: [
            { label: 'YTD Return', value: '12.5%', change: '+2.3%', isPositive: true },
            { label: 'Total Value', value: '$1,234,567', change: '+$45,678', isPositive: true }
          ],
          chartData: [
            { month: 'Jan', portfolio: 1200000, benchmark: 1150000 },
            { month: 'Feb', portfolio: 1180000, benchmark: 1160000 },
            { month: 'Mar', portfolio: 1234567, benchmark: 1200000 }
          ]
        },
        followUpQuestions: [
          'How does this compare to last year?',
          'What drove the performance?',
          'Should I rebalance?'
        ]
      }
    })
  }),

  // Portfolio summary endpoint
  http.get('/api/portfolio/summary', ({ request }) => {
    const url = new URL(request.url)
    const accounts = url.searchParams.get('accounts')
    const timeframe = url.searchParams.get('timeframe')

    return HttpResponse.json({
      totalAUM: 1234567,
      ytdReturn: 0.125,
      sharpeRatio: 1.85,
      accountCount: accounts?.split(',').length || 1
    })
  }),

  // Feedback submission endpoint
  http.post('/api/feedback', async ({ request }) => {
    const body = await request.json()

    return HttpResponse.json({
      success: true,
      feedbackId: crypto.randomUUID()
    })
  })
]
```

## 📱 Responsive Implementation Guidelines

### Mobile-First Approach
```scss
// Base styles (mobile)
.search-overlay {
  @apply fixed inset-0 z-50 bg-black/80;

  .container {
    @apply px-4 py-8;
  }

  .search-content {
    @apply w-full bg-background rounded-lg;
  }
}

// Tablet adaptations
@media (min-width: 768px) {
  .search-overlay {
    .container {
      @apply px-6 py-12;
    }

    .search-content {
      @apply max-w-2xl mx-auto;
    }
  }
}

// Desktop optimizations
@media (min-width: 1024px) {
  .search-overlay {
    .search-content {
      @apply max-w-4xl;
    }
  }
}
```

### Touch Optimization
```vue
<template>
  <!-- Mobile-optimized button sizes -->
  <button
    class="min-h-[44px] min-w-[44px] md:min-h-[36px] md:min-w-[36px]"
    :class="touchOptimizedClasses"
  >
    <!-- Button content -->
  </button>
</template>

<script setup lang="ts">
const touchOptimizedClasses = computed(() => ({
  'px-4 py-3 md:px-3 md:py-2': true, // Larger padding on mobile
  'text-base md:text-sm': true,      // Larger text on mobile
  'space-y-2 md:space-y-1': true    // More spacing on mobile
}))
</script>
```

### Keyboard Navigation
```vue
<script setup lang="ts">
import { onKeyStroke } from '@vueuse/core'

// Global keyboard shortcuts
onKeyStroke(['Meta+k', 'Control+k'], (e) => {
  e.preventDefault()
  openSearchOverlay()
})

onKeyStroke('Escape', () => {
  closeSearchOverlay()
})

// Component-specific navigation
const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      navigateDown()
      break
    case 'ArrowUp':
      event.preventDefault()
      navigateUp()
      break
    case 'Enter':
      event.preventDefault()
      selectCurrentItem()
      break
  }
}
</script>
```

## 🚀 Performance Requirements

### Bundle Size Targets
- **Initial Bundle**: < 150KB gzipped
- **Lazy-loaded Routes**: < 50KB each
- **Component Chunks**: < 25KB each

### Loading Performance
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s

### Implementation Strategies
```typescript
// Lazy loading for route components
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/views/Dashboard.vue')
    },
    {
      path: '/settings',
      component: () => import('@/views/Settings.vue')
    }
  ]
})

// Component lazy loading
const AdvancedChart = defineAsyncComponent({
  loader: () => import('@/components/AdvancedChart.vue'),
  loadingComponent: ChartSkeleton,
  errorComponent: ChartError,
  delay: 200,
  timeout: 3000
})

// Virtual scrolling for large lists
import { RecycleScroller } from 'vue-virtual-scroller'

const LargeAnswerList = () => (
  <RecycleScroller
    class="scroller"
    items={answers.value}
    item-size={120}
    key-field="id"
    v-slots={{
      default: ({ item }) => <AnswerCard answer={item} />
    }}
  />
)
```

## 🔒 Security Requirements

### Input Validation
```typescript
// Zod schemas for API validation
import { z } from 'zod'

export const QuestionSchema = z.object({
  question: z.string().min(1).max(500),
  accounts: z.array(z.string().uuid()),
  timeframe: z.enum(['mtd', '1m', '3m', '6m', 'ytd', '1y', '2y', '5y']),
  placeholders: z.record(z.string()).optional()
})

export const FeedbackSchema = z.object({
  answerId: z.string().uuid(),
  rating: z.enum(['positive', 'negative']),
  reason: z.enum([
    'incorrect_data',
    'outdated_information',
    'not_relevant',
    'wrong_timeframe',
    'unclear_results'
  ]).optional(),
  comment: z.string().max(1000).optional()
})

// Runtime validation in composables
export const useQuestionSubmission = () => {
  const submitQuestion = async (data: unknown) => {
    const validatedData = QuestionSchema.parse(data)
    return apiService.submitQuestion(validatedData)
  }

  return { submitQuestion }
}
```

### XSS Prevention
```vue
<template>
  <!-- Safe text rendering -->
  <p>{{ userInput }}</p>

  <!-- Sanitized HTML (only when necessary) -->
  <div v-html="sanitizeHtml(htmlContent)"></div>
</template>

<script setup lang="ts">
import DOMPurify from 'dompurify'

const sanitizeHtml = (html: string) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em'],
    ALLOWED_ATTR: []
  })
}
</script>
```

## 🎨 Accessibility Requirements

### ARIA Implementation
```vue
<template>
  <div
    role="combobox"
    :aria-expanded="isOpen"
    aria-haspopup="listbox"
    :aria-describedby="descriptionId"
  >
    <input
      ref="searchInput"
      v-model="searchValue"
      role="searchbox"
      :aria-label="searchLabel"
      :aria-controls="listboxId"
      @keydown="handleKeyDown"
    />

    <ul
      v-if="isOpen"
      :id="listboxId"
      role="listbox"
      :aria-label="listboxLabel"
    >
      <li
        v-for="(item, index) in filteredItems"
        :key="item.id"
        role="option"
        :aria-selected="index === selectedIndex"
        :class="optionClasses(index)"
        @click="selectItem(item)"
      >
        {{ item.text }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const searchLabel = computed(() =>
  `Search ${filteredItems.value.length} available questions`
)

const listboxLabel = computed(() =>
  `Question suggestions, ${filteredItems.value.length} results available`
)
</script>
```

### Keyboard Navigation
```typescript
// Comprehensive keyboard navigation
const handleKeyDown = (event: KeyboardEvent) => {
  const { key, ctrlKey, metaKey } = event

  // Global shortcuts
  if ((ctrlKey || metaKey) && key === 'k') {
    event.preventDefault()
    openSearch()
    return
  }

  if (key === 'Escape') {
    event.preventDefault()
    if (isSearchOpen.value) {
      closeSearch()
    } else {
      blur()
    }
    return
  }

  // List navigation
  if (isListMode.value) {
    switch (key) {
      case 'ArrowDown':
        event.preventDefault()
        selectedIndex.value = Math.min(
          selectedIndex.value + 1,
          items.value.length - 1
        )
        scrollIntoView()
        break

      case 'ArrowUp':
        event.preventDefault()
        selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
        scrollIntoView()
        break

      case 'Enter':
        event.preventDefault()
        if (selectedIndex.value >= 0) {
          selectItem(items.value[selectedIndex.value])
        }
        break

      case 'Home':
        event.preventDefault()
        selectedIndex.value = 0
        scrollIntoView()
        break

      case 'End':
        event.preventDefault()
        selectedIndex.value = items.value.length - 1
        scrollIntoView()
        break
    }
  }
}

const scrollIntoView = () => {
  nextTick(() => {
    const selectedElement = document.querySelector('[aria-selected="true"]')
    selectedElement?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth'
    })
  })
}
```

### Focus Management
```typescript
// Focus trap for modals
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'

export const useModalFocus = (containerRef: Ref<HTMLElement | undefined>) => {
  const { activate, deactivate } = useFocusTrap(containerRef, {
    immediate: false,
    escapeDeactivates: true,
    returnFocusOnDeactivate: true
  })

  const openModal = () => {
    activate()
  }

  const closeModal = () => {
    deactivate()
  }

  return { openModal, closeModal }
}
```

### Vitest Testing Utilities for Financial Apps

```typescript
// tests/utils/financial-test-utils.ts
import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import PrimeVue from 'primevue/config'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'

// Financial data test factories
export const createMockAccount = (overrides = {}) => ({
  id: `ACC${Math.random().toString(36).substring(2, 9)}`,
  accountNumber: Math.floor(Math.random() * 100000).toString(),
  name: 'Test Account',
  balance: Math.floor(Math.random() * 1000000),
  ytdReturn: (Math.random() - 0.5) * 0.4,
  type: 'Individual',
  color: 'bg-chart-1',
  ...overrides
})

export const createMockKPI = (overrides = {}) => ({
  label: 'Test KPI',
  value: '$123,456',
  change: '+2.3%',
  isPositive: true,
  ...overrides
})

export const createMockChartData = (points = 6) =>
  Array.from({ length: points }, (_, i) => ({
    month: new Date(2025, i, 1).toLocaleDateString('en-US', { month: 'short' }),
    portfolio: 100000 + Math.random() * 50000,
    benchmark: 100000 + Math.random() * 45000
  }))

// Enhanced mount helper for FinSight components
export const mountWithFinSightProviders = (component: any, options = {}) => {
  return mount(component, {
    global: {
      plugins: [
        createTestingPinia({ createSpy: vi.fn }),
        [VueQueryPlugin, {
          queryClient: new QueryClient({
            defaultOptions: {
              queries: { retry: false, gcTime: 0 },
              mutations: { retry: false }
            }
          })
        }],
        [PrimeVue, { ripple: false }]
      ],
      stubs: {
        Motion: true,
        AgGridVue: true,
        Highcharts: true,
        ...options.stubs
      },
      ...options.global
    },
    ...options
  })
}

// Financial calculation assertion helpers
export const expectCurrencyValue = (actual: string, expected: number) => {
  const cleaned = actual.replace(/[$,]/g, '')
  expect(parseFloat(cleaned)).toBeCloseTo(expected, 2)
}

export const expectPercentageValue = (actual: string, expected: number) => {
  const cleaned = actual.replace('%', '')
  expect(parseFloat(cleaned)).toBeCloseTo(expected, 2)
}

// Mock API responses for testing
export const mockApiResponses = {
  portfolioSummary: {
    totalAUM: 1234567,
    ytdReturn: 0.125,
    sharpeRatio: 1.85,
    accountCount: 3
  },

  questionResponse: {
    status: 'matched',
    confidence: 'high',
    answer: {
      id: 'test-answer-id',
      content: {
        paragraph: 'Test portfolio analysis...',
        kpis: [createMockKPI()],
        chartData: createMockChartData()
      }
    }
  }
}
```

### Package.json Test Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch",
    "test:financial": "vitest run tests/financial/",
    "test:components": "vitest run tests/components/",
    "test:e2e": "playwright test"
  }
}
```

## 📊 Data Layer Requirements

### API Service Structure
```typescript
// services/api.ts
interface ApiClient {
  submitQuestion(data: QuestionRequest): Promise<QuestionResponse>
  getAccountSummary(accountIds: string[]): Promise<PortfolioSummary>
  submitFeedback(feedback: FeedbackRequest): Promise<FeedbackResponse>
  getReviewQuestions(): Promise<ReviewQuestion[]>
}

class ApiService implements ApiClient {
  private baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

  async submitQuestion(data: QuestionRequest): Promise<QuestionResponse> {
    const response = await fetch(`${this.baseURL}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new ApiError(response.status, await response.text())
    }

    return response.json()
  }

  async getAccountSummary(accountIds: string[]): Promise<PortfolioSummary> {
    const params = new URLSearchParams({
      accounts: accountIds.join(',')
    })

    const response = await fetch(`${this.baseURL}/portfolio/summary?${params}`)

    if (!response.ok) {
      throw new ApiError(response.status, await response.text())
    }

    return response.json()
  }
}

export const apiService = new ApiService()
```

### TypeScript Interfaces
```typescript
// types/index.ts
export interface Account {
  id: string
  accountNumber: string
  name: string
  alias?: string
  type: 'Trust' | 'IRA' | 'Individual' | 'Joint'
  balance: number
  ytdReturn: number
  color: string
}

export interface AccountGroup {
  id: string
  name: string
  description: string
  accountIds: string[]
  color: string
}

export interface Question {
  id: string
  text: string
  category: QuestionCategory
  tags: string[]
  placeholders?: PlaceholderDefinition[]
  priority: 'high' | 'medium' | 'low'
  mobileText?: string
  tabletText?: string
}

export interface PlaceholderDefinition {
  key: string
  label: string
  type: 'select' | 'multiselect'
  options: PlaceholderOption[]
  defaultValue?: string
  required: boolean
}

export interface PlaceholderOption {
  value: string
  label: string
  description?: string
}

export interface QuestionRequest {
  question: string
  accounts: string[]
  timeframe: string
  placeholders?: Record<string, string>
}

export interface QuestionResponse {
  status: 'matched' | 'no_match' | 'review'
  confidence?: 'high' | 'medium' | 'low'
  answer?: Answer
  message?: string
  fallbackType?: 'personal' | 'market' | 'financial_advice' | 'portfolio'
  reviewId?: string
}

export interface Answer {
  id: string
  content: AnswerContent
  followUpQuestions?: FollowUpQuestion[]
  timestamp: Date
}

export interface AnswerContent {
  paragraph?: string
  kpis?: KPI[]
  chartData?: ChartDataPoint[]
  tableData?: TableRow[]
  highlights?: string[]
  metrics?: Metric[]
}

export interface KPI {
  label: string
  value: string
  change?: string
  isPositive?: boolean
  trend?: 'up' | 'down' | 'flat'
  description?: string
}

export interface ChartDataPoint {
  month: string
  portfolio: number
  benchmark: number
  [key: string]: string | number
}

export interface TableRow {
  [key: string]: string | number | boolean
}

export interface Metric {
  label: string
  value: number
  unit: string
  category: 'risk' | 'return' | 'allocation' | 'performance'
  benchmark?: number
}

export interface FollowUpQuestion {
  text: string
  category: QuestionCategory
  priority: 'high' | 'medium' | 'low'
  description?: string
}

export type QuestionCategory =
  | 'performance'
  | 'risk'
  | 'allocation'
  | 'holdings'
  | 'costs'
  | 'analysis'
  | 'comparison'

export interface FeedbackRequest {
  answerId: string
  rating: 'positive' | 'negative'
  reason?: string
  comment?: string
}

export interface PortfolioSummary {
  totalAUM: number
  ytdReturn: number
  sharpeRatio: number
  accountCount: number
  topHoldings?: Holding[]
  allocation?: AllocationBreakdown
}

export interface Holding {
  symbol: string
  name: string
  weight: number
  value: number
  change: number
}

export interface AllocationBreakdown {
  byAssetClass: Record<string, number>
  bySector: Record<string, number>
  byRegion: Record<string, number>
}
```

## 🔄 Implementation Strategy

### Phase 1: Core Infrastructure (Weeks 1-2)
1. **Project Setup**: Vue 3 + Vite + TypeScript configuration
2. **Design System**: Tailwind CSS + component library
3. **State Management**: Pinia stores setup
4. **Routing**: Vue Router configuration
5. **Testing Setup**: Vitest + Testing Library configuration

### Phase 2: Core Components (Weeks 3-4)
1. **App.vue**: Main application controller
2. **TopNavigation.vue**: Header with search
3. **SearchOverlay.vue**: Advanced search interface
4. **SelectionContext**: Account/group selection logic
5. **Basic API Integration**: Mock services

### Phase 3: Answer System (Weeks 5-6)
1. **AnswerCard.vue**: Rich answer display
2. **FinancialChart.vue**: Chart visualization
3. **Content Layouts**: Specialized answer layouts
4. **Loading States**: Skeleton components
5. **Error Handling**: Error boundaries and states

### Phase 4: Advanced Features (Weeks 7-8)
1. **Interactive Placeholders**: Question customization
2. **Feedback System**: Answer rating and comments
3. **History Management**: Search and answer history
4. **Performance Optimization**: Lazy loading and caching
5. **Accessibility**: ARIA implementation and keyboard navigation

### Phase 5: Polish & Testing (Weeks 9-10)
1. **Comprehensive Testing**: Unit, integration, and E2E tests
2. **Performance Optimization**: Bundle analysis and optimization
3. **Accessibility Audit**: WCAG compliance verification
4. **Documentation**: Component documentation and guides
5. **Production Deployment**: Build optimization and deployment

## ✅ Definition of Done

### Component Completion Criteria
Each component must meet these requirements before being considered complete:

1. **Functionality**:
   - ✅ All specified features implemented
   - ✅ Business rules correctly enforced
   - ✅ Error handling implemented
   - ✅ Loading states handled

2. **Testing**:
   - ✅ Unit tests with >90% coverage
   - ✅ Integration tests for key flows
   - ✅ Accessibility tests passing
   - ✅ Performance benchmarks met

3. **Quality**:
   - ✅ TypeScript strict mode compliance
   - ✅ ESLint and Prettier formatting
   - ✅ Vue 3 composition API best practices
   - ✅ Responsive design implementation

4. **Documentation**:
   - ✅ Component props and emits documented
   - ✅ Usage examples provided
   - ✅ TDD test scenarios documented
   - ✅ Business logic explained

## 🎯 Success Metrics

### Technical Metrics
- **Bundle Size**: < 150KB initial load
- **Performance**: LCP < 2.5s, FID < 100ms
- **Test Coverage**: > 90% line coverage
- **Type Safety**: 100% TypeScript coverage
- **Accessibility**: WCAG 2.1 AA compliance

### User Experience Metrics
- **Question Response Time**: < 2s average
- **Search Effectiveness**: > 95% question match rate
- **Mobile Usability**: > 4.5/5 user rating
- **Error Rate**: < 1% API failures
- **User Satisfaction**: > 90% positive feedback

## 🎯 **Executive Summary**

### **Technology Stack**

FinSight Vue 3 is built with professional-grade tools for financial applications:

1. **UI Framework**: **PrimeVue 4**
   - Professional financial components out-of-the-box
   - Built-in dark themes and accessibility
   - Tailwind CSS integration with `tailwindcss-primeui`

2. **Charts**: **Highcharts**
   - Financial charting (OHLC, technical indicators)
   - Professional financial styling
   - Optimized bundle size (85KB)

3. **Data Grids**: **AG Grid**
   - Virtual scrolling, filtering, grouping
   - Excel export, column management
   - Financial data formatting

4. **Animations**: **Motion for Vue**
   - Layout animations and shared element transitions
   - Professional micro-interactions
   - Framer Motion API compatibility

### **Bundle Size**

- **Production Bundle**: 550KB
- **Justification**: Enterprise-grade financial application features

### **Implementation Priority**

1. **Week 1-2**: Core Vue 3 + PrimeVue setup
2. **Week 3-4**: Highcharts and AG Grid integration
3. **Week 5-6**: Motion for Vue animations
4. **Week 7-8**: Financial business logic and TDD
5. **Week 9-10**: Performance optimization and deployment

### **Success Metrics**

- **Performance**: LCP < 2.5s with 550KB bundle
- **Accessibility**: WCAG 2.1 AA compliance via PrimeVue
- **Developer Experience**: Professional components accelerate development
- **User Experience**: Enterprise-grade financial interface

This comprehensive TDD requirements document provides everything needed to rebuild FinSight using Vue 3 with robust testing practices, modern development standards, and professional financial application capabilities.

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"content": "Find and read all markdown files in the project", "status": "completed", "activeForm": "Finding and reading all markdown files in the project"}, {"content": "Analyze project structure and requirements", "status": "completed", "activeForm": "Analyzing project structure and requirements"}, {"content": "Create comprehensive TDD requirements document", "status": "completed", "activeForm": "Creating comprehensive TDD requirements document"}]