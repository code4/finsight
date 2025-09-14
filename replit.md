# FinSight - Financial Advisory Platform

## Overview

FinSight is a Bloomberg Terminal-inspired financial advisory dashboard that provides professional portfolio analytics, risk assessment, and performance insights. The application features a search-centric interface with Perplexity-style interaction patterns, allowing financial advisors to query portfolio data through natural language and receive rich, structured answers with charts, KPIs, and actionable insights. The platform emphasizes data density, professional aesthetics, and institutional credibility with a dark-mode-first design.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client application is built with **React 18 and TypeScript** using **Vite** as the build tool for fast development and optimized production builds. The component architecture follows a feature-based organization with shared UI components powered by **shadcn/ui** and **Radix UI** primitives for accessibility. State management relies on React's built-in hooks (useState, useEffect) combined with **TanStack Query** for server state management.

The design system implements a Bloomberg Terminal-inspired aesthetic with a dark-mode-first approach, using **Tailwind CSS** for styling. The color palette emphasizes professional financial colors with deep navy backgrounds, institutional blue accents, and traditional financial red/green indicators for gains/losses. Typography combines Inter font for readability with JetBrains Mono for numerical data display.

### Backend Architecture  
The server runs on **Node.js with Express.js** and TypeScript using ES modules. It implements a RESTful API structure with `/api` prefix routing for clean separation. The architecture includes sophisticated question matching services that use keyword-based algorithms to match user queries with pre-defined answers, supporting confidence levels (high, medium, low) for result quality assessment.

### Data Layer
Database operations use **Drizzle ORM with PostgreSQL** for type-safe database queries and schema management. The application implements a comprehensive schema for users, questions, answers, question matches, and feedback systems. Session management utilizes Express sessions with PostgreSQL storage via connect-pg-simple.

Shared type definitions reside in the `/shared` directory, ensuring consistency between client and server with **Zod** for runtime type validation and schema generation.

### Component Design Patterns
The application implements specialized financial components including:
- **Answer Cards**: Rich data presentation with interactive charts using Recharts
- **KPI Cards**: Professional metrics display with trend indicators  
- **Account Selection**: Mutually exclusive selection system with business rule enforcement
- **Search Interface**: Expandable overlay with category-based question discovery
- **Follow-up Chips**: Smart question suggestions based on current context

### Search and Discovery System
The core interaction model centers around a Perplexity-style search interface that expands into a full overlay showing categorized financial questions. Categories include Performance Analysis, Risk Assessment, Holdings Analysis, Allocation Analysis, Activity & Trading, Income & Dividends, and Comparison tools. The system supports placeholder replacement for dynamic question generation and maintains search history with context preservation.

## External Dependencies

### UI and Styling
- **shadcn/ui** component library with Radix UI primitives for accessible components
- **Tailwind CSS** for utility-first styling with custom design system extensions
- **Lucide React** for consistent iconography
- **Inter and JetBrains Mono** fonts from Google Fonts

### Data Visualization
- **Recharts** for financial charting and data visualization components
- **Embla Carousel** for carousel/slider functionality

### Backend Services
- **Express.js** web framework with TypeScript support
- **Drizzle ORM** with PostgreSQL dialect for database operations
- **connect-pg-simple** for PostgreSQL session storage
- **Zod** for schema validation and type safety

### Development Tools
- **Vite** for fast development server and optimized builds
- **ESBuild** for server-side bundle generation
- **Drizzle Kit** for database migration management
- **TanStack Query** for efficient data fetching and caching

### Database
- **PostgreSQL** as the primary database with Neon Database serverless hosting
- **Drizzle ORM** for type-safe database schema and query management