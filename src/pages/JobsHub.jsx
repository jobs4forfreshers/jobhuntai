// src/pages/JobsHub.jsx — Updated with REAL live jobs from APIs
import { useState, useEffect, useCallback } from 'react';
import { useFilters } from '../hooks/useFilters';
import { fetchAllLiveJobs } from '../api/liveJobs';
import JobCard from '../components/jobs/JobCard';
import FilterBar from '../components/jobs/FilterBar';
import './JobsHub.css';

const CATEGORIES = [
  { key: 'all',     label: 'All Jobs',        count: null },
  { key: 'fresher', label: '🟢 Freshers',     count: null },
  { key: 'intern',  label: '🟣 Internships',  count: null },
  { key: 'it',      label: '💻 IT / Software',count: null },
  { key: 'data',    label: '🤖 Data / AI',    count: null },
  { key: 'nonit',   label: '📊 Non-IT',       count: null },
  { key: 'senior',  label: '🔶 Senior',       count: null },
];

const SOURCES = [
  'RemoteOK','Jobicy','LinkedIn','Naukri',
  'Indeed','Internshala','FreshersWorld','AngelList',
];

export default function JobsHub() {
  const { filters, setFilter, toggleArrayFilter, reset, activeCount } = useFilters();
  const [showFilters, setShowFilters] = useState(true);
  const [allJobs,     setAllJobs]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page,        setPage]        = useState(20);

  // ── Fetch live jobs ──
  const loadJobs = useCallback(async (q = '') => {
    setLoading(true);
    setError('');
    try {
      const jobs = await fetchAllLiveJobs(q);
      setAllJobs(jobs);
    } catch (e) {
      setError('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadJobs(''); }, [loadJobs]);

  // ── Filter jobs ──
  const filtered = allJobs.filter(job => {
    const cat = filters.category;
    if (cat !== 'all') {
      const match = job.categories?.includes(cat) || job.level === cat;
      if (!match) return false;
    }
    if (filters.level?.length) {
      if (!filters.level.includes(job.level)) return false;
    }
    if (filters.workType?.length) {
      const wt = job.work_type?.toLowerCase();
      const match = filters.workType.some(w =>
        w === 'remote' ? job.remote : wt?.includes(w)
      );
      if (!match) return false;
    }
    return true;
  });

  const displayed = filtered.slice(0, page);

  // ── Category counts ──
  const counts = CATEGORIES.reduce((acc, c) => {
    acc[c.key] = c.key === 'all'
      ? allJobs.length
      : allJobs.filter(j => j.categories?.includes(c.key) || j.level === c.key).length;
    return acc;
  }, {});

  const handleSearch = () => loadJobs(searchInput);

  return (
    <div className="jobs-hub">

      {/* HERO */}
      <div className="hub-hero">
        <div className="hero-top">
          <div>
            <h1 className="hero-title">
              All Jobs Hub — <span>Live from the Web</span>
            </h1>
            <p className="hero-sub">
              <span className="live-dot" style={{ marginRight: 6 }} />
              Real-time jobs from RemoteOK · Jobicy · + More sources via backend crawler
            </p>
          </div>
          <div className="live-counts">
            <div>
              <div className="lc-val accent">
                {loading ? '...' : allJobs.length.toLocaleString()}
              </div>
              <div className="lc-lbl">Live jobs</div>
            </div>
            <div className="divider-v" style={{ height: 36, margin: '0 12px' }} />
            <div>
              <div className="lc-val" style={{ color: 'var(--warn)' }}>
                {loading ? '...' : allJobs.filter(j => j.is_new).length}
              </div>
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
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search role, skill, company… e.g. 'Python developer' or 'React fresher'"
            />
          </div>
          <button className="btn btn-primary" onClick={handleSearch}>
            {loading ? '...' : 'Search ↵'}
          </button>
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
            <div key={src} className="src-pill on">
              <span className="src-dot" />{src}
            </div>
          ))}
          <div className="src-pill" style={{ color: 'var(--a3)', borderColor: 'rgba(255,107,53,.3)' }}>
            + More via Python crawler →
          </div>
        </div>
      </div>

      {/* CATEGORY TABS */}
      <div className="cat-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            className={`cat-tab ${filters.category === cat.key ? 'active' : ''}`}
            onClick={() => setFilter('category', cat.key)}
          >
            {cat.label}
            <span className="cat-count">{counts[cat.key] ?? '...'}</span>
          </button>
        ))}
      </div>

      {/* FILTER BAR */}
      {showFilters && (
        <FilterBar
          filters={filters}
          toggleArrayFilter={toggleArrayFilter}
          setFilter={setFilter}
          reset={reset}
          activeCount={activeCount}
        />
      )}

      {/* CONTENT */}
      <div className="hub-content">
        <div className="jobs-col">

          {/* Sort row */}
          <div className="sort-row">
            <div className="result-info mono text-sm muted">
              {loading
                ? <span>Loading live jobs <span style={{ color: 'var(--accent)' }}>⟳</span></span>
                : <><strong style={{ color: 'var(--text)' }}>{filtered.length.toLocaleString()}</strong> jobs found</>
              }
            </div>
            <div className="sort-btns">
              {['AI Relevance','Newest'].map((s, i) => (
                <button key={s} className={`sort-btn ${i === 0 ? 'on' : ''}`}>{s}</button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: 'rgba(255,77,109,.1)', border: '1px solid rgba(255,77,109,.3)', borderRadius: 6, padding: '12px 16px', marginBottom: 16, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--red)' }}>
              {error} <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => loadJobs('')}>Retry</span>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{
                  background: 'var(--bg1)', border: '1px solid var(--line)',
                  borderRadius: 8, padding: '16px 18px', height: 120,
                  animation: 'pulse 1.5s ease infinite',
                  opacity: 1 - i * 0.15,
                }} />
              ))}
            </div>
          )}

          {/* Jobs */}
          {!loading && displayed.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">⌕</div>
              <div>No jobs found — try a different search or category</div>
              <button className="btn btn-sm" onClick={() => { reset(); loadJobs(''); }}>
                Clear & reload
              </button>
            </div>
          )}

          {!loading && displayed.map((job, i) => (
            <JobCard key={job.id} job={job} style={{ animationDelay: `${i * 0.03}s` }} />
          ))}

          {/* Load more */}
          {!loading && filtered.length > page && (
            <div className="load-more">
              Showing <strong>{displayed.length}</strong> of <strong>{filtered.length}</strong> ·{' '}
              <span className="accent" style={{ cursor: 'pointer' }} onClick={() => setPage(p => p + 20)}>
                Load 20 more ↓
              </span>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="right-col">
          <LiveStats jobs={allJobs} loading={loading} />
          <SourceStatus />
          <TrendingRoles jobs={allJobs} />
          <AlertSetup />
          <BackendNotice />
        </div>
      </div>
    </div>
  );
}

// ── Right panel components ──

function LiveStats({ jobs, loading }) {
  const cats = ['fresher','intern','it','data','nonit','senior'];
  const labels = { fresher:'🟢 Fresher', intern:'🟣 Internships', it:'💻 IT/Software', data:'🤖 Data/AI', nonit:'📊 Non-IT', senior:'🔶 Senior' };
  const colors = { fresher:'var(--accent)', intern:'var(--a2)', senior:'var(--a3)' };

  return (
    <div className="card r-panel">
      <div className="section-label" style={{ marginBottom: 12 }}>
        <span className="live-dot" style={{ marginRight: 6 }} />
        Live Counts
      </div>
      <div className="qs-grid">
        {cats.map(c => (
          <div key={c} className="qs-box">
            <div className="qs-val" style={{ color: colors[c] || 'var(--text)' }}>
              {loading ? '...' : jobs.filter(j => j.categories?.includes(c) || j.level === c).length}
            </div>
            <div className="text-xs muted">{labels[c]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SourceStatus() {
  const sources = [
    { name: 'RemoteOK',    status: 'ok',   info: 'Live',      count: 'Unlimited' },
    { name: 'Jobicy',      status: 'ok',   info: 'Live',      count: 'Unlimited' },
    { name: 'LinkedIn',    status: 'soon', info: 'Crawler',   count: 'Backend'   },
    { name: 'Naukri',      status: 'soon', info: 'Crawler',   count: 'Backend'   },
    { name: 'Indeed',      status: 'soon', info: 'Crawler',   count: 'Backend'   },
    { name: 'Internshala', status: 'soon', info: 'Crawler',   count: 'Backend'   },
    { name: 'FreshersWorld',status:'soon', info: 'Crawler',   count: 'Backend'   },
  ];
  const DOT = { ok: 'var(--accent)', soon: 'var(--warn)', err: 'var(--dim)' };
  return (
    <div className="card r-panel">
      <div className="section-head">
        <span className="section-label">Source Status</span>
        <span className="text-xs accent">2 live · 5 via backend</span>
      </div>
      {sources.map(s => (
        <div key={s.name} className="crawl-row">
          <span className="text-sm">{s.name}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: DOT[s.status], display: 'inline-block' }} />
            <span className="text-xs muted">{s.info}</span>
            <span className="text-xs mono" style={{ color: s.status === 'ok' ? 'var(--accent)' : 'var(--warn)' }}>{s.count}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function TrendingRoles({ jobs }) {
  // Build role counts from live data
  const roleCounts = {};
  jobs.forEach(j => {
    const words = j.title?.split(' ') || [];
    words.forEach(w => {
      if (w.length > 4) roleCounts[w] = (roleCounts[w] || 0) + 1;
    });
  });
  const top = Object.entries(roleCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);
  const max = top[0]?.[1] || 1;

  return (
    <div className="card r-panel">
      <div className="section-label" style={{ marginBottom: 12 }}>Trending in Results</div>
      {top.map(([role, count], i) => (
        <div key={role} className="trend-row">
          <span className="text-xs muted mono" style={{ width: 16 }}>{i + 1}</span>
          <span className="text-sm" style={{ flex: 1 }}>{role}</span>
          <div className="trend-bar">
            <div className="trend-fill" style={{ width: `${(count / max) * 100}%` }} />
          </div>
          <span className="text-xs muted mono">{count}</span>
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
        <span className="live-dot" /> Set Job Alert
      </div>
      <p className="alert-body">Get notified when matching jobs are posted.</p>
      <input className="input" style={{ marginTop: 10 }} placeholder="e.g. Python Fresher Remote" />
      <input className="input" style={{ marginTop: 6 }} type="email" placeholder="Your email" />
      <button className="alert-btn" onClick={() => setSent(true)}>
        {sent ? '✓ Alert set!' : '🔔 Create Alert'}
      </button>
    </div>
  );
}

function BackendNotice() {
  return (
    <div style={{ background: 'rgba(124,111,255,.06)', border: '1px solid rgba(124,111,255,.2)', borderRadius: 8, padding: '14px 16px', marginTop: 12 }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--a2)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        ⚡ Python Crawler — Coming Soon
      </div>
      <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
        Naukri · LinkedIn · Indeed · Internshala · FreshersWorld · Company Career Pages — all via FastAPI backend deploying on Railway.
      </p>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--a2)', marginTop: 8 }}>
        10,000+ more jobs incoming ↑
      </div>
    </div>
  );
}
