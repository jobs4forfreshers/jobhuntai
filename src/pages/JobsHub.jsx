// ── src/pages/JobsHub.jsx ──
import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useJobSearch, useCrawlStatus, useTopSkills } from '../hooks/useJobs';
import { useLiveJobs } from '../hooks/useWebSocket';
import { useFilters } from '../hooks/useFilters';
import JobCard from '../components/jobs/JobCard';
import FilterBar from '../components/jobs/FilterBar';
import './JobsHub.css';

// ── Mock data — swap for real API data ──
import { MOCK_JOBS } from '../utils/mockData';

const CATEGORIES = [
  { key: 'all',     label: 'All Jobs',       count: '5,847' },
  { key: 'fresher', label: '🟢 Freshers',    count: '1,243' },
  { key: 'intern',  label: '🟣 Internships', count: '387'   },
  { key: 'it',      label: '💻 IT / Software',count: '2,104' },
  { key: 'data',    label: '🤖 Data / AI',   count: '634'   },
  { key: 'nonit',   label: '📊 Non-IT',      count: '891'   },
  { key: 'govt',    label: '🏛 Govt / PSU',  count: '156'   },
  { key: 'senior',  label: '🔶 Senior',      count: '432'   },
];

const SOURCES = [
  'LinkedIn','Naukri','Indeed','Company Portals',
  'Internshala','FreshersWorld','Shine','Sarkari/UPSC',
  'AngelList','Upwork','X / Twitter','Reddit',
];

