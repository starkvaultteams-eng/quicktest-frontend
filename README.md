# QuickTest Frontend

This is the React + Vite frontend for the QuickTest quiz platform. It provides the user interface for course selection, quizzes, results, history, leaderboard, uploads, admin tools, and the About page.

## Architecture Overview
The frontend is a single-page application that talks to the backend through a JSON API. All quiz and admin features depend on the API and a valid JWT stored in localStorage.

High-level flow:
- Auth via `/login` and `/register`
- Fetch metadata to populate course/topic/difficulty
- Fetch questions or smart review questions
- Submit answers and render results
- Admin syncs question banks and reviews uploads/quality

## Stack
- React
- Vite
- Tailwind CSS
- Axios
- react-icons

## Environment Setup
Create `.env` with:
```
VITE_API_BASE=http://localhost:5000/api
```
If omitted, the app defaults to the deployed backend URL in `src/services/api.js`.

## Run Locally
```bash
npm install
npm run dev
```

## Key Pages
- Dashboard: course/topic/difficulty selection + quiz mode
- Quiz: question delivery + navigation
- Results: score + per-question review
- History: past attempts + filters
- Leaderboard: weekly + all-time
- Upload: student contributions
- Admin: stats, uploads, import, question review
- About: explains modes and question count logic

## Quiz Modes
- Smart Review: prioritizes questions the user previously missed.
- Balanced Topics: spreads questions across topics when All Topics is selected.

## API Integration
Key API usage lives in `src/services/api.js`.

Endpoints used:
- `/metadata` for dashboard course/topic lists
- `/questions` for regular quizzes
- `/questions/review` for smart review
- `/submit` for scoring
- `/my-attempts` for history
- `/leaderboard` for rankings
- `/upload-pdf`, `/my-uploads` for user uploads
- `/admin/*` for admin features

## UX Notes
- If a topic has fewer questions than requested, the backend tops up from the same course.
- Metadata is cached in localStorage for 15 minutes for fast reloads.
- Error boundaries prevent white screens and surface runtime errors.

## Project Structure
- `src/pages`: route-level views
- `src/components`: shared UI components
- `src/services/api.js`: Axios client and API functions
- `src/utils`: helpers (course labels, etc.)

## Deployment
Set `VITE_API_BASE` in your frontend host to point to the deployed backend. Ensure CORS is configured on the backend.
