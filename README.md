# Crisis Command

AI-powered disaster simulation platform for hackathon demos. The backend streams **Gemini** JSON responses to the frontend via SSE, with optional **Hindsight** persistent memory for cross-session personalization.

## What this game does (in one sentence)
**Crisis Command** is a browser-based emergency decision simulator where an AI “Disaster Engine” narrates a live crisis, generates 4 choices per round, and grades your performance after 10 rounds based on lives saved/lost, speed, and threat control.

## Why it exists (what it’s for)
- **Training under pressure**: practice triage, evacuation timing, communication, and resource allocation with time limits.
- **Consequence-driven learning**: every choice produces explicit casualty deltas and escalating/defusing threat.
- **Repeatable practice**: scenarios are dynamic, not a fixed script.
- **Memory-aware coaching (optional)**: with Hindsight running, the system can recall your prior patterns and call out recurring mistakes across sessions.

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

## First run checklist (2 minutes)
1. Create `.env` with `GEMINI_API_KEY`
2. Run `npm install`
3. Run `npm run dev`
4. Open `http://localhost:5173/`

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

## How to play
1. **Home** → click **ENTER SIMULATION**
2. **Role Select**
   - Choose a role:
     - **Citizen**: personal survival decisions (small-scale impact)
     - **Coordinator**: deploy ambulances/teams/helicopters (mid-scale impact)
     - **Official**: policy + public messaging + agencies (large-scale impact)
   - Choose a disaster scenario (earthquake, flood, cyclone, etc.)
   - Click **DEPLOY TO CRISIS**
3. **Game (10 rounds)**
   - Each round has a **30s timer** and **4 choices (A–D)**.
   - Pick quickly for a speed bonus; if time runs out, the game auto-selects the worst option and penalizes XP.
   - Track:
     - **Lives Saved / Lives Lost**
     - **XP**
     - **Threat meter (1–10)**
     - **Event log** (what happened and why)
4. **Debrief**
   - After round 10, the game generates an **After Action Report** with your grade (S/A/B/C/D) and recommendations.
   - If Hindsight is active, it appends **COMMANDER PROFILE (HINDSIGHT MEMORY)** based on your cross-session history.
5. **Leaderboard**
   - Top scores are stored locally (browser storage).

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
- **No narration/choices**: verify backend is running (`http://localhost:3001/api/health`) and your `.env` has a valid `GEMINI_API_KEY`.

## Notes
- The landing page requested earlier is in `landing/index.html` (standalone, deployable).