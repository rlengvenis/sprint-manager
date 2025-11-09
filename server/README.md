# Sprint Manager Server

Backend API for the Sprint Manager application.

## Setup

```bash
npm install
```

## Environment Variables

Copy the environment template:

```bash
cp .env.example .env
```

Then edit `.env` with your configuration:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/sprint-manager
NODE_ENV=development
```

## Development

```bash
npm run dev
```

## Testing

```bash
npm test                  # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
```

## Database Seeding

To populate the database with sample team and historical sprint data:

```bash
npm run seed
```

This will:
- Clear existing data
- Create a team with 3 members (Andrew, Maarten, Pawel)
- Create 4 historical sprints from Aug 19, 2025 onwards with realistic data

## Production

```bash
npm run build
npm start
```

