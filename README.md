# QuickTest Frontend

React + Vite single-page app for the QuickTest quiz platform.

## Stack
- React
- Vite
- Tailwind CSS
- Axios
- react-icons

## Getting Started
```bash
npm install
npm run dev
```

Set API base in `.env`:
```
VITE_API_BASE=http://localhost:5000/api
```

## Key Pages
- Dashboard: quiz setup (course, topic, difficulty, question count)
- Quiz: delivery + navigation
- Results: score + per-question review
- History: past attempts with filters
- Leaderboard: weekly + all-time
- Upload: student materials
- Admin: stats, uploads, question import, quality review
- About: explanation of modes and counts

## Quiz Modes
- Smart Review: pulls previously missed questions first, then tops up.
- Balanced Topics: spreads questions across topics when All Topics is selected.

## API Usage
- `/questions` and `/questions/review` are called via `quizAPI.getQuestions`.
- `balanceTopics=true` and Smart Review are passed from the Dashboard toggles.
- Leaderboard supports `season=weekly|all`.

## Notes
- If a topic has fewer questions than requested, the backend fills from the
  same course (and then other courses if needed) so the count is met.
- Metadata is cached for 15 minutes in `localStorage`.
- Admin can run a question quality scan and review low-quality items.
