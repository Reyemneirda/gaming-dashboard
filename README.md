# Gaming Dashboard

A personal gaming analytics dashboard that tracks your gaming habits and discovers new games. Built with React, FastAPI, and Firebase.

## What it does

This dashboard helps gamers track their playing time, discover trending games, and compare different titles.
The gaming domain was chosen because it's something I'm genuinely interested in, as making video games is the reason I became a developer.

The app has three main sections:
- **Dashboard**: Shows your gaming stats, trending games, and session tracking
- **Game Library**: Browse and filter games from the RAWG database, you can add some games as your favorite
- **Game Comparison**: Side-by-side comparison of two games with charts

## Tech Stack

**Frontend**: React + TypeScript + Tailwind CSS  
**Backend**: Python FastAPI  
**Database**: Firebase Realtime Database  
**APIs**: RAWG Video Games Database  

## Running the project

### Backend
```bash
cd apps/backend
pip install fastapi uvicorn firebase-admin python-dotenv requests
python main.py
```

### Frontend  
```bash
cd apps/frontend
bun install
bun run dev
```

As a monorepo, you can just be on the root  and run both with
```bash
bun install
bun run dev
```
### Environment setup
You'll need:
- Firebase project with Realtime Database enabled
- RAWG API key (free at rawg.io/apidocs)
- `.env` file in backend with `FIREBASE_CRED=path/to/credentials.json`

## Key features

### Real-time polling
The dashboard updates automatically every 30 seconds on the frontend, with background jobs running every 5 minutes on the server. This keeps trending games and analytics fresh without manual refreshes.

### Trending games
Fetches the latest trending games from RAWG API and caches them. Falls back to mock data if the API is unavailable, so the feature always works.

### Session tracking
You can log your gaming sessions and the app calculates total playtime, average session length, and other metrics. Data persists in Firebase. You just have to add sessions on the dashboard.

### Smart caching
API responses are cached for 5 minutes to reduce load times and API calls. The cache automatically cleans up expired entries.

## Data flow

1. **External data**: RAWG API provides game information and trending data
2. **Backend processing**: FastAPI server fetches, processes, and caches data
3. **Database storage**: Firebase stores user sessions, preferences, and analytics
4. **Real-time updates**: Frontend polls for fresh data every 30 seconds
5. **Background jobs**: Server updates trending games and analytics every 5 minutes

## Database structure

```
/sessions/{game_name}/ - Array of play sessions
/playtime/{game_name} - Total minutes played  
/pinned/games/ - Array of favorited games
/trending_games/ - Cached trending games from API
/analytics/ - Calculated stats and metrics
```

## Development decisions

**Why FastAPI?** Fast to develop with, good async support for API calls, as I am a bit rusty in Python this one seemed to be easy to use and understand.

**Why Firebase?** Real-time database fits the live-updating nature of the dashboard, easy to set up, and good for prototyping, been using it for years.

**Why RAWG API?** Comprehensive game database with good filtering options, free tier available, and tons of datas.

## What I'd add with more time

- Implement testing (jest)
- Monitoring
- User authentication and multi-user support
- More detailed game analytics and recommendations
- Better caching
- More personnal dashboard, with even theming
- Pixel art design and icon.
- Export data to CSV/JSON
- Mobile-responsive improvements

## Project structure

```
gaming-dashboard/
├── apps/
│   ├── backend/          # FastAPI server
│   │   ├── main.py       # API routes and server setup
│   │   └── firebase_service.py  # Database operations
│   └── frontend/         # React app
│       └── src/
│           ├── components/   # React components
│           ├── services/     # API calls and external services
│           └── context/      # State management
└── README.md
```

## Notes

This was built as a technical assessment, focusing on demonstrating full-stack development skills rather than building a production-ready application. The emphasis was on clean code, good architecture, and showing familiarity with modern web development practices.
