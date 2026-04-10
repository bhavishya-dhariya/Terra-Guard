# Crisis Command

AI-powered disaster simulation platform for hackathon demos. The backend streams **Gemini** JSON responses to the frontend via SSE, with optional **Hindsight** persistent memory for cross-session personalization.

## Tech stack
- **Frontend**: React + Vite + TypeScript + Tailwind
- **Backend**: Node.js + Express (API proxy)
- **AI**: Gemini (`gemini-2.0-flash`) via `@google/generative-ai`
- **Memory (optional)**: Hindsight (Vectorize) running locally
- **Fallback (optional)**: Groq `llama-3.3-70b-versatile` if Gemini quota hits

## Prerequisites
- Node.js 18+ (you have Node installed already)
- (Optional) Docker if you want Hindsight memory

## Environment setup
Create a `.env` file in the project root (same folder as `package.json`):

```env
GEMINI_API_KEY=your_key_here
GROQ_API_KEY=
PORT=3001
HINDSIGHT_API_URL=http://localhost:8000
HINDSIGHT_BANK_ID=crisis-command-player
```

- Get `GEMINI_API_KEY` from `aistudio.google.com`.
- If you don’t run Hindsight, the app will show **MEMORY BANK OFFLINE** and continue normally.

## Run the app (dev)
Install deps:

```bash
npm install
```

Start both frontend + backend:

```bash
npm run dev
```

Open:
- `http://localhost:5173/` (frontend)
- `http://localhost:3001/api/health` (backend health)

## Start Hindsight (optional, memory sponsor)
Hindsight runs locally on port `8000`.

Docker:

```bash
docker run -p 8000:8000 vectorize/hindsight
```

Alternative (if you installed via Python):

```bash
hindsight serve
```

## Production build
```bash
npm run build
npm run preview
```

## API routes (backend)
- `POST /api/claude/stream`
  - Streams SSE events (Gemini `generateContentStream`)
  - Forces JSON with `generationConfig.responseMimeType = "application/json"`
- `POST /api/claude/complete`
  - Non-streaming completion (used for debrief)
- `POST /api/memory/init`
- `POST /api/memory/retain`
- `POST /api/memory/recall`
- `POST /api/memory/reflect`

## Troubleshooting
- **Backend says missing key**: set `GEMINI_API_KEY` in `.env` and restart `npm run dev`.
- **Memory offline**: start Hindsight, then refresh the page (it will auto-init the bank).
- **Gemini quota/rate limit**: optionally set `GROQ_API_KEY` to allow fallback calls.

## Notes
- The landing page requested earlier is in `landing/index.html` (standalone, deployable).