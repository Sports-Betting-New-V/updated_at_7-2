# Sports Betting Simulator - replit.md

## Overview

This is a full-stack TypeScript application that simulates sports betting with AI-powered predictions. The application features a React frontend with shadcn/ui components, an Express.js backend, and uses Drizzle ORM with PostgreSQL for data persistence. It includes a betting simulator engine, AI prediction algorithms, and comprehensive user analytics.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom dark theme
- **State Management**: TanStack Query (React Query) for server state
- **Build Tool**: Vite with custom configuration for client/server separation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints with JSON responses
- **Middleware**: Custom logging, error handling, and request parsing
- **Development**: Custom Vite integration for hot module replacement

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (configured via Neon serverless)
- **Migrations**: Drizzle Kit for schema management
- **Storage**: Abstracted storage interface with in-memory implementation for development

## Key Components

### Data Models
- **Users**: Virtual bankroll management and authentication
- **Games**: Sports games with betting lines (spreads, moneylines, totals)
- **Predictions**: AI-generated betting recommendations with confidence scoring
- **Bets**: User betting history with status tracking and payout calculations

### Business Logic Services
- **Prediction Engine**: Generates AI predictions based on game data and mock ML algorithms
- **Betting Simulator**: Handles bet placement, game simulation, and payout calculations
- **Analytics Engine**: Calculates user statistics, win rates, and performance metrics

### Frontend Features
- **Dashboard**: Overview of bankroll, recent bets, and performance metrics
- **AI Predictions**: Real-time betting recommendations with edge scores
- **Quick Bet**: Streamlined bet placement interface
- **Analytics**: Charts and insights for betting performance
- **Responsive Design**: Mobile-optimized interface with dark theme

## Data Flow

1. **Game Data**: Mock sports games are created with realistic betting lines
2. **AI Predictions**: Prediction engine analyzes games and generates recommendations
3. **User Interaction**: Users view predictions and place bets through the interface
4. **Bet Processing**: Betting simulator validates and processes wagers
5. **Game Simulation**: Mock game results are generated for bet resolution
6. **Analytics**: User statistics and performance metrics are calculated and displayed

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: PostgreSQL connection for production
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI components
- **recharts**: Data visualization for charts
- **wouter**: Lightweight React routing

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first styling
- **ESBuild**: Server bundling for production

## Deployment Strategy

### Development
- Vite dev server with HMR for frontend
- tsx for TypeScript execution in development
- In-memory storage for rapid development iteration

### Production Build
- Vite builds optimized client bundle to `dist/public`
- ESBuild bundles server code to `dist/index.js`
- Static file serving integrated with Express

### Database Setup
- Drizzle migrations via `db:push` command
- Environment variable configuration for DATABASE_URL
- PostgreSQL schema defined in shared types

## Changelog
```
Changelog:
- July 01, 2025. Initial setup
- July 01, 2025. Integrated real-time data sources:
  * PostgreSQL database with Drizzle ORM (connected and initialized)
  * OpenAI API for AI-powered predictions (connected)
  * ESPN Sports API for live game data (integrated)
  * Added API endpoints for generating fresh predictions and refreshing games
  * Database auto-initialization with sample data on startup
```

## External Service Integrations

### Database Layer
- **PostgreSQL**: Connected via Neon serverless with environment variables
- **Drizzle ORM**: Schema pushed and operational with auto-initialization
- **Storage Interface**: Hybrid system using DatabaseStorage when DB available, MemStorage as fallback

### AI Services  
- **OpenAI API**: Connected for real-time prediction generation using GPT-4o
- **Prediction Engine**: Enhanced with AI-powered analysis and fallback logic

### Sports Data
- **ESPN Sports API**: Free tier integration for live NBA, NFL, MLB, NHL game data
- **Data Refresh**: Real-time game fetching with realistic betting lines generation
- **Sports Coverage**: Multi-sport support with sport-specific line calculations

## User Preferences

```
Preferred communication style: Simple, everyday language.
```