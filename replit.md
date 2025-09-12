# FinSight - Financial Advisory Platform

## Overview

FinSight is a professional financial advisory platform designed to provide portfolio analytics, risk assessment, and performance insights for financial advisors. The application follows a search-first, non-chatbot approach that emphasizes data discovery and structured answers rather than conversational interfaces. Built with React, TypeScript, and modern web technologies, it features a Bloomberg Terminal-inspired design with dark mode priority and institutional-grade credibility.

## Current Focus & Goals

### Current Development Sprint (Sep 2025)
**Primary Goal**: Transform search experience from disjointed header input + overlay into unified command palette experience

**Vision**: Create a seamless, Bloomberg Terminal-inspired search interface where:
- Header search input and overlay work as one cohesive experience
- Professional, compact design with clear visual hierarchy  
- Full keyboard navigation and accessibility support
- Unified search across questions, categories, and recent queries
- Command palette pattern familiar to professional users

**Progress Status**:
- ✅ Successfully consolidated headers and optimized space utilization (reduced from 64-112px to ~52px)
- ✅ Identified core UX issue: search input and overlay feel completely separate instead of unified
- ✅ Implemented Command-based structure with proper ARIA support and keyboard navigation
- ✅ **COMPLETED**: Unified search experience - header input and overlay now work as one cohesive command palette
- ✅ Added professional focus management and seamless state synchronization
- ✅ Created mobile-optimized Dialog interface for touch devices
- ✅ **COMPLETED**: Prominent search interface in empty state with rotating placeholder animations
- ✅ Optimized overlay space utilization with compact layouts and better information density
- 🚧 **In Progress**: Adding rotating typewriter animation for search placeholders to inspire FA questions
- ⏳ **Next**: Add fuzzy search with highlighting and search transition animations

**Key Architectural Decisions**:
- Adopted shadcn/ui Command component for unified search interface
- Moved from separate header input + overlay to integrated command palette
- Implementing professional, compact Bloomberg-style design patterns
- Focus on accessibility with full keyboard navigation and ARIA support

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development patterns
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: Tailwind CSS with custom design system inspired by financial platforms
- **Component Library**: Shadcn/ui components with Radix UI primitives for accessibility
- **State Management**: React Query (TanStack Query) for server state management
- **Styling**: Dark-mode-first design with Bloomberg Terminal aesthetics

### Design System
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
- **Schema**: Shared schema definitions between client and server
- **Validation**: Zod for runtime type validation and schema generation
- **Migrations**: Drizzle Kit for database schema management

### Application Structure
- **Monorepo**: Unified structure with client, server, and shared code
- **Component Organization**: Feature-based component structure with examples and UI components
- **Routing**: File-based routing with centralized route registration
- **Asset Management**: Vite-based asset bundling with path aliases

### Key Features
- **Unified Command Palette**: Bloomberg Terminal-inspired search interface replacing traditional header search
- **Prominent Search Experience**: Large, central search input in empty state with rotating placeholder animations
- **Search-Centric Interface**: Perplexity-style discovery with category-based organization and compact overlay layouts
- **Rotating Question Inspiration**: Typewriter-style animation cycling through 10 example FA questions to inspire users
- **Answer Cards**: Structured financial data presentation with KPIs, charts, and tables
- **Context Management**: Persistent account and timeframe selection with contextual search hints
- **History System**: Query history with context snapshots
- **Professional Design**: Compact, space-optimized layouts with institutional-grade aesthetics
- **Accessibility**: Full keyboard navigation with ARIA support for professional workflows
- **Responsive Design**: Mobile-first approach with professional desktop experience

## External Dependencies

### Database & Storage
- **Neon Database**: Serverless PostgreSQL database hosting
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL support
- **Connect PG Simple**: PostgreSQL session store for Express sessions

### UI & Visualization
- **Radix UI**: Accessible component primitives for dialog, dropdown, tooltip, etc.
- **Recharts**: Chart library for financial data visualization
- **Lucide React**: Icon library for consistent iconography
- **Embla Carousel**: Touch-friendly carousel component

### Development Tools
- **Vite**: Build tool with React plugin and development server
- **TailwindCSS**: Utility-first CSS framework with custom configuration
- **TypeScript**: Static type checking across the entire application
- **ESBuild**: Fast JavaScript bundler for production builds

### Form & Validation
- **React Hook Form**: Form state management with validation
- **Zod**: Runtime type validation and schema definition
- **Hookform Resolvers**: Integration between React Hook Form and Zod

### Utilities
- **Date-fns**: Date manipulation and formatting utilities
- **Class Variance Authority**: Type-safe variant API for component styling
- **CLSX & Tailwind Merge**: Conditional class name utilities