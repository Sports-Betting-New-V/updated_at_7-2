# Sports Betting Simulator - replit.md

## Overview

This is a comprehensive full-stack TypeScript sports betting simulator that combines real-time sports data, AI-powered predictions, and sophisticated betting mechanics. The application provides users with a realistic betting experience including bankroll management, AI recommendations, game simulation, and detailed analytics - all without real money transactions.

### Key Features
- **AI-Powered Predictions**: Uses OpenAI GPT-4o to generate intelligent betting recommendations
- **Real Sports Data**: Integrates with ESPN Sports API for live NBA, NFL, MLB, and NHL games
- **Virtual Bankroll**: Users start with $10,000 virtual currency for betting simulation
- **Comprehensive Analytics**: Tracks win rates, ROI, profit/loss, and betting patterns
- **Theme Support**: Full dark/light mode with automatic system preference detection
- **Responsive Design**: Mobile-optimized interface for betting on any device

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

## Application Workflow

### 1. Data Initialization
- **Game Data Fetching**: ESPN Sports API provides live game schedules, teams, and basic info
- **Betting Lines Generation**: Realistic spreads, moneylines, and totals calculated based on team matchups
- **AI Prediction Generation**: OpenAI analyzes each game to create betting recommendations with confidence scores

### 2. User Experience Flow
```
Dashboard → View AI Predictions → Place Bets → Track Results → Analyze Performance
```

### 3. Betting Process
1. **Prediction Display**: AI shows recommended picks with edge scores (1-10) and confidence tiers
2. **Bet Placement**: Users can bet on spreads, moneylines, or totals through quick bet interface
3. **Bankroll Management**: Virtual currency tracked with each bet, preventing over-betting
4. **Game Simulation**: Realistic game results generated to determine bet outcomes
5. **Result Processing**: Wins/losses calculated and bankroll updated accordingly

### 4. Analytics Engine
- **Real-time Statistics**: Win rate, ROI, total profit/loss, betting streaks
- **Performance Tracking**: Historical bankroll changes, bet frequency analysis
- **Insights Generation**: AI-powered betting pattern analysis and recommendations

### 5. Theme System Workflow
- **System Detection**: Automatically detects user's OS theme preference
- **Manual Toggle**: Sun/moon icon in header for manual theme switching
- **Persistence**: Theme choice saved to localStorage for future visits
- **Dynamic Updates**: All components respond instantly to theme changes

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
- July 01, 2025. Migration to Replit environment completed:
  * Fixed missing dependencies and database connectivity
  * Implemented comprehensive dark/light mode theme system
  * Added theme toggle with system preference detection and localStorage persistence
  * Updated all pages and components for proper theme responsiveness
  * Removed hard-coded dark mode styling for proper theme switching
- July 02, 2025. OAuth authentication and bankroll fixes implemented:
  * Integrated Replit OAuth authentication system
  * Updated database schema to support OAuth (string user IDs)
  * Fixed bankroll updating on bet placement and game results
  * Added login/logout functionality to header component
  * Protected bet placement - requires authentication
  * Demo mode still available for viewing sports data and analytics
  * Updated user interface to show authentication status
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

## Technical Implementation Details

### Database Schema
```sql
Users Table: id, username, password, bankroll
Games Table: id, homeTeam, awayTeam, gameTime, sport, homeSpread, awaySpread, homeMoneyline, awayMoneyline, total
Predictions Table: id, gameId, recommendedPick, betType, edgeScore, confidenceTier, tags, reasoning
Bets Table: id, userId, gameId, predictionId, amount, pick, odds, status, payout
```

### API Endpoints
- `GET /api/user` - User profile and bankroll
- `GET /api/user/stats` - Betting statistics and performance metrics
- `GET /api/games` - Available games with betting lines
- `GET /api/games/predictions` - Games with AI predictions
- `POST /api/bets` - Place a new bet
- `GET /api/bets` - User's betting history
- `GET /api/bets/recent` - Recent bets for dashboard

### AI Prediction Engine
- **Input Analysis**: Team matchups, historical performance, betting line value
- **Edge Score Calculation**: Mathematical model rating bet value (1-10 scale)
- **Confidence Tiers**: Low, Medium, High based on prediction certainty
- **Tag System**: Categories like "Smart Money", "Fade Public", "Value", "Weather"
- **Reasoning**: Natural language explanation of prediction logic

### Page Structure
- **Dashboard**: Overview with stats, recent bets, AI predictions, quick bet form
- **Predictions**: Detailed AI recommendations with advanced filtering
- **History**: Complete betting history with profit/loss analysis
- **Analytics**: Charts and performance metrics
- **Simulator**: Betting strategy testing tools

## User Guide

### Getting Started
1. **Initial Setup**: User starts with $10,000 virtual bankroll
2. **Dashboard Overview**: View current bankroll, recent performance, and AI predictions
3. **Theme Toggle**: Click sun/moon icon in header to switch between light/dark modes

### Placing Bets
1. **View Predictions**: AI recommendations show on dashboard with confidence scores
2. **Quick Bet**: Use right sidebar for fast bet placement
3. **Bet Types**: Choose from spreads, moneylines, or totals (over/under)
4. **Amount Selection**: Enter bet amount (cannot exceed current bankroll)
5. **Confirmation**: Bet is processed immediately and bankroll updated

### Understanding AI Predictions
- **Edge Score**: 1-10 rating of bet value (higher = better opportunity)
- **Confidence Tiers**: High/Medium/Low based on prediction certainty
- **Tags**: Quick indicators like "Smart Money" or "Fade Public"
- **Reasoning**: AI explanation of why the bet is recommended

### Analytics & Performance
- **Win Rate**: Percentage of successful bets
- **ROI**: Return on investment across all bets
- **Profit/Loss**: Total gains or losses from betting
- **Bankroll Chart**: Visual representation of balance over time
- **Streak Tracking**: Current winning or losing streaks

## User Preferences

```
Preferred communication style: Simple, everyday language.
```