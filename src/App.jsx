// ── src/App.jsx ──
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';

// Pages
import Login     from './pages/Login';
import Dashboard from './pages/Dashboard';
import JobsHub   from './pages/JobsHub';

// Lazy-loaded pages (code-split)
import { lazy, Suspense } from 'react';
const JobDetail    = lazy(() => import('./pages/JobDetail'));
const Profile      = lazy(() => import('./pages/Profile'));
const Applications = lazy(() => import('./pages/Applications'));

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const Spin = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <span className="spinner" style={{ width: 24, height: 24, borderColor: 'rgba(255,255,255,.15)', borderTopColor: 'var(--accent)', display: 'inline-block', borderWidth: 2, borderStyle: 'solid', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
  </div>
);

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />

            {/* Protected — all wrapped in AppLayout (sidebar) */}
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to="/jobs" replace />} />
              <Route path="dashboard"    element={<Dashboard />} />
              <Route path="jobs"         element={<JobsHub />} />
              <Route path="jobs/:id"     element={<Suspense fallback={<Spin />}><JobDetail /></Suspense>} />
              <Route path="profile"      element={<Suspense fallback={<Spin />}><Profile /></Suspense>} />
              <Route path="applications" element={<Suspense fallback={<Spin />}><Applications /></Suspense>} />
              <Route path="matches"      element={<JobsHub />} />
              <Route path="saved"        element={<JobsHub />} />
              <Route path="trends"       element={<Dashboard />} />
              <Route path="salary"       element={<Dashboard />} />
              <Route path="companies"    element={<Dashboard />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/jobs" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
