// src/components/layout/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const NAV = [
  { section: 'Search' },
  { to: '/dashboard', icon: '⌕',  label: 'Job Search'   },
  { to: '/jobs',      icon: '⊞',  label: 'All Jobs Hub', badge: 'LIVE', badgeColor: 'green' },
  { to: '/matches',   icon: '⚡', label: 'AI Matches'   },
  { to: '/saved',     icon: '◎',  label: 'Saved Searches'},

  { section: 'By Level' },
  { to: '/jobs?level=fresher', icon: '●', label: 'Fresher Jobs',  badge: '0–1yr' },
  { to: '/jobs?level=intern',  icon: '●', label: 'Internships',   badge: 'PPO',  badgeColor: 'purple' },
  { to: '/jobs?level=mid',     icon: '●', label: 'Mid-Level'      },
  { to: '/jobs?level=senior',  icon: '●', label: 'Senior / Lead', badgeColor: 'orange' },
  { to: '/jobs?cat=govt',      icon: '●', label: 'Govt / PSU',    badgeColor: 'red' },

  { section: 'Intelligence' },
  { to: '/trends',    icon: '▲', label: 'Hiring Trends' },
  { to: '/salary',    icon: '◈', label: 'Salary Intel'  },
  { to: '/companies', icon: '⬡', label: 'Company Watch' },

  { section: 'Account' },
  { to: '/profile',       icon: '◉', label: 'My Profile'    },
  { to: '/applications',  icon: '≡', label: 'Applications'  },
];

const BADGE_COLORS = {
  green:  { background: 'var(--accent)', color: '#000' },
  purple: { background: 'var(--a2)',     color: '#fff' },
  orange: { background: 'var(--a3)',     color: '#fff' },
  red:    { background: 'var(--red)',    color: '#fff' },
};

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate   = useNavigate();

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
          <span className="live-dot" /> Live Intelligence
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
                <span className="nav-badge" style={BADGE_COLORS[item.badgeColor] || BADGE_COLORS.green}>
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
        <div className="stat-row"><span>Sources</span><span>Remotive · Muse · More</span></div>
        <div className="stat-row"><span>Backend</span><span style={{color:'var(--warn)'}}>Deploying soon</span></div>
        <div className="stat-row"><span>Search</span><span>Live ✓</span></div>
      </div>
    </aside>
  );
}