// ── src/api/index.js ──
// All API calls to your FastAPI backend.
// Set REACT_APP_API_URL in .env to point at your backend.

import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: BASE,
  timeout: 10000,
});

// Attach JWT token to every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('jhai_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ── AUTH ──
export const authAPI = {
  login:    (email, password) => api.post('/api/auth/login',    { email, password }),
  register: (data)            => api.post('/api/auth/register', data),
  logout:   ()                => api.post('/api/auth/logout'),
  me:       ()                => api.get('/api/auth/me'),
};

// ── JOBS ──
export const jobsAPI = {
  // GET /api/jobs/search?q=...&location=...&exp=...&page=...
  search: (params) => api.get('/api/jobs/search', { params }),

  // GET /api/jobs/:id
  getById: (id) => api.get(`/api/jobs/${id}`),

  // GET /api/jobs/stream  (WebSocket — handled separately)

  // POST /api/jobs/track-click/:id
  trackClick: (id) => api.post(`/api/jobs/track-click/${id}`),

  // GET /api/jobs/suggestions?q=...
  suggestions: (q) => api.get('/api/jobs/suggestions', { params: { q } }),

  // GET /api/matches/personalized
  personalizedMatches: () => api.get('/api/matches/personalized'),
};

// ── SEARCHES ──
export const searchesAPI = {
  save:   (data) => api.post('/api/searches',     data),
  list:   ()     => api.get('/api/searches'),
  delete: (id)   => api.delete(`/api/searches/${id}`),
};

// ── COMPANIES ──
export const companiesAPI = {
  getJobs:  (company) => api.get(`/api/companies/${company}/jobs`),
  watch:    (company) => api.post('/api/companies/watchlist', { company }),
  watchlist: ()       => api.get('/api/companies/watchlist'),
};

// ── USER / PROFILE ──
export const userAPI = {
  getProfile:    ()     => api.get('/api/user/profile'),
  updateProfile: (data) => api.put('/api/user/profile', data),
  uploadResume:  (file) => {
    const form = new FormData();
    form.append('resume', file);
    return api.post('/api/user/resume', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  applications:  ()     => api.get('/api/user/applications'),
  saveJob:       (id)   => api.post(`/api/user/saved-jobs/${id}`),
  savedJobs:     ()     => api.get('/api/user/saved-jobs'),
};

// ── ANALYTICS ──
export const analyticsAPI = {
  hiringTrends: (params) => api.get('/api/analytics/hiring-trends', { params }),
  salaryIntel:  (params) => api.get('/api/analytics/salary',         { params }),
  crawlStatus:  ()       => api.get('/api/analytics/crawl-status'),
  topSkills:    ()       => api.get('/api/analytics/top-skills'),
};

// ── WEBSOCKET (real-time job feed) ──
export function createJobsSocket(onMessage) {
  const WS_URL = (BASE.replace('http', 'ws')) + '/api/jobs/stream';
  const ws = new WebSocket(WS_URL);
  ws.onmessage = (e) => onMessage(JSON.parse(e.data));
  ws.onerror   = (e) => console.error('WS error:', e);
  return ws;
}
