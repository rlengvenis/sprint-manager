# Sprint Manager

A web application for forecasting and tracking sprint velocity based on team capacity and historical performance.

## Overview

Sprint Manager helps agile teams:
- Set up teams with velocity weights for each member
- Plan sprints with member availability and bank holidays
- Forecast velocity based on historical median performance
- Track actual vs. forecast accuracy
- View sprint history and analytics

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **CORS** enabled for local development

## Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** instance (local or MongoDB Atlas)

## Project Structure

```
sprint-manager/
├── client/           # React frontend application
│   ├── src/
│   │   ├── pages/    # Page components
│   │   ├── services/ # API service layer
│   │   ├── types/    # TypeScript type definitions
│   │   └── utils/    # Utility functions (calculations)
│   └── package.json
├── server/           # Express backend API
│   ├── db/           # Database connection
│   ├── models/       # Mongoose models
│   ├── routes/       # API routes
│   └── package.json
└── README.md
```

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sprint-manager
```

### 2. Setup Backend

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/sprint-manager
# or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/sprint-manager
```

### 3. Setup Frontend

```bash
cd client
npm install
```

## Running the Application

### Start Backend Server

```bash
cd server
npm start
```

The backend API will run on **http://localhost:5001**

### Start Frontend Dev Server

In a new terminal:

```bash
cd client
npm run dev
```

The frontend will run on **http://localhost:5173**

### Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5001/api/health

## Stopping the Application

### Stop Backend
- Press `Ctrl+C` in the terminal running the server

### Stop Frontend
- Press `Ctrl+C` in the terminal running Vite

### Stop All Processes (if running in background)

```bash
# Kill backend (port 5001)
lsof -ti:5001 | xargs kill -9

# Kill frontend (port 5173)
lsof -ti:5173 | xargs kill -9

# Or kill by process name
pkill -f "node.*server/index.js"
pkill -f "vite"
```

## API Endpoints

### Teams
- `GET /api/teams` - List all teams
- `GET /api/teams/default` - Get default team
- `GET /api/teams/:id` - Get team by ID
- `POST /api/teams` - Create new team
- `PATCH /api/teams/:id/default` - Set team as default

### Sprints
- `GET /api/sprints` - List all sprints (optional: `?teamId=X`)
- `GET /api/sprints/current?teamId=X` - Get current active sprint
- `GET /api/sprints/history?teamId=X` - Get completed sprints
- `GET /api/sprints/:id` - Get sprint by ID
- `POST /api/sprints` - Create new sprint
- `PATCH /api/sprints/:id/complete` - Mark sprint as complete with actual velocity

## User Flow

1. **Team Setup** (`/team-setup`)
   - Create a team with name and sprint size (in days)
   - Add team members with velocity weights (e.g., 1.0 = full capacity, 0.8 = 80%)
   - Set team as default

2. **Sprint Planning** (`/planning`)
   - Enter sprint name and bank holidays
   - Input days off for each team member
   - View calculated forecast based on historical median velocity
   - Add optional comments
   - Create sprint

3. **View Forecast** (`/forecast` or `/`)
   - See current active sprint details
   - View forecasted velocity and total days available
   - Mark sprint as complete by entering actual velocity

4. **View History** (`/history`)
   - See all completed sprints in a table
   - Click rows to expand and view full details
   - View summary statistics (average accuracy, median velocity, etc.)

## Deployment

### Backend Deployment (e.g., Heroku, Railway, Render)

1. **Set environment variables:**
   ```
   PORT=5001
   MONGODB_URI=<your-production-mongodb-uri>
   ```

2. **Deploy:**
   - Heroku: `git push heroku main`
   - Railway: Connect GitHub repo and auto-deploy
   - Render: Connect repo and set build command to `cd server && npm install`

3. **Start command:** `node server/index.js`

### Frontend Deployment (e.g., Vercel, Netlify)

1. **Update API URL:**
   
   Edit `client/src/services/api.ts`:
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
   ```

2. **Set environment variable:**
   ```
   VITE_API_URL=https://your-backend.herokuapp.com/api
   ```

3. **Build:**
   ```bash
   cd client
   npm run build
   ```

4. **Deploy:**
   - Vercel: `vercel --prod`
   - Netlify: Drag & drop `client/dist` folder or connect GitHub

### Docker Deployment

Create `Dockerfile` for backend:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --production
COPY server/ .
EXPOSE 5001
CMD ["node", "index.js"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
  
  backend:
    build: .
    ports:
      - "5001:5001"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/sprint-manager
    depends_on:
      - mongodb

volumes:
  mongodb_data:
```

Run with:
```bash
docker-compose up -d
```

## Development

### Linting

```bash
# Frontend
cd client
npm run lint

# Backend (if eslint configured)
cd server
npm run lint
```

### Building for Production

```bash
cd client
npm run build
```

The production build will be in `client/dist/`

## Key Formulas

### Total Days Available
```
Sum of: (sprintSize - memberDaysOff - bankHolidays) × velocityWeight
```

### Forecast Velocity
```
totalDaysAvailable × medianVelocityPerDay
```
- Median velocity per day calculated from all completed sprints
- If no history exists, defaults to 1 point/day

### Accuracy
```
(actualVelocity / forecastVelocity) × 100
```
- Green (95-105%): On target
- Yellow (90-110%): Slightly off
- Red (<90% or >110%): Significantly off

## Troubleshooting

### MongoDB Connection Issues

**Error:** `MongooseServerSelectionError`
- Check MongoDB is running: `mongosh` or `mongo`
- Verify `MONGODB_URI` in `.env`
- For Atlas: Check IP whitelist and credentials

### Port Already in Use

**Error:** `EADDRINUSE`
- Backend: Change `PORT` in `.env` or kill process on port 5001
- Frontend: Vite will automatically use next available port

### CORS Issues

If frontend can't reach backend:
- Verify backend CORS is enabled (already configured in `server/index.js`)
- Check frontend API URL in `client/src/services/api.ts`
- Ensure both servers are running

## Future Enhancements

- [ ] User authentication and team permissions
- [ ] Multiple teams support per user
- [ ] Sprint comparison charts and graphs
- [ ] Export sprint data to CSV
- [ ] Sprint template saving
- [ ] Team member historical performance tracking
- [ ] REST API documentation with Swagger

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

