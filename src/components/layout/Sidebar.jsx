// ── src/components/layout/Sidebar.jsx ──
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const NAV = [
  { section: 'Search' },
  { to: '/dashboard',   icon: '⌕',  label: 'Job Search',    badge: '1.2M' },
  { to: '/jobs',        icon: '⊞',  label: 'All Jobs Hub',  badge: '5,847', badgeColor: 'green' },
  { to: '/matches',     icon: '⚡', label: 'AI Matches',    badge: '38',    badgeColor: 'purple' },
  { to: '/saved',       icon: '◎',  label: 'Saved Searches' },

  { section: 'By Level' },
  { to: '/jobs?level=fresher', icon: '●', label: 'Fresher Jobs',  badge: '1,243' },
  { to: '/jobs?level=intern',  icon: '●', label: 'Internships',   badge: '387',  badgeColor: 'purple' },
  { to: '/jobs?level=mid',     icon: '●', label: 'Mid-Level',     badge: '2,814' },
  { to: '/jobs?level=senior',  icon: '●', label: 'Senior / Lead', badge: '1,403', badgeColor: 'orange' },
  { to: '/jobs?cat=govt',      icon: '●', label: 'Govt / PSU',    badge: '156',  badgeColor: 'red' },

  { section: 'Intelligence' },
  { to: '/trends',   icon: '▲', label: 'Hiring Trends' },
  { to: '/salary',   icon: '◈', label: 'Salary Intel' },
  { to: '/companies',icon: '⬡', label: 'Company Watch' },

  { section: 'Account' },
  { to: '/profile',      icon: '◉', label: 'My Profile' },
  { to: '/applications', icon: '≡', label: 'Applications' },
];

const BADGE_COLORS = {
  green:  { bg: 'var(--accent)', color: '#000' },
  purple: { bg: 'var(--a2)',     color: '#fff' },
  orange: { bg: 'var(--a3)',     color: '#fff' },
  red:    { bg: 'var(--red)',    color: '#fff' },
  default:{ bg: 'var(--accent)', color: '#000' },
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-text">Job<span>Hunt</span>AI</div>
        <div className="logo-sub">
          <span className="live-dot" />
          Live Intelligence
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV.map((item, i) =>
          item.section ? (
            <div key={i} className="nav-section">{item.section}</div>
          ) : (
            <NavLink
              key={i}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge && (
                <span
                  className="nav-badge"
                  style={BADGE_COLORS[item.badgeColor || 'default']}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          )
        )}

        <button className="nav-item nav-logout" onClick={handleLogout}>
          <span className="nav-icon">→</span>
          <span className="nav-label">Sign Out</span>
        </button>
      </nav>

      {/* Footer stats */}
      <div className="sidebar-stats">
        <div className="stat-row"><span>Indexed jobs</span><span className="accent">1,247,843</span></div>
        <div className="stat-row"><span>Last crawl</span><span className="accent">2m ago</span></div>
        <div className="stat-row"><span>Sources active</span><span className="accent">14 / 16</span></div>
        <div className="stat-row"><span>Search latency</span><span className="accent">87ms</span></div>
      </div>
    </aside>
  );
}
