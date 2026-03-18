# JobHuntAI — React Frontend

Full-stack AI job intelligence platform. React frontend + FastAPI backend.

---

## Project Structure

```
src/
├── api/
│   └── index.js          ← All API calls (axios). Point to your FastAPI.
├── context/
│   └── AuthContext.jsx   ← JWT auth state, login/register/logout
├── hooks/
│   ├── useJobs.js        ← TanStack Query hooks for jobs, matches, crawl
│   ├── useFilters.js     ← Filter state + API param builder
│   └── useWebSocket.js   ← WebSocket live job feed
├── components/
│   ├── layout/
│   │   ├── AppLayout.jsx ← Protected route wrapper + sidebar
│   │   └── Sidebar.jsx   ← Nav sidebar with all links
│   └── jobs/
│       ├── JobCard.jsx   ← Reusable job card component
│       └── FilterBar.jsx ← All filter chips (exp, work, salary, city, company)
├── pages/
│   ├── Login.jsx         ← Sign in / Sign up (tabs)
│   ├── Dashboard.jsx     ← Main search dashboard
│   ├── JobsHub.jsx       ← All Jobs Hub (freshers to experienced)
│   ├── JobDetail.jsx     ← Single job detail + AI insights
│   ├── Profile.jsx       ← User profile + resume upload
│   └── Applications.jsx  ← Application tracker
└── utils/
    └── mockData.js       ← Mock jobs (replace with real API)
```

---

## Quick Start

```bash
# 1. Install
npm install

# 2. Set environment
cp .env.example .env
# Edit REACT_APP_API_URL to your FastAPI URL

# 3. Run (uses mock data by default)
npm start
```

Open http://localhost:3000 — bypasses auth in dev mode, goes straight to /jobs.

---

## Connect to FastAPI Backend

### Step 1 — Point the API URL
```bash
# .env
REACT_APP_API_URL=http://localhost:8000    # local
REACT_APP_API_URL=https://api.jobhuntai.com  # production
```

### Step 2 — Enable real auth
In `Login.jsx`, remove the dev bypass:
```js
// Delete these lines:
if (process.env.NODE_ENV === 'development') { navigate('/jobs'); return; }
```

### Step 3 — Swap mock data for real API
In `JobsHub.jsx`, replace:
```js
// MOCK (delete this)
const jobs = MOCK_JOBS.filter(...)

// REAL (uncomment this)
const { data, fetchNextPage, hasNextPage, isLoading } = useJobSearch(apiParams);
const jobs = data?.pages.flatMap(p => p.jobs) ?? [];
```

### FastAPI endpoints expected

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | `{email, password}` → `{token, user}` |
| POST | `/api/auth/register` | `{firstName, lastName, email, password, role}` → `{token, user}` |
| GET  | `/api/auth/me` | Bearer token → user object |
| GET  | `/api/jobs/search` | `?q=&category=&level=&work_type=&salary_min=&salary_max=&locations=&sort_by=&page=` |
| GET  | `/api/jobs/:id` | Single job detail |
| POST | `/api/jobs/track-click/:id` | Analytics |
| GET  | `/api/matches/personalized` | Auth required → ranked matches |
| GET  | `/api/analytics/crawl-status` | Crawl status per source |
| GET  | `/api/analytics/top-skills` | Top skills in current results |
| WS   | `/api/jobs/stream` | WebSocket → real-time job feed |
| POST | `/api/user/resume` | Multipart resume upload |
| GET/PUT | `/api/user/profile` | Get / update user profile |

### Expected job object shape
```json
{
  "id": "uuid",
  "title": "Senior Python Developer",
  "company": "Swiggy",
  "location": "Hyderabad",
  "level": "senior",
  "categories": ["it", "senior"],
  "source": "LinkedIn",
  "work_type": "Hybrid",
  "remote": false,
  "experience_range": "3–5 yrs",
  "salary_display": "₹20–28 LPA",
  "salary_min": 2000000,
  "salary_max": 2800000,
  "company_rating": "4.2",
  "company_stage": "Series H",
  "deadline": "2024-07-30",
  "ai_score": 97,
  "is_new": true,
  "posted_ago": "4m ago",
  "is_hot": true,
  "applicant_count": 43,
  "skills": [
    { "name": "Python", "match": true },
    { "name": "FastAPI", "match": true },
    { "name": "Redis", "match": false }
  ],
  "apply_url": "https://careers.swiggy.com/job/123"
}
```

---

## Deploy to Netlify

```bash
# Build
npm run build

# Option A — Drag & drop
# Go to netlify.com/drop → drag the /build folder

# Option B — CLI
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

`netlify.toml` already handles SPA routing (all routes → index.html).

---

## Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

---

## Tech Stack

| Layer | Tech |
|-------|------|
| UI Framework | React 18 |
| Routing | React Router v6 |
| Data Fetching | TanStack Query v5 |
| HTTP Client | Axios |
| Charts | Recharts |
| Icons | Lucide React |
| Styling | Plain CSS (design tokens in index.css) |
| Build | Create React App |

---

## Backend (FastAPI) — Quick Reference

```python
# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://yourdomain.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount your routers
from routers import auth, jobs, user, analytics
app.include_router(auth.router,      prefix="/api/auth")
app.include_router(jobs.router,      prefix="/api/jobs")
app.include_router(user.router,      prefix="/api/user")
app.include_router(analytics.router, prefix="/api/analytics")
```

---

## Pages & Routes

| Route | Page | Auth |
|-------|------|------|
| `/login` | Login / Sign Up | Public |
| `/dashboard` | Search dashboard | Protected |
| `/jobs` | All Jobs Hub | Protected |
| `/jobs/:id` | Job detail | Protected |
| `/profile` | User profile | Protected |
| `/applications` | Application tracker | Protected |
| `/matches` | AI personalized matches | Protected |
