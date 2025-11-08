# Sprint Manager Server

Backend API for the Sprint Manager application.

## Setup

```bash
npm install
```

## Environment Variables

Create a `.env` file in the server directory:

```env
MONGODB_URI=mongodb://localhost:27017/sprint-manager
PORT=3000
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
- Create 27 historical sprints with realistic data

## Production

```bash
npm run build
npm start
```

