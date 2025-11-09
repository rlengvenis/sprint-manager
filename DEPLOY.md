# Heroku Deployment Guide

This guide covers deploying the Sprint Manager full-stack application to Heroku.

## Prerequisites

1. **Heroku Account**: Sign up at [heroku.com](https://heroku.com)
2. **Heroku CLI**: Install from [devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/articles/heroku-cli)
3. **MongoDB Atlas**: Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) (free tier available)

## Architecture

This deployment uses a **single Heroku app** that:
- Builds the React frontend during deployment
- Serves the built frontend as static files from Express
- Provides API endpoints at `/api/*`
- Uses MongoDB Atlas for the database

## Step-by-Step Deployment

### 1. Set Up MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user (remember the username and password)
3. Whitelist all IPs (0.0.0.0/0) under Network Access for Heroku
4. Get your connection string (looks like: `mongodb+srv://<username>:<password>@cluster.mongodb.net/sprint-manager`)

### 2. Login to Heroku

```bash
heroku login
```

### 3. Create Heroku App

```bash
# From the project root directory
heroku create your-sprint-manager

# Or let Heroku generate a name
heroku create
```

### 4. Set Environment Variables

```bash
# Set MongoDB connection string (use your Atlas connection string)
heroku config:set MONGODB_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/sprint-manager"

# Set Node environment to production
heroku config:set NODE_ENV=production

# Verify configuration
heroku config
```

### 5. Deploy to Heroku

```bash
# Add all files and commit
git add .
git commit -m "feat: configure for Heroku deployment"

# Push to Heroku
git push heroku main
```

If your default branch is `master` instead of `main`:
```bash
git push heroku master
```

### 6. Seed the Database (Optional)

After deployment, seed the database with initial data:

```bash
heroku run npm run seed
```

### 7. Open Your App

```bash
heroku open
```

## Deployment Details

### Build Process

Heroku automatically runs these commands during deployment:
1. `heroku-postbuild`: Builds both client and server
   - Installs client dependencies
   - Builds React app (`client/dist/`)
   - Installs server dependencies
   - Compiles TypeScript to JavaScript (`server/dist/`)

2. `start`: Starts the Express server which serves:
   - API routes at `/api/*`
   - Static React files for all other routes

### Environment Variables

**Required:**
- `MONGODB_URI`: MongoDB connection string (set via `heroku config:set`)
- `NODE_ENV`: Set to `production` (set via `heroku config:set`)

**Optional:**
- `PORT`: Automatically set by Heroku (defaults to 5001 locally)

### File Structure After Build

```
sprint-manager/
├── client/
│   └── dist/              # Built React app (served as static files)
├── server/
│   └── dist/              # Compiled TypeScript (runs on Heroku)
├── Procfile               # Tells Heroku how to start the app
├── package.json           # Root package with build scripts
└── .slugignore            # Files to exclude from deployment
```

## Troubleshooting

### View Logs

```bash
heroku logs --tail
```

### Check Dyno Status

```bash
heroku ps
```

### Restart Dyno

```bash
heroku restart
```

### Test Locally with Production Build

```bash
# Build both client and server
npm run heroku-postbuild

# Set environment variables
export NODE_ENV=production
export MONGODB_URI="your-mongodb-uri"

# Start server
npm start
```

Then visit `http://localhost:5001`

### Common Issues

**Issue: "Application Error" on Heroku**
- Check logs: `heroku logs --tail`
- Verify MongoDB connection string is correct
- Ensure environment variables are set: `heroku config`

**Issue: API calls failing**
- Check that `NODE_ENV=production` is set
- Verify API routes are accessible at `/api/health`

**Issue: Build fails**
- Check Node.js version in `package.json` engines field
- Verify all dependencies are listed in `package.json`
- Check build logs for specific errors

## Updating Your App

After making changes:

```bash
git add .
git commit -m "your commit message"
git push heroku main
```

Heroku will automatically rebuild and redeploy your app.

## Environment-Specific Behavior

### Production (Heroku)
- API calls use relative path `/api`
- Express serves static files from `client/dist`
- React Router handled by Express catch-all route

### Development (Local)
- API calls use `http://localhost:5001/api`
- Client runs on Vite dev server (port 5173)
- Server runs separately (port 5001)

## Scaling

To scale your app:

```bash
# Scale to 1 dyno (free tier)
heroku ps:scale web=1

# Scale to multiple dynos (requires paid plan)
heroku ps:scale web=2
```

## Cost

- **Free Tier**: 550-1000 free dyno hours per month
- **Hobby**: $7/month for 24/7 uptime
- **MongoDB Atlas**: Free tier available (512MB storage)

## Additional Resources

- [Heroku Node.js Documentation](https://devcenter.heroku.com/categories/nodejs-support)
- [Heroku CLI Documentation](https://devcenter.heroku.com/articles/heroku-cli)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)

