# Jellyfin Analytics Dashboard

A comprehensive analytics dashboard for Jellyfin media server that provides insights into user activity, content consumption, and server statistics.

## Features

- **User Analytics**: Track most active users and viewing patterns
- **Content Statistics**: Monitor most watched content and popularity trends
- **Real-time Monitoring**: Live session tracking and activity timeline
- **Responsive Design**: Modern UI with Tailwind CSS
- **Docker Support**: Easy deployment with Docker Compose

## Tech Stack

- **Backend**: Node.js 20 LTS + Express + TypeScript
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **API Client**: Axios for Jellyfin REST API integration
- **Charts**: Recharts for data visualization

## ⚡ Quick Start

### One-Command Deployment

```bash
git clone <repository-url>
cd jellyfin-analytics
docker compose up
```

**That's it!** 🎉

- **Dashboard**: `http://localhost:3000`
- **Setup**: Configure Jellyfin in Settings tab
- **Zero Config**: All directories and database created automatically

### Alternative: Manual Setup

### Option 2: Local Development

1. **Setup Project**

   ```bash
   # Windows
   .\scripts\setup.ps1

   # Linux/macOS
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```

2. **Configure Jellyfin**
   Use the Settings page in the web UI to configure your Jellyfin server

3. **Start Development Server**

   ```bash
   npm run dev
   ```

4. **Optional: Seed Sample Data**
   ```bash
   npm run db:seed
   ```

## Configuration

### UI-Based Configuration (Recommended)

Configure your Jellyfin server through the Settings page in the web interface:

- **Jellyfin Server URL**: Your Jellyfin server address (e.g., http://localhost:8096)
- **API Key**: Generated from your Jellyfin server's API Keys section
- **Sync Interval**: How often to fetch data from Jellyfin (default: 5 minutes)

### Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)
- `DATABASE_URL`: SQLite database path
- `ENCRYPTION_KEY`: Key for encrypting sensitive settings (generate a secure key for production)

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start backend server with hot reload
npm run dev:client       # Start frontend development server
npm run build           # Build both frontend and backend for production
npm run start           # Start production server

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema to database
npm run db:migrate      # Run database migrations
npm run db:studio       # Open Prisma Studio
npm run db:seed         # Seed database with sample data

# Docker
npm run docker:build    # Build Docker image
npm run docker:up       # Start with docker-compose
npm run docker:down     # Stop docker containers

# Utilities
npm run clean           # Clean build artifacts
npm run lint            # Run frontend linting
```

### Project Structure

```
jellyfin-analytics/
├── server/             # Express.js backend
│   ├── app.ts         # Main application entry
│   ├── routes/        # API route handlers
│   ├── services/      # Business logic services
│   └── models/        # Database models
├── client/            # React frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── hooks/     # Custom React hooks
│   │   └── types/     # TypeScript type definitions
│   └── public/        # Static assets
├── prisma/            # Database schema and migrations
├── scripts/           # Setup and utility scripts
├── data/              # SQLite database files
└── logs/              # Application logs
```

### Getting Jellyfin API Key

1. Login to your Jellyfin server as administrator
2. Go to Dashboard → Advanced → API Keys
3. Click "New API Key"
4. Enter a name (e.g., "Analytics Dashboard")
5. Copy the generated API key to your `.env` file

## API Endpoints

- `GET /api/dashboard/overview` - Dashboard overview stats
- `GET /api/users/stats` - User activity statistics
- `GET /api/content/stats` - Content consumption statistics
- `GET /health` - Health check endpoint

## License

MIT
