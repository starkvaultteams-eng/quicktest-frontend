**#Quicktest-frontend**

## Latest updates (2026-03-06)

- Added Admin **Sync Questions** button:
  - calls `/api/import`
  - clears local `metadataCache`
  - refreshes admin stats after sync
- Dashboard metadata now fetches fresh data even when cache exists, so newly imported courses (for example `CHM 101`, `CHM 107`) show up without waiting for cache expiry.
- Added helper text under `# Questions`: "You can change the number of questions (1-50)."
- History page now supports paginated backend responses from `/api/my-attempts`
  and includes Previous/Next controls.
- Admin uploads table actions were reworked for desktop so status/action buttons
  no longer collide.
- History page now includes:
  - per-page stats cards (attempt count, average %, best %)
  - course/topic filters
  - cleaner labels without dangling `-` when topic is missing
**React + Vite** single‑page application that serves as the user interface for the
QuickTest student quiz practice platform.  The frontend talks to a Node/Express
backend (included elsewhere in the repo) via a simple JSON API.

---

## Project status & understanding

The application is essentially complete from an MVP perspective.  All routes
exposed by the backend are covered, including:

- `/register`, `/login` – authentication with optional admin secret
- `/questions` – fetches random questions filtered by course/topic/difficulty
  (the frontend passes `course`, `topic`, `difficulty` and `limit` parameters)
- `/metadata` – returns an object containing `courses`, `topics` and
  `difficulties` arrays used to populate the dashboard selectors; the response
  also includes a `topicsByCourse` map so the topic selector can be scoped
  immediately.  This is cached client-side for 15 minutes to avoid
  unnecessarily fetching the entire question set.
- `/submit` – send answers for scoring; the request should be an array of
  `{ questionId, selectedOption }` objects.  The response includes `score`,
  `percentage`, and now `detailedAnswers` (each item contains
  `questionId`, `selectedOption`, `correctOption` and `isCorrect`) so the
  results page can render per-question feedback without needing a second
  round‑trip.
- `/metadata` now also returns an optional `courseTitles` map that pairs
  backend course codes with human‑readable titles (extracted during import
  from the top‑level JSON keys if provided).  Dashboard components use this
  to show both the code and title when available.
- `/my-attempts` – student history
- `/leaderboard` – top 10 users by average score
- `/upload-pdf`, `/my-uploads` – PDF contribution endpoints (students)
  (requires authentication; unauthenticated requests will be redirected to
  the login page by the frontend).
- `/admin/*` – import, statistics and approval APIs for administrators

   answers, handles no‑results situations

3. **Results** – displays score, pass/fail, and a review of each question.
4. **History** – (deprecated) previously showed past attempts; removed in MVP due to display issues. The page is no longer linked from the UI.
5. **Leaderboard** – shows usernames (not raw IDs) and average scores.
6. **Upload** – separate "Contribute Materials" page where students can send
   PDFs (linked from header and dashboard).
7. **Admin** – accessible only to admin accounts; shows stats, question import
   and PDF upload moderation.

Courses on the dashboard are rendered as styled cards (glass‑style boxes) with
icons and outlines for readability.

> **Note:** the current dataset only includes 100‑level courses (100L). These
> are typically identified by codes that start with `100` (e.g. `100MTH` for
> Math 100L). If you add higher‑level courses later you may need to adjust the
> filtering/mapping logic accordingly.

Technical notes:

Technical notes:

- Dark‑only design; theme toggling was removed per specification.
- TailwindCSS with custom colours and utility classes (`glass-card`, etc).
- The DSL for LaTeX is available anywhere within text fields; wrap math or
  plain words in `$` delimiters (the parser leaves unmarked text alone, so
  regular prose isn’t italicised).  This makes it useful for computer science
  notation, pseudocode, or any formatted text, not just equations.
- Questions whose four options are all "N/A" automatically display a free‑
  response textarea instead of radio buttons.
- The quiz API returns `solution_latex` along with questions (but omits the
  correct option).  Solutions are held in state so the **Results** page can
  show step‑by‑step explanations after submission.  Time spent on the quiz and
  average speed (questions per minute) are now measured client-side and shown
  on the results screen.
