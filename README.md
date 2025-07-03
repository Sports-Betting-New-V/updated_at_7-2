# Sports Betting Simulator 🎯

A comprehensive full-stack sports betting simulator with AI-powered predictions, real-time sports data, and virtual currency management.

## 🚀 Quick Start Options

### Option A: Cloud Database (Recommended)
**Prerequisites:** Only Node.js 18+

1. **Download & Install**
```bash
# Extract the downloaded project
cd sports-betting-simulator
npm install
```

2. **Create Environment File**
```bash
# Create .env file with your cloud database:
DATABASE_URL=postgresql://your-cloud-db-url
SESSION_SECRET=your-random-secret-key
OPENAI_API_KEY=your-openai-api-key
NODE_ENV=development
```

3. **Setup Database Schema**
```bash
npm run db:push
```

4. **Start Application**
```bash
npm run dev
```

### Option B: Local PostgreSQL
**Prerequisites:** Node.js 18+ and PostgreSQL 12+

Follow the same steps but use a local database URL:
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/betting_simulator
```

Visit: http://localhost:5000

## 📋 Features

- **AI Predictions**: OpenAI-powered betting recommendations
- **Real Sports Data**: Live NBA, NFL, MLB, NHL games via ESPN API  
- **Virtual Currency**: $10,000 starting bankroll for risk-free betting
- **Authentication**: Secure email/password login system
- **Analytics Dashboard**: Win rates, ROI, profit/loss tracking
- **Responsive Design**: Mobile-optimized dark/light themes

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Node.js, TypeScript  
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session management
- **AI**: OpenAI GPT-4o for prediction analysis
- **Sports Data**: ESPN Sports API integration

## 📖 Detailed Setup Guides

- **[CLOUD_SETUP.md](./CLOUD_SETUP.md)** - Setup with cloud PostgreSQL (Neon, AWS RDS, etc.)
- **[LOCAL_SETUP.md](./LOCAL_SETUP.md)** - Setup with local PostgreSQL installation

Both guides include troubleshooting and deployment instructions.

## 🔑 API Keys

### OpenAI API Key
1. Visit https://platform.openai.com/
2. Create account and generate API key
3. Add to `.env` file as `OPENAI_API_KEY`

## 🎮 How to Use

1. **Register Account**: Create account with email/username/password
2. **View Dashboard**: See virtual bankroll, recent bets, AI predictions
3. **Place Bets**: Use Quick Bet or detailed prediction analysis
4. **Track Performance**: Monitor win rates, ROI, and betting history
5. **Analyze Results**: Review detailed analytics and insights

## 🚀 Production Deployment

```bash
# Build for production
npm run build

# Start production server  
npm start
```

## 📂 Project Structure

```
├── client/src/          # React frontend
│   ├── components/      # UI components
│   ├── pages/          # Application pages
│   ├── hooks/          # Custom React hooks
│   └── lib/            # Utilities and helpers
├── server/             # Express backend
│   ├── services/       # Business logic services
│   └── routes.ts       # API endpoints
├── shared/             # Shared types and schemas
└── LOCAL_SETUP.md      # Detailed setup guide
```

## 🐛 Troubleshooting

- **Database Issues**: Check PostgreSQL is running and DATABASE_URL is correct
- **Port Conflicts**: App will auto-find available port if 5000 is busy
- **API Key Issues**: App works without OpenAI key (no AI predictions)
- **Build Errors**: Ensure Node.js 18+ and all dependencies installed

## 📄 License

MIT License - See LICENSE file for details