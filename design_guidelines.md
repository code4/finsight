# FinSight Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from Bloomberg Terminal and professional financial platforms, emphasizing data density, precision, and institutional credibility. Dark mode priority with sophisticated color coding for financial data visualization.

## Core Design Elements

### A. Color Palette
**Dark Mode Primary**:
- Background: 210 25% 8% (deep navy-charcoal)
- Surface: 210 20% 12% (elevated panels)
- Text Primary: 0 0% 95% (near white)
- Text Secondary: 210 10% 70% (muted)

**Brand & Accent Colors**:
- Primary Brand: 210 100% 60% (professional blue)
- Success/Gains: 142 76% 36% (financial green)
- Warning/Losses: 0 84% 60% (financial red)
- Neutral Data: 45 7% 45% (muted gold for neutral metrics)

### B. Typography
- **Primary**: Inter (Google Fonts) - clean, financial-grade readability
- **Monospace**: JetBrains Mono for numerical data, tickers, percentages
- **Hierarchy**: text-xs to text-2xl, emphasizing data density over large headers

### C. Layout System
**Tailwind Spacing**: Primarily 2, 4, 6, and 8 units (p-2, m-4, gap-6, h-8) for dense, professional layouts without excessive whitespace.

### D. Component Library

**Core Navigation**:
- Top bar with FinSight logo, Perplexity-style search (rounded-full with subtle glow)
- Expandable search overlay with category pills
- Context bar with account chips (color-coded) and timeframe selectors

**Data Visualization**:
- Answer cards with subtle borders and elevated backgrounds
- Interactive charts with hover states and financial color coding
- Sortable tables with alternating row backgrounds
- KPI cards with large numerical displays and trend indicators

**Interactive Elements**:
- Follow-up question chips (rounded, subtle hover states)
- Account filter chips with distinct color coding per account
- History drawer with timestamp-based grouping

**Financial Data Formatting**:
- Currency: Always formatted with proper commas and decimal places
- Percentages: Color-coded (green positive, red negative)
- Large numbers: Abbreviated with K/M/B suffixes where appropriate

### E. Animations
**Minimal & Purposeful**:
- Subtle fade-ins for search overlays
- Smooth transitions for drawer/modal states
- Hover states on interactive elements only
- No distracting chart animations - data clarity priority

## Key Design Principles
1. **Data Density**: Maximize information per screen real estate
2. **Professional Hierarchy**: Clear visual distinction between data types
3. **Contextual Clarity**: Always visible account/timeframe context
4. **Audit Trail**: Timestamps and data source transparency
5. **Bloomberg Inspiration**: Sophisticated, terminal-like information architecture with modern web polish

## Layout Priority
Mobile-responsive but desktop-optimized for professional financial advisor workflows. Dense information layouts with expandable/collapsible sections for different screen sizes.