export default function JobsHub() {
  const [searchParams] = useSearchParams();
  const { filters, setFilter, toggleArrayFilter, reset, apiParams, activeCount } = useFilters();
  const [showFilters, setShowFilters] = useState(true);
  const [activeSources, setActiveSources] = useState(new Set(SOURCES));

  const toggleSource = useCallback((src) => {
    setActiveSources(prev => {
      const n = new Set(prev);
      n.has(src) ? n.delete(src) : n.add(src);
      return n;
    });
  }, []);

  // ── Use MOCK_JOBS for now — replace with useJobSearch(apiParams) ──
  const jobs = MOCK_JOBS.filter(j => {
    const cat = filters.category;
    if (cat === 'all') return true;
    return j.categories?.includes(cat) || j.level === cat;
  });

  const { liveJobs, connected } = useLiveJobs();
  const { data: crawlData }     = useCrawlStatus();

  return (
    <div className="jobs-hub">

      {/* ── HERO ── */}
      <div className="hub-hero">
        <div className="hero-top">
          <div>
            <h1 className="hero-title">
              All Jobs Hub — <span>Freshers to Experienced</span>
            </h1>
            <p className="hero-sub">
              <span className="live-dot" style={{ marginRight: 6 }} />
              Live-indexed from 16 sources · LinkedIn · Naukri · Indeed · Company Portals · Govt Sites · More
            </p>
          </div>
          <div className="live-counts">
            <div>
              <div className="lc-val accent">5,847</div>
              <div className="lc-lbl">Jobs live now</div>
            </div>
            <div className="divider-v" style={{ height: 36, margin: '0 12px' }} />
            <div>
              <div className="lc-val" style={{ color: 'var(--warn)' }}>+247</div>
              <div className="lc-lbl">Added today</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="search-row">
          <div className="search-wrap">
            <span className="s-icon">⌕</span>
            <input
              className="input s-input"
              type="text"
              value={filters.q}
              onChange={e => setFilter('q', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setFilter('q', e.target.value)}
              placeholder="Search role, skill, company, city… e.g. 'Python fresher Hyderabad'"
            />
          </div>
          <button className="btn btn-primary">Search ↵</button>
          <button
            className={`btn ${showFilters ? 'btn-active' : ''}`}
            onClick={() => setShowFilters(v => !v)}
          >
            ⚙ Filters {activeCount > 0 && <span className="filter-count">{activeCount}</span>}
          </button>
        </div>

        {/* Source pills */}
        <div className="source-pills">
          {SOURCES.map(src => (
            <button
              key={src}
              className={`src-pill ${activeSources.has(src) ? 'on' : ''}`}
              onClick={() => toggleSource(src)}
            >
              <span className="src-dot" />
              {src}
            </button>
          ))}
        </div>
      </div>

      {/* ── CATEGORY TABS ── */}
      <div className="cat-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            className={`cat-tab ${filters.category === cat.key ? 'active' : ''}`}
            onClick={() => setFilter('category', cat.key)}
          >
            {cat.label}
            <span className="cat-count">{cat.count}</span>
          </button>
        ))}
      </div>

      {/* ── FILTER BAR ── */}
      {showFilters && (
        <FilterBar
          filters={filters}
          toggleArrayFilter={toggleArrayFilter}
          setFilter={setFilter}
          reset={reset}
          activeCount={activeCount}
        />
      )}

      {/* ── CONTENT ── */}
      <div className="hub-content">

        {/* Jobs list */}
        <div className="jobs-col">
          <div className="sort-row">
            <div className="result-info mono text-sm muted">
              <strong style={{ color: 'var(--text)' }}>{jobs.length.toLocaleString()}</strong> jobs ·{' '}
              {CATEGORIES.find(c => c.key === filters.category)?.label || 'All categories'}
            </div>
            <div className="sort-btns">
              {['AI Relevance','Newest','Salary ↑','Deadline'].map(s => (
                <button
                  key={s}
                  className={`sort-btn ${filters.sortBy === s.toLowerCase().replace(' ','_') ? 'on' : ''}`}
                  onClick={() => setFilter('sortBy', s.toLowerCase().replace(' ','_'))}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {jobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">⌕</div>
              <div>No jobs found matching your filters</div>
              <button className="btn btn-sm" onClick={reset}>Clear filters</button>
            </div>
          ) : (
            jobs.map((job, i) => (
              <JobCard key={job.id} job={job} style={{ animationDelay: `${i * 0.04}s` }} />
            ))
          )}

          <div className="load-more">
            Showing <strong>{jobs.length}</strong> of <strong>5,847</strong> ·{' '}
            <span className="accent" style={{ cursor: 'pointer' }}>Load 20 more ↓</span>
          </div>
        </div>

        {/* Right panel */}
        <div className="right-col">
          <LiveFeed jobs={liveJobs} connected={connected} />
          <QuickStats />
          <CrawlStatus />
          <TrendingRoles />
          <AlertSetup />
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function LiveFeed({ jobs, connected }) {
  return (
    <div className="card r-panel">
      <div className="section-head">
        <span className="section-label">
          <span className="live-dot" style={{ marginRight: 6 }} />
          Live Feed
        </span>
        <span className="text-xs muted">{connected ? '● connected' : '○ connecting…'}</span>
      </div>
      {jobs.length === 0 && (
        <div className="text-xs muted" style={{ padding: '8px 0' }}>
          Waiting for live jobs…
        </div>
      )}
      {jobs.map((job, i) => (
        <div key={i} className="live-item">
          <span className="live-dot" style={{ flexShrink: 0, marginTop: 4 }} />
          <div>
            <div style={{ fontSize: 12, color: 'var(--text)' }}>{job.title} @ {job.company}</div>
            <div className="text-xs muted">{job.location} · {job.salary_display} · just now</div>
          </div>
        </div>
      ))}
      {/* Placeholder live items when WS not connected */}
      {jobs.length === 0 && [
        { title: 'Senior Python Dev', co: 'Razorpay', loc: 'Hyderabad', s: '₹22–30L' },
        { title: 'Backend Engineer',  co: 'Meesho',   loc: 'Remote',    s: '₹18–26L' },
        { title: 'Data Scientist',    co: 'Groww',    loc: 'Bangalore', s: '₹20–28L' },
      ].map((j, i) => (
        <div key={i} className="live-item">
          <span className="live-dot" style={{ flexShrink: 0, marginTop: 4, background: i === 1 ? 'var(--a2)' : 'var(--accent)' }} />
          <div>
            <div style={{ fontSize: 12, color: 'var(--text)' }}>{j.title} @ {j.co}</div>
            <div className="text-xs muted">{j.loc} · {j.s} · {i + 1}m ago</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function QuickStats() {
  const stats = [
    { val: '1,243', lbl: '🟢 Fresher jobs', color: 'var(--accent)' },
    { val: '387',   lbl: '🟣 Internships',  color: 'var(--a2)' },
    { val: '2,104', lbl: '💻 IT / Software' },
    { val: '634',   lbl: '🤖 Data / AI' },
    { val: '891',   lbl: '📊 Non-IT' },
    { val: '156',   lbl: '🏛 Govt / PSU',   color: 'var(--warn)' },
  ];
  return (
    <div className="card r-panel">
      <div className="section-label" style={{ marginBottom: 12 }}>Live Counts</div>
      <div className="qs-grid">
        {stats.map(s => (
          <div key={s.lbl} className="qs-box">
            <div className="qs-val" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs muted">{s.lbl}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CrawlStatus() {
  const sources = [
    { name: 'LinkedIn',       status: 'ok',   time: '2m ago',  count: '+143' },
    { name: 'Naukri.com',     status: 'ok',   time: '4m ago',  count: '+89'  },
    { name: 'Indeed India',   status: 'ok',   time: '7m ago',  count: '+67'  },
    { name: 'Internshala',    status: 'ok',   time: '5m ago',  count: '+38'  },
    { name: 'FreshersWorld',  status: 'ok',   time: '9m ago',  count: '+54'  },
    { name: 'Company Portals',status: 'warn', time: 'Rate limit',count: '+12' },
    { name: 'Sarkari / UPSC', status: 'ok',   time: '15m ago', count: '+8'   },
    { name: 'X / Twitter',    status: 'err',  time: 'API down',count: '—'    },
  ];
  const DOT = { ok: 'var(--accent)', warn: 'var(--warn)', err: 'var(--dim)' };
  return (
    <div className="card r-panel">
      <div className="section-head">
        <span className="section-label">Source Status</span>
        <span className="text-xs accent">14/16 live</span>
      </div>
      {sources.map(s => (
        <div key={s.name} className="crawl-row">
          <span className="text-sm">{s.name}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: DOT[s.status], display: 'inline-block' }} />
            <span className="text-xs muted">{s.time}</span>
            <span className="text-xs accent mono">{s.count}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function TrendingRoles() {
  const roles = [
    { name: 'Python Developer', n: 892, pct: 90 },
    { name: 'Data Analyst',     n: 753, pct: 76 },
    { name: 'React Developer',  n: 641, pct: 65 },
    { name: 'HR Executive',     n: 532, pct: 54 },
    { name: 'ML Engineer',      n: 437, pct: 44 },
    { name: 'Digital Marketing',n: 354, pct: 36 },
    { name: 'Java Developer',   n: 287, pct: 29 },
  ];
  return (
    <div className="card r-panel">
      <div className="section-label" style={{ marginBottom: 12 }}>Trending Roles Today</div>
      {roles.map((r, i) => (
        <div key={r.name} className="trend-row">
          <span className="text-xs muted mono" style={{ width: 16 }}>{i + 1}</span>
          <span className="text-sm" style={{ flex: 1 }}>{r.name}</span>
          <div className="trend-bar">
            <div className="trend-fill" style={{ width: `${r.pct}%` }} />
          </div>
          <span className="text-xs muted mono">{r.n}</span>
        </div>
      ))}
    </div>
  );
}

function AlertSetup() {
  const [sent, setSent] = useState(false);
  return (
    <div className="alert-box">
      <div className="alert-title">
        <span className="live-dot" />
        Set Job Alert
      </div>
      <p className="alert-body">Get notified the moment matching jobs are posted.</p>
      <input className="input" style={{ marginTop: 10 }} placeholder="Role: e.g. Python Fresher Hyderabad" />
      <input className="input" style={{ marginTop: 6 }} type="email" placeholder="Your email address" />
      <button
        className="alert-btn"
        onClick={() => setSent(true)}
      >
        {sent ? '✓ Alert created!' : '🔔 Create Alert'}
      </button>
    </div>
  );
}
