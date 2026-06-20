# OpenWall

OpenWall is a real-time anonymous message board and sharing space. It features a modern React frontend and a robust Node.js/Express backend with WebSockets for real-time interaction.

## Project Structure

- `client/` - React frontend built with Vite, TailwindCSS, and Zustand.
- `server/` - Express backend with MongoDB (Mongoose) and Socket.io.

## Getting Started

### 1. Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed.

### 2. Setup the Server

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   ```
4. Start the server:
   ```bash
   npm run start
   ```

### 3. Setup the Client

1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## Live Deployment

- **Frontend**: Deployed on [Vercel](https://vercel.com).
- Make sure to set the **Root Directory** to `client` in Vercel's project settings when deploying.
