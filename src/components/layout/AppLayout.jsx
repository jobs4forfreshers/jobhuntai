// ── src/components/layout/AppLayout.jsx ──
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import './AppLayout.css';

export default function AppLayout() {
  const { isAuth, loading } = useAuth();

  if (loading) return <div className="loading-screen"><span className="spinner" /></div>;
  if (!isAuth)  return <Navigate to="/login" replace />;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
