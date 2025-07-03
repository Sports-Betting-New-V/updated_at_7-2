# Local Setup Guide - Sports Betting Simulator (with Cloud PostgreSQL)

This guide will help you run the sports betting simulator on any PC using your cloud PostgreSQL database.

## Prerequisites

You only need:

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

2. **Git** (optional, for downloading)
   - Download from: https://git-scm.com/

**No PostgreSQL installation needed!** You're using Neon cloud database.

## Step 1: Download the Project

### Option A: Download as ZIP
1. Click the "Download" button in Replit
2. Extract the ZIP file to your desired folder
3. Open terminal/command prompt in that folder

### Option B: Clone with Git (if available)
```bash
git clone [your-repo-url]
cd [project-folder]
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Database Configuration (Neon Cloud PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:npg_LDSiO6GhP3ws@ep-restless-poetry-a6tq4uuw.us-west-2.aws.neon.tech/neondb?sslmode=require

# Session Secret (generate a random string)
SESSION_SECRET=my-super-secret-session-key-2024

# OpenAI API Key (optional - for AI predictions)
OPENAI_API_KEY=your-openai-api-key-here

# Development Settings
NODE_ENV=development
```

**Important Notes:**
- Your Neon database URL is already included above
- Change the `SESSION_SECRET` to any random string you want
- The `OPENAI_API_KEY` is optional - app works without it

## Step 4: Set Up the Database Schema

Since you're using a cloud database, you just need to push the schema:

```bash
npm run db:push
```

This will create all the necessary tables in your Neon database.

## Step 5: Start the Application

```bash
npm run dev
```

The application will be available at: http://localhost:5000

## That's It! 

Your app is now running with:
- ✅ Cloud PostgreSQL database (no local setup needed)
- ✅ All tables automatically created
- ✅ Sample data initialized
- ✅ Ready for user registration and betting

## Optional: OpenAI API Key Setup

If you want AI-powered predictions:

1. Go to https://platform.openai.com/
2. Create an account or sign in
3. Go to API Keys section
4. Create a new API key
5. Replace `your-openai-api-key-here` in your `.env` file

## Running on Multiple PCs

To run this on another PC:

1. **Copy the project folder** to the new PC
2. **Install Node.js** on the new PC
3. **Run these commands:**
```bash
npm install
npm run dev
```

The `.env` file with your database connection will work on any PC since it's a cloud database.

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run db:push      # Push schema changes (already done)
```

## Common Issues & Solutions

### Database Connection Issues
- Your Neon database URL includes SSL (`sslmode=require`)
- If connection fails, check your internet connection
- Neon databases may go to sleep - first connection might take a few seconds

### Port Already in Use
- The app uses port 5000 by default
- If occupied, the system will find another available port
- Check the terminal output for the actual port

### Missing OpenAI API Key
- App works perfectly without it
- You'll see "Demo prediction" instead of AI predictions
- All other features work normally

### Node Version Issues
- Ensure you're using Node.js 18 or higher
- Use `nvm` to manage Node versions if needed

## Advantages of Cloud Database

- ✅ **No local setup** - works on any PC instantly
- ✅ **Shared data** - same database across all your PCs
- ✅ **Always available** - no need to start/stop database
- ✅ **Automatic backups** - Neon handles backups
- ✅ **SSL secured** - encrypted connections

## Features Available

- ✅ User registration and authentication
- ✅ Virtual bankroll management ($10,000 starting balance)
- ✅ Real sports data from ESPN API
- ✅ AI-powered betting predictions (with OpenAI API)
- ✅ Comprehensive betting analytics
- ✅ Dark/light theme support
- ✅ Mobile-responsive design

## Database Schema

Your Neon database will automatically include these tables:
- `users` - User accounts and bankrolls
- `games` - Sports games and betting lines
- `predictions` - AI betting recommendations
- `bets` - User betting history
- `sessions` - User session management

## Need Help?

If you encounter any issues:
1. Check the terminal for error messages
2. Verify the `.env` file is created correctly
3. Ensure Node.js is installed and updated
4. Check internet connection for database access

The application includes demo data and works great with your cloud database setup!