# Claude Development Notes

## Development Context

This document contains development notes, architectural decisions, and technical details for Claude AI when working on the FinSight project.

## System Architecture Details

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development patterns
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: Tailwind CSS with custom design system inspired by financial platforms
- **Component Library**: Shadcn/ui components with Radix UI primitives for accessibility
- **State Management**: React Query (TanStack Query) for server state management
- **Styling**: Dark-mode-first design with Bloomberg Terminal aesthetics

### Design System Specifications
- **Color Palette**: Professional financial colors with dark navy backgrounds, institutional blue accents, and financial red/green for gains/losses
- **Typography**: Inter font for readability with JetBrains Mono for numerical data
- **Layout**: Dense, professional layouts using Tailwind spacing (2, 4, 6, 8 units)
- **Components**: Specialized financial components including KPI cards, charts, account filters, and follow-up question chips

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **API Design**: RESTful API structure with /api prefix routing
- **Session Management**: Express session handling with PostgreSQL session storage

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database queries
- **Schema**: Shared schema definitions between client and server in `/shared` directory
- **Validation**: Zod for runtime type validation and schema generation
- **Migrations**: Drizzle Kit for database schema management

### Application Structure
- **Monorepo**: Unified structure with client, server, and shared code
- **Component Organization**: Feature-based component structure with examples and UI components
- **Routing**: File-based routing with centralized route registration
- **Asset Management**: Vite-based asset bundling with path aliases (`@/`, `@shared/`, `@assets/`)

## Key Business Logic

### Account Selection System
The application implements strict business rules for account selection:

```typescript
// Mutually exclusive selection logic in App.tsx:106-123
const handleSelectionModeChange = (mode: 'accounts' | 'group') => {
  if (mode === 'accounts') {
    // Clear group selection, maintain account selections
    setSelectedGroupId(null);
    if (selectedAccountIds.size === 0) {
      setSelectedAccountIds(new Set([mockAllAccounts[0].id]));
    }
  } else {
    // Clear account selections, auto-select first group
    setSelectedGroupId(mockAccountGroups[0].id);
    setSelectedAccountIds(new Set());
  }
  setSelectionMode(mode);
};
```

**Rules:**
1. Users can select either individual accounts OR account groups, never both
2. Minimum one account must always be selected
3. Switching modes clears the other selection type
4. Layout stability maintained with fixed-width containers

### Mock Data Structure
Located in `App.tsx:54-90`, the application uses comprehensive mock data:

- **10 realistic accounts** with varied types (Trust, IRA, Individual, Joint, LLC, REIT, 529)
- **3 account groups** (Growth Strategy, Conservative Portfolio, Sector Diversification)
- **Portfolio calculations** in `usePortfolioSummary.ts:23-82` with realistic financial metrics

### Search & Question Matching
The search system in `App.tsx:160-256` implements:

- **Pattern matching** for predefined financial questions
- **Keyword-based similarity** checking with meaningful word filtering
- **Fallback handling** for unmatched queries with backend logging
- **Real-time answer generation** with loading states

## External Dependencies

### Database & Storage
- **Neon Database**: Serverless PostgreSQL database hosting
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL support
- **Connect PG Simple**: PostgreSQL session store for Express sessions

### UI & Visualization
- **Radix UI**: Complete accessibility-focused component primitives
- **Recharts**: Financial chart library with customizable styling
- **Lucide React**: Consistent icon library
- **Embla Carousel**: Touch-friendly carousel component

### Form & Validation
- **React Hook Form**: Performant form state management
- **Zod**: Runtime type validation and schema definition
- **Hookform Resolvers**: Seamless integration between forms and validation

### Utilities
- **Date-fns**: Date manipulation and formatting
- **Class Variance Authority**: Type-safe component variant API
- **CLSX & Tailwind Merge**: Conditional class name utilities

## Component Relationships

```
App.tsx (Main Controller)
├── TopNavigation.tsx (Search interface with typing animation)
├── SearchOverlay.tsx (Enhanced category-based search with modern UX)
├── ContextBar.tsx (Account selection)
├── AnswerCard.tsx (Data presentation)
│   ├── FinancialChart.tsx (Recharts integration)
│   └── FollowUpChips.tsx (Question suggestions)
├── AnswerCardSkeleton.tsx (Enhanced loading states with progress)
├── HistoryDrawer.tsx (Search history)
└── ThemeProvider.tsx (Dark/light mode)
```

## Development Commands

```bash
# Development
npm run dev          # Start dev server with hot reload
npm run check        # TypeScript type checking

# Production
npm run build        # Build client (Vite) + server (esbuild)
npm run start        # Start production server

# Database
npm run db:push      # Apply Drizzle schema changes
```

## File Structure Notes

### Client (`client/src/`)
- `components/` - All React components
- `components/ui/` - shadcn/ui base components
- `components/examples/` - Example/template components
- `hooks/` - Custom React hooks
- `lib/` - Utilities and configuration
- `App.tsx` - Main application component

### Server (`server/`)
- `index.ts` - Express server setup with middleware
- `routes.ts` - API route definitions
- `storage.ts` - Data layer abstraction
- `vite.ts` - Vite integration for development

### Shared (`shared/`)
- `schema.ts` - Drizzle schema and Zod validation types

## Configuration Files
- `vite.config.ts` - Vite configuration with aliases
- `tailwind.config.ts` - Custom Tailwind configuration
- `drizzle.config.ts` - Database configuration
- `tsconfig.json` - TypeScript configuration
- `components.json` - shadcn/ui configuration

## Recent Changes (Git History)
Based on recent commits, the application has been evolving with:
- UI simplifications (removing unnecessary navigation elements)
- Empty state improvements and above-the-fold optimization
- Account selection display optimizations
- Configuration updates for system stability
- Enhanced SearchOverlay UX with modern design and animations
- Added typing animation to search inputs with dynamic placeholder cycling
- Fixed input focus management and overlay backdrop positioning
- Improved mobile experience with touch-optimized interactions
- Enhanced loading state visibility and skeleton positioning
- Implemented responsive typing animation system with screen-size-specific question sets
- Fixed multi-line overflow issues in typing animations on smaller screens
- Added dynamic question template system with dropdown selectors for professional question building

## Development Notes for Claude
- Always maintain the mutually exclusive account selection business logic
- Preserve layout stability with fixed-width containers
- Follow the existing TypeScript patterns and component structure
- Use the established mock data structure for consistency
- Maintain the Bloomberg Terminal aesthetic and professional design
- Ensure all new components integrate with the existing state management patterns
- SearchOverlay uses advanced UX patterns: typing animations, focus management, z-index layering
- Loading states should provide real account/timeframe context for better user experience
- Overlay backdrop must cover entire viewport including header for proper modal behavior
- Mobile experience should be touch-optimized with appropriate tap targets and animations
- Typing animations use responsive question sets (mobile: <640px, tablet: <768px, desktop: >=768px)
- Question templates provide professional dropdown configuration before submitting questions
- Always consider text length and screen size when implementing typing animations to prevent overflow
- **NEVER** add "Generated with Claude Code" or similar attribution messages to commit messages