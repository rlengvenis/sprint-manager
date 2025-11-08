# Sprint Manager

A web application for forecasting and tracking sprint velocity based on team capacity and historical performance.

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM

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

## How to Start the Application

### 1. Setup Backend

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/sprint-manager
```

### 2. Setup Frontend

```bash
cd client
npm install
```

### 3. Start Backend Server

```bash
cd server
npm start
```

Backend runs on **http://localhost:5001**

### 4. Start Frontend Dev Server

In a new terminal:

```bash
cd client
npm run dev
```

Frontend runs on **http://localhost:5173**

### 5. Access the Application

Open your browser: **http://localhost:5173**