- Topic dropdown is now scoped to the selected course; choosing a particular
  course limits the topics list to only those seen in the database ("All
  Topics" remains an option).  A contextual note appears under the selector
  when *Math* is picked: “Various topics – see list below when you start the
  quiz.”
- Difficulty selector includes an “All Levels” button; that value is stripped
  before the request so the backend doesn’t try to filter.
- Upload/contribution page includes icons, description text, and styled
  file-picker button; submitted files are listed with icons and statuses.
- Dashboard "Available Courses" section renders each course as a glass-card
  with outline items for better visual organization.
- Course/Topic metadata is fetched once on load from the new `/metadata`
  endpoint and cached in `localStorage` for **15 minutes**; the response now
  includes a `topicsByCourse` object so the topic selector can be filtered
  without fetching any questions.  A spinner appears while loading, and any
  fetch error is surfaced with a message.  Admins can clear this cache via a
  button on the admin page (useful for debugging or after a data import).
- Context providers for authentication (`AuthContext`) and theming
  (`ThemeContext` simplified to always dark).
- API client (`services/api.js`) uses Axios with interceptors for JWT,
  environment‑configurable base URL (`VITE_API_BASE`).  `getQuestions`
  sanitises parameters (ignores `All Topics` sentinel and lower‑cases
  difficulty).
- Icons come from `react-icons` (Material Design set).
- LaTeX support via KaTeX component; all questions/solutions now render math.
- Course name aliasing: some backend course identifiers are displayed with
  friendlier labels (e.g. "Information Literacy" → "Use of Library").
  Mappings live in `src/pages/Dashboard.jsx` and are applied wherever course
  names appear.
- Error logging added to API and components; console messages help tracing.
- Login and register forms perform basic client‑side validation: the submit
  button is disabled until required fields are filled, passwords match and
  meet length requirements, and fields with errors are highlighted with red
  borders.  User‑focused error messages appear above the form.
  
- The header now shows login/sign‑up buttons at all times on desktop rather
  than hiding them until hover, improving discoverability for new users.
- The history page has been removed from the navigation and is no longer part
  of the MVP; if you still need to view past attempts, you can query the
  `/api/my-attempts` endpoint manually.


**Troubleshooting notes:**

  include a `percentage` field computed by the backend, but that value may be
  incorrect if the server mis‑computes it (for example, when there are
  duplicate answers or other edge cases).  The frontend now *always* recalculates
  the percentage on the history page (`Math.round(score/total*100)`) so the
  display matches the raw `score` and `total` values.  The leaderboard relies
  on the backend aggregation (`avgScore`), but the UI no longer blindly adds
  a percent sign.  Behavior is now:
 **History/Leaderboard display** – scores returned from `/my-attempts`
   include a `percentage` field computed by the backend, but that value may be
   incorrect if the server mis‑computes it (for example, when there are
   duplicate answers or other edge cases).  The frontend now *always* recalculates
   the percentage on the history page (`Math.round(score/total*100)`) so the
   display matches the raw `score` and `total` values.  The leaderboard relies
   on the backend aggregation (`avgScore`), but the UI interprets that number intelligently:

     * Values in the 0..1 range are treated as fractions and multiplied by 100
       before display (e.g. `0.92` → `92.00%`).
     * Values greater than 1 and up to 100 are treated as percentages and
       always shown with a `%` suffix (e.g. `85` → `85.00%`).
     * Values over 100 are assumed to be raw point totals and rendered with a
       `pts` suffix (e.g. `150` → `150.00 pts`).

   This ensures that a backend that already returns a percentage (e.g. 90)
   doesn’t end up looking like `90.00` with no unit, while still flagging
   obviously large scores as “points.”  If you prefer a different scheme you
   can adjust `Leaderboard.jsx` or make the server return a consistent scale.

- **Upload page failures** – the student upload page (`/upload`) fetches
  `/api/my-uploads` on load.  If that request fails (for example because
  you're not authenticated or the server is down) the page will show an error
  message instead of redirecting; you can retry the request by refreshing the
  page.  Make sure the backend is running and that the authentication token is
  stored in `localStorage` (login first).  File uploads post to `/api/upload-pdf`
  and require a valid JWT; any server error is logged to the console.

- **404 errors when downloading uploads** – this generally means the path
  returned by `/admin/uploads` (or whatever the upload response provides) does
  not correspond to a file actually served by the backend.  By default the
  Express server exposes `uploads/` via `express.static()`, so make sure
  `VITE_API_BASE` is set correctly (`http://localhost:5000/api` for local dev)
  and that the filename you request lives in the `uploads/` directory.  The
  admin dashboard includes a note about this and constructs a fallback URL from
  the API base when the response doesn’t provide one.

  When you click **Download** in the admin list, the frontend now issues a
  `HEAD` request before attempting to open the file.  If that request returns
  a non‑OK status the row will be flagged `missing` and an alert will explain
  that the server is not serving that path.  This is almost always caused by
  the file having been removed or never written to the `uploads/` directory,
  not by any bug in the client.

- **404 redirects for missing data** – if any of the client pages that fetch
  data (`/history`, `/leaderboard`, `/upload`, `/dashboard`, etc.) receive a
  404 response, the router will automatically redirect the user to the 404
  page.  This ensures that stale links or missing resources don’t leave the
  user staring at a broken form; the catch‑all route handles the redirect.

- **CSP warning from DevTools** – the browser may complain when opening
  `chrome://` or developer‑specific URLs while the app is running.  these are
  harmless and can be ignored; they come from Chrome itself rather than your
  code.

- **Backend development server exit code 127** – if you encounter `npm run
  dev` failing with `127`, make sure you’ve run `npm install` in both the
  frontend and backend directories and that `node`/`npm` are on your PATH.
  (This isn’t a frontend issue but was observed during testing.)

Known issues / behaviour

## Launch readiness

This frontend now implements the full minimal‑viable functionality defined by
the original spec: user registration/login, quiz flow with filtering and
solutions, upload contributions, an admin dashboard for stats and moderation,
leaderboard and metadata caching.  The history page was removed from the UI
because it was prone to confusion and not essential for the initial release.

At this point the application is suitable for MVP launch provided the backend
is stable and the dataset contains at least some 100L questions.  Future
iterations might reintroduce history, add course code visibility, pagination
or richer admin UX, but none of those are blockers for roll‑out.

## Final architecture & key decisions

**Frontend Stack:**
- **React 18** + **Vite** for fast builds and HMR.
- **TailwindCSS** for utility‑first styling; dark mode via `dark:` prefix.
- **React Router v6** for SPA routing with guards (PrivateRoute, AdminRoute).
- **Axios** for HTTP with JWT interceptor and error logging.
- **KaTeX** for LaTeX math rendering in questions and solutions.
- **react‑icons** for icon library (Material Design set).

**State Management:**
- **React Context** for auth (JWT token, user info, login/logout) and theme.
- **Local component state** for forms and UI toggles.
- **localStorage** for session persistence and 15‑minute metadata cache.

**Key features:**
- Questions fetched with course/topic/difficulty filters; server omits correct answer but provides LaTeX solution for post-quiz review.
- Quiz submission returns server-scored results and per-question breakdowns (detailedAnswers).
- Results page normalizes client/server scoring to eliminate display inconsistencies.
- Admin dashboard shows stats, moderates uploads, and can refresh metadata cache.
- Leaderboard intelligently interprets score values (0-1 as %, 1-100 as %, >100 as points).
- Responsive design works on mobile, tablet, and desktop.
- Autocomplete disabled on auth forms to prevent password-manager interference.
- Course labels include 100L year notation and optional title mapping.

**Caching Strategy:**
- Metadata (courses, topics, difficulties, topicsByCourse, courseTitles) cached for 15 minutes.
- Old cache formats migrated gracefully on first read.
- Admin button to clear cache aids debugging after data imports.

**Deployment notes:**
- Set `VITE_API_BASE` environment variable to point to your backend (e.g. `http://localhost:5000/api` locally).
- Build with `npm run build` for production; output goes to `dist/`.
- The frontend is stateless and can be served from any static host (CDN, Netlify, Vercel, traditional web server).
- Ensure backend CORS allows requests from your frontend origin.

No breaking changes to the backend API; all endpoints used match the existing contract.

## Completed for MVP

- [x] User authentication (register/login with JWT)
- [x] Quiz flow (select course/topic/difficulty, take quiz, submit answers)
- [x] Results page with detailed per-question feedback
- [x] Leaderboard with intelligent score interpretation
- [x] Admin dashboard (stats, PDF upload moderation, delete functionality)
- [x] Student upload page (contribute PDFs)
- [x] Responsive design (mobile, tablet, desktop)
- [x] Question filtering by metadata (courses, topics, difficulties)
- [x] Client-side caching of metadata (15min TTL)
- [x] LaTeX rendering for math questions and solutions
- [x] Course code labelling (100L — Year 1 notation)
- [x] Friendly course titles (Mathematics → Math, etc.)
- [x] Download safety checks (HEAD request before open)
- [x] Error handling and 404 redirects
- [x] Dark mode support
- [x] Disabled browser autocomplete on auth forms

## Known limitations & future work

- History page removed (can be re-added if needed; backend data still stored)
- No file preview/thumbnails in admin upload list
- No pagination for large upload lists
- No toast notifications (using alert() instead)
- No email verification or password reset
- No analytics or detailed admin logs

All of the above are enhancements for v2; they do not prevent MVP launch.



- Picking "All Topics" no longer triggers an error; the frontend strips the
  parameter before calling the API.  Previously the backend blindly filtered on
  topic and returned an empty set.
- Quiz questions were sometimes dark on dark backgrounds and overflowed their
  container; global text colour classes and `break-words` fixes have been
  applied.
- The upload functionality has been moved off the dashboard into its own page
  called "Contribute Materials".
- A catch‑all 404 page now handles unknown routes and offers a link back to
  home; the router redirects authenticated users from `/`, `/login`, and
  `/register` to `/dashboard` automatically.
- The leaderboard has been restyled: entries are rendered as cards with rank
  badges, hover feedback, and a spinner during load.  Top three ranks get
  coloured accents (gold/silver/bronze).
  A refresh button is available on the page as well.
- "Learn More" on the landing page scrolls down to the features section
  instead of being a dead button, helping users get oriented quickly.

Admin page improvements
-----------------------

- Admin dashboard now shows a compact, informative stats row with `Total Users`,
  `Quizzes Taken` and `PDF Uploads`. If the backend doesn't return those fields
  directly the UI will show helpful hints and fall back to derived values
  (for example, the uploads count shows the number of files currently listed).
- Uploaded files are displayed in a structured table with columns for filename,
  upload time, status, and actions. Actions include **Download** (follows
  server-provided `url` or constructs a safest-possible fallback; the frontend
  now performs a quick HEAD request before opening to detect missing files and
  will alert if the link returns 404) and **Delete**
  (admin-only, removes the file via the admin API).
- The admin page now logs raw `/admin/stats` and `/admin/uploads` responses to
  the console; if you see `{}` or unexpected shapes you may need to adjust the
  backend.  Empty statistics will render a JSON dump under the cards to help
  debugging, and a warning banner will appear reminding you to supply counts.
- The admin page is resilient to slightly different API response shapes: it
  normalizes arrays and objects returned from `/admin/uploads` and logs
  unexpected shapes to the console to help debugging.

- **Results page changes** – the separate "Correct Solution" box has been
  removed to reduce clutter.  The explanation text below each question now
  serves as the canonical place for the correct answer, and percentages are
  computed by the client rather than relying on potentially buggy backend
  values.  Time spent and average speed are displayed above the question
  review section.

If you want me to further polish the admin page I can:

- Add thumbnails/previews for PDFs.
- Add per-file metadata (uploader username, size) if the backend provides them.
- Add confirmation modals and non-blocking toasts instead of `alert()`.
  The site also enables `scroll-behavior: smooth` so the transition feels
  natural.

Development environment

1. Clone the repo and `cd quicktest-frontend`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   Then open `http://localhost:5173` in your browser.  The backend should be
   running separately (default `http://localhost:5000/api`).
   
  Note: the frontend and backend are separate processes and may be hosted
  on different origins. To make downloads and API requests work correctly,
  set `VITE_API_BASE` to your backend base URL (for local development,
  e.g. `http://localhost:5000/api`). The frontend will construct fallback
  download URLs using the API base (it strips a trailing `/api` if present)
  so the backend must serve uploaded files at `/uploads/<filename>` on the
  same base URL (not under `/api`).
4. To point to a deployed API, create a `.env`/`.env.local` containing
   ```
   VITE_API_BASE=https://your-backend.example.com/api
   ```

A small subset of configuration variables are expected; no build step beyond
Vite is required.

Contribution and testing notes

- Routes are guarded by `PrivateRoute` and `AdminRoute` components.
- When adding new pages, import them in `App.jsx` and add appropriate links to
  the `Header` component.


**Version‑2 / future ideas**

- **File storage** – the current implementation writes PDF uploads to a
  permanent `uploads/` directory on disk and stores only the generated
  filename in MongoDB.  An alternative is to store the raw bytes (base64 or
  Buffer) inside MongoDB itself, which makes replication/backups easier but
  bloats the database and can hurt performance for large files.  Another common
  upgrade path is to move to cloud object storage (S3, GCS, etc.) and keep
  only a URL reference in the DB.  Each approach has trade‑offs around
  scalability, backup complexity, and simplicity of serving; choose based on
  expected storage volume and security requirements.

- **Percentage/leaderboard accuracy** – as noted above, percentages are
  currently pre‑computed and stored.  A more reliable v2 design would compute
  the percentage from the stored `score`/`total` whenever it’s needed, or
  maintain a separate counter of correct answers per user for leaderboard
  queries.  Storing only raw scores plus totals eliminates rounding drift and
  makes historical corrections easier.

- **Improved admin UX** – add non‑blocking toasts, PDF previews, uploader
  usernames, or a pagination/control mechanism for very large upload lists.

- **Client‑side tests** – this repo has no automated testing yet.  A
  future iteration could introduce Jest/React Testing Library for key page
  components and some Cypress/E2E coverage for flows like login/quiz.

- **Accessibility** – run an a11y audit and fix issues such as missing ARIA
  labels or insufficient contrast for dark mode, particularly on the quiz
  and results pages.
- Styling should honour dark mode; use `text-slate-900 dark:text-slate-100` on
  parent containers to avoid illegible content.
- The API methods live in `src/services/api.js`; parameter sanitisation should
  be placed here to keep pages simple.

---

The README will be updated progressively after every change or user correction
as requested, so it now contains an up‑to‑date snapshot of understanding and
features implemented.

