import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import JobsHub from './pages/JobsHub';
import { lazy, Suspense } from 'react';

const Profile      = lazy(() => import('./pages/Profile'));
const Applications = lazy(() => import('./pages/Applications'));

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } }
});

const Spin = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <span style={{ display: 'inline-block', width: 24, height: 24, border: '2px solid rgba(255,255,255,.15)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
  </div>
);

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to="/jobs" replace />} />
              <Route path="dashboard"    element={<Dashboard />} />
              <Route path="jobs"         element={<JobsHub />} />
              <Route path="matches"      element={<JobsHub />} />
              <Route path="saved"        element={<JobsHub />} />
              <Route path="trends"       element={<JobsHub />} />
              <Route path="salary"       element={<JobsHub />} />
              <Route path="companies"    element={<JobsHub />} />
              <Route path="profile"      element={<Suspense fallback={<Spin />}><Profile /></Suspense>} />
              <Route path="applications" element={<Suspense fallback={<Spin />}><Applications /></Suspense>} />
            </Route>
            <Route path="*" element={<Navigate to="/jobs" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}