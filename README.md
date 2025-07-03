# Sports Betting Simulator

A comprehensive full-stack TypeScript sports betting simulator that combines real-time sports data, AI-powered predictions, and sophisticated betting mechanics. Experience realistic betting without real money transactions.

## Features

- **AI-Powered Predictions**: Intelligent betting recommendations using OpenAI GPT-4o
- **Real Sports Data**: Live game data from ESPN Sports API (NBA, NFL, MLB, NHL)
- **Virtual Bankroll**: Start with $10,000 virtual currency for realistic betting simulation
- **Comprehensive Analytics**: Track win rates, ROI, profit/loss, and betting patterns
- **Theme Support**: Full dark/light mode with automatic system preference detection
- **Responsive Design**: Mobile-optimized interface for betting on any device

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Git installed

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sports-betting-simulator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Configure your environment** (edit `.env` file)
   ```env
   # Required for AI predictions (get from https://platform.openai.com/api-keys)
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Optional - uses in-memory storage if not provided
   NODE_ENV=development
   PORT=5000
   ```

5. **Start the application**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5000`

## Environment Configuration

### Required Environment Variables

- **`OPENAI_API_KEY`**: Required for AI-powered betting predictions
  - Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
  - Without this key, the app will use fallback prediction algorithms

### Optional Environment Variables

- **`DATABASE_URL`**: PostgreSQL database connection string
  - If not provided, the app uses in-memory storage with sample data
  - Format: `postgresql://username:password@localhost:5432/database_name`

- **`NODE_ENV`**: Application environment (default: `development`)
- **`PORT`**: Server port (default: `5000`)

## Data Storage

### In-Memory Storage (Default)

The application uses in-memory storage by default, which includes:
- Sample users, games, predictions, and betting history
- No database setup required
- Perfect for local development and testing
- Data resets when the server restarts

### PostgreSQL Database (Optional)

To use a PostgreSQL database:

1. Set up a PostgreSQL database
2. Add `DATABASE_URL` to your `.env` file
3. Run database migrations:
   ```bash
   npm run db:push
   ```

## Getting OpenAI API Key

1. Create an account at [OpenAI Platform](https://platform.openai.com)
2. Navigate to the [API Keys section](https://platform.openai.com/api-keys)
3. Click "Create new secret key"
4. Copy the key and add it to your `.env` file
5. Note: You'll need to add billing information to your OpenAI account

## Development Scripts

- **`npm run dev`**: Start development server with hot reload
- **`npm run build`**: Build for production
- **`npm run start`**: Start production server
- **`npm run db:push`**: Push database schema (if using PostgreSQL)
- **`npm run check`**: Run TypeScript type checking

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   └── pages/         # Page components
├── server/                # Backend Express application
│   ├── services/          # Business logic services
│   ├── routes.ts          # API routes
│   └── storage.ts         # Data storage layer
├── shared/                # Shared TypeScript types and schemas
└── .env.example          # Environment variables template
```

## Key Features Explained

### AI Predictions
- Powered by OpenAI GPT-4o for intelligent betting analysis
- Fallback to algorithmic predictions when API key is unavailable
- Confidence scoring and edge calculation
- Detailed reasoning for each recommendation

### Virtual Betting
- Start with $10,000 virtual bankroll
- Real-time game simulation and bet settlement
- Comprehensive bet tracking and history

### Sports Data
- Live data from ESPN Sports API
- Multi-sport support (NBA, NFL, MLB, NHL)
- Realistic betting lines and odds

### Analytics
- Win rate and ROI tracking
- Bankroll history visualization
- Betting pattern analysis
- Performance metrics

## Deployment

### Local Development
The application is optimized for local development with:
- Hot module replacement for fast development
- In-memory storage for immediate startup
- Fallback systems for missing external services

### Production Deployment
For production deployment:
1. Set up a PostgreSQL database
2. Configure all environment variables
3. Run `npm run build` to build the application
4. Run `npm run start` to start the production server

## Troubleshooting

### Common Issues

**"OpenAI API key not provided"**
- Add your OpenAI API key to the `.env` file
- The app will work with fallback predictions if no key is provided

**"Database connection error"**
- The app uses in-memory storage by default
- Only set `DATABASE_URL` if you want to use PostgreSQL

**"Port already in use"**
- Change the `PORT` in your `.env` file
- Default port is 5000

**"tsx not found"**
- Run `npm install` to install all dependencies
- Make sure you have Node.js 18+ installed

### Getting Help

1. Check the console output for error messages
2. Verify your `.env` file configuration
3. Ensure all required dependencies are installed
4. Check that your OpenAI API key is valid and has billing enabled

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.