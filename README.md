# Milking Tracker

A mobile-friendly milking session tracker with a calm music experience, built with Next.js frontend and Express + MongoDB backend.

## Features

- Start, pause, resume, and stop milking sessions
- Automatically tracks session duration
- Prompts for milk quantity after stopping
- Stores session history in MongoDB
- Displays history in a responsive table
- Plays ambient calming music during the session

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root and add:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/milking_tracker
PORT=4000
```

3. Run the app:

```bash
npm run dev
```

4. Open the frontend:

```text
http://localhost:3000
```

## API

- `GET /sessions` - returns all saved milking sessions
- `POST /sessions` - saves a new session

## Notes

- Replace the ambient audio generation or add an actual music asset in `app/components/useAmbientMusic.js` if desired.
- If you deploy the backend separately, set `NEXT_PUBLIC_API_URL` in `.env.local` for the frontend.
