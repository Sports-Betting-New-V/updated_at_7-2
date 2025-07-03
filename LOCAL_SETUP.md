# Local Setup Guide - Sports Betting Simulator

This guide will help you download and run the sports betting simulator on your local PC.

## Prerequisites

Before starting, make sure you have these installed:

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

2. **PostgreSQL** (version 12 or higher)
   - Download from: https://www.postgresql.org/download/
   - Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=yourpassword -p 5432:5432 -d postgres`

3. **Git** (for downloading the project)
   - Download from: https://git-scm.com/

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

1. Create a `.env` file in the root directory:

```bash
# Copy this content to your .env file

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/betting_simulator

# Session Secret (generate a random string)
SESSION_SECRET=your-super-secret-session-key-here

# OpenAI API Key (required for AI predictions)
OPENAI_API_KEY=your-openai-api-key-here

# Development Settings
NODE_ENV=development
```

2. Replace the values:
   - `username:password` - Your PostgreSQL credentials
   - `betting_simulator` - Your database name
   - `SESSION_SECRET` - Generate a random secret key
   - `OPENAI_API_KEY` - Your OpenAI API key

## Step 4: Set Up the Database

1. **Create the database:**
```sql
-- Connect to PostgreSQL and run:
CREATE DATABASE betting_simulator;
```

2. **Push the schema:**
```bash
npm run db:push
```

## Step 5: Start the Application

```bash
npm run dev
```

The application will be available at: http://localhost:5000

## API Keys Setup

### OpenAI API Key
1. Go to https://platform.openai.com/
2. Create an account or sign in
3. Go to API Keys section
4. Create a new API key
5. Add it to your `.env` file

## Project Structure

```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types and schemas
├── package.json     # Dependencies and scripts
├── .env            # Environment variables
└── README.md       # Project documentation
```

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run db:push      # Push schema changes
npm run db:studio    # Open database studio
```

## Common Issues & Solutions

### Database Connection Issues
- Ensure PostgreSQL is running
- Check your DATABASE_URL in `.env`
- Verify database exists: `psql -l`

### Port Already in Use
- The app uses port 5000 by default
- If occupied, the system will find another available port
- Check the terminal output for the actual port

### Missing OpenAI API Key
- App will work without it but AI predictions won't function
- You can test other features while setting up the API key

### Node Version Issues
- Ensure you're using Node.js 18 or higher
- Use `nvm` to manage Node versions if needed

## Development Tips

1. **Hot Reload**: Changes to client code reload automatically
2. **Server Restart**: Server restarts automatically on changes
3. **Database Changes**: Run `npm run db:push` after schema changes
4. **Logs**: Check browser console and terminal for errors

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in your `.env`
2. Use a production PostgreSQL database
3. Set secure session secrets
4. Consider using PM2 or similar for process management

## Features Available

- ✅ User registration and authentication
- ✅ Virtual bankroll management ($10,000 starting balance)
- ✅ Real sports data from ESPN API
- ✅ AI-powered betting predictions (requires OpenAI API)
- ✅ Comprehensive betting analytics
- ✅ Dark/light theme support
- ✅ Mobile-responsive design

## Need Help?

If you encounter any issues:
1. Check the terminal for error messages
2. Verify all environment variables are set correctly
3. Ensure PostgreSQL is running and accessible
4. Check that all dependencies installed successfully

The application includes demo data and will work even without external APIs for basic functionality testing.