// src/pages/JobsHub.jsx
import { useState, useEffect, useCallback } from 'react';
import { useFilters } from '../hooks/useFilters';
import { fetchAllLiveJobs } from '../api/liveJobs';
import JobCard from '../components/jobs/JobCard';
import FilterBar from '../components/jobs/FilterBar';
import './JobsHub.css';

var CATEGORIES = [
  { key: 'all',     label: 'All Jobs'       },
  { key: 'fresher', label: 'Freshers'       },
  { key: 'intern',  label: 'Internships'    },
  { key: 'it',      label: 'IT / Software'  },
  { key: 'data',    label: 'Data / AI'      },
  { key: 'nonit',   label: 'Non-IT'         },
  { key: 'govt',    label: 'Govt / PSU'     },
  { key: 'senior',  label: 'Senior'         },
];

var SOURCES_LIST = [
  'Remotive','The Muse','Arbeitnow',
  'Internshala','Sarkari Naukri',
  'Adzuna India','NCS Portal',
];

export default function JobsHub() {
  var filterState    = useFilters();
  var filters        = filterState.filters;
  var setFilter      = filterState.setFilter;
  var toggleArrayFilter = filterState.toggleArrayFilter;
  var reset          = filterState.reset;
  var activeCount    = filterState.activeCount;

  var [showFilters, setShowFilters] = useState(true);
  var [allJobs,     setAllJobs]     = useState([]);
  var [loading,     setLoading]     = useState(true);
  var [error,       setError]       = useState('');
  var [searchInput, setSearchInput] = useState('');
  var [page,        setPage]        = useState(20);

  var loadJobs = useCallback(async function(q) {
    setLoading(true);
    setError('');
    setPage(20);
    try {
      var jobs = await fetchAllLiveJobs(q || '');
      setAllJobs(jobs);
    } catch (e) {
      setError('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(function() { loadJobs(''); }, [loadJobs]);

  // ── Filter jobs ──
  var filtered = allJobs.filter(function(job) {
    // Category filter
    var cat = filters.category;
    if (cat !== 'all') {
      var catMatch = (job.categories && job.categories.indexOf(cat) !== -1) || job.level === cat;
      if (!catMatch) return false;
    }

    // Level filter
    if (filters.level && filters.level.length > 0) {
      if (filters.level.indexOf(job.level) === -1) return false;
    }

    // Work type filter
    if (filters.workType && filters.workType.length > 0) {
      var wtMatch = filters.workType.some(function(w) {
        if (w === 'remote') return job.remote;
        if (w === 'hybrid') return job.hybrid;
        if (w === 'onsite') return !job.remote && !job.hybrid;
        return false;
      });
      if (!wtMatch) return false;
    }

    // Search query filter
    if (filters.q) {
      var q = filters.q.toLowerCase();
      var text = ((job.title || '') + ' ' + (job.company || '') + ' ' + (job.location || '')).toLowerCase();
      if (text.indexOf(q) === -1) return false;
    }

    return true;
  });

  var displayed = filtered.slice(0, page);

  // ── Category counts ──
  function countCat(key) {
    if (key === 'all') return allJobs.length;
    return allJobs.filter(function(j) {
      return (j.categories && j.categories.indexOf(key) !== -1) || j.level === key;
    }).length;
  }

  function handleSearch() {
    setFilter('q', searchInput);
    if (searchInput) loadJobs(searchInput);
    else loadJobs('');
  }

  return (
    <div className="jobs-hub">

      {/* HERO */}
      <div className="hub-hero">
        <div className="hero-top">
          <div>
            <h1 className="hero-title">
              All Jobs Hub <span>— Freshers to Experienced</span>
            </h1>
            <p className="hero-sub">
              <span className="live-dot" style={{ marginRight: 6 }} />
              Live jobs from Remotive · Internshala · Sarkari Naukri · NCS Portal · Adzuna India · More
            </p>
          </div>
          <div className="live-counts">
            <div>
              <div className="lc-val" style={{ color: 'var(--accent)' }}>
                {loading ? '...' : allJobs.length.toLocaleString()}
              </div>
              <div className="lc-lbl">Live jobs</div>
            </div>
            <div style={{ width: 1, height: 36, background: 'var(--line)', margin: '0 12px' }} />
            <div>
              <div className="lc-val" style={{ color: 'var(--warn)' }}>
                {loading ? '...' : allJobs.filter(function(j) { return j.is_new; }).length}
              </div>
              <div className="lc-lbl">New today</div>
            </div>
            <div style={{ width: 1, height: 36, background: 'var(--line)', margin: '0 12px' }} />
            <div>
              <div className="lc-val" style={{ color: 'var(--a2)' }}>
                {loading ? '...' : allJobs.filter(function(j) { return j.is_indian; }).length}
              </div>
              <div className="lc-lbl">Indian jobs</div>
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
              onChange={function(e) { setSearchInput(e.target.value); }}
              onKeyDown={function(e) { if (e.key === 'Enter') handleSearch(); }}
              placeholder="Search role, company, city… e.g. 'Python fresher Hyderabad' or 'SSC govt job'"
            />
          </div>
          <button className="btn btn-primary" onClick={handleSearch}>
            Search
          </button>
          <button
            className={'btn ' + (showFilters ? 'btn-active' : '')}
            onClick={function() { setShowFilters(function(v) { return !v; }); }}
          >
            Filters {activeCount > 0 && <span className="filter-count">{activeCount}</span>}
          </button>
          <button className="btn" onClick={function() { loadJobs(searchInput); }} title="Refresh jobs">
            ↻
          </button>
        </div>

        {/* Source pills */}
        <div className="source-pills">
          {SOURCES_LIST.map(function(src) {
            return (
              <div key={src} className="src-pill on">
                <span className="src-dot" />{src}
              </div>
            );
          })}
        </div>
      </div>

      {/* CATEGORY TABS */}
      <div className="cat-tabs">
        {CATEGORIES.map(function(cat) {
          var count = countCat(cat.key);
          return (
            <button
              key={cat.key}
              className={'cat-tab ' + (filters.category === cat.key ? 'active' : '')}
              onClick={function() { setFilter('category', cat.key); }}
            >
              {cat.label}
              <span className="cat-count">{loading ? '...' : count}</span>
            </button>
          );
        })}
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
            <div className="mono text-sm muted">
              {loading
                ? 'Loading live jobs...'
                : <span><strong style={{ color: 'var(--text)' }}>{filtered.length.toLocaleString()}</strong> jobs found</span>
              }
            </div>
            <div className="sort-btns">
              <button className="sort-btn on">AI Relevance</button>
              <button className="sort-btn">Newest</button>
              <button className="sort-btn">Salary</button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: 'rgba(255,77,109,.1)', border: '1px solid rgba(255,77,109,.3)', borderRadius: 6, padding: '12px 16px', marginBottom: 16, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--red)' }}>
              {error}
              <span style={{ cursor: 'pointer', marginLeft: 12, textDecoration: 'underline' }} onClick={function() { loadJobs(''); }}>
                Retry
              </span>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1,2,3,4,5].map(function(i) {
                return (
                  <div key={i} style={{
                    background: 'var(--bg1)', border: '1px solid var(--line)',
                    borderRadius: 8, height: 130,
                    opacity: 1 - i * 0.15,
                    animation: 'pulse 1.5s ease infinite',
                  }} />
                );
              })}
            </div>
          )}

          {/* Empty */}
          {!loading && displayed.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">⌕</div>
              <div>No jobs found — try different filters or search</div>
              <button className="btn btn-sm" onClick={function() { reset(); loadJobs(''); }}>
                Clear and reload
              </button>
            </div>
          )}

          {/* Jobs */}
          {!loading && displayed.map(function(job, i) {
            return (
              <JobCard key={job.id} job={job} style={{ animationDelay: (i * 0.03) + 's' }} />
            );
          })}

          {/* Load more */}
          {!loading && filtered.length > page && (
            <div className="load-more">
              Showing <strong>{displayed.length}</strong> of <strong>{filtered.length}</strong>
              <span className="accent" style={{ cursor: 'pointer', marginLeft: 8 }}
                onClick={function() { setPage(function(p) { return p + 20; }); }}>
                Load 20 more
              </span>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="right-col">
          <LiveStats jobs={allJobs} loading={loading} />
          <SourceStatus />
          <SalaryInsights />
          <TrendingRoles jobs={allJobs} />
          <AlertSetup />
        </div>
      </div>
    </div>
  );
}

function LiveStats(props) {
  var jobs    = props.jobs;
  var loading = props.loading;

  var stats = [
    { key: 'fresher', label: 'Fresher',      color: 'var(--accent)' },
    { key: 'intern',  label: 'Internships',  color: 'var(--a2)'     },
    { key: 'it',      label: 'IT/Software',  color: null            },
    { key: 'data',    label: 'Data/AI',      color: null            },
    { key: 'nonit',   label: 'Non-IT',       color: null            },
    { key: 'govt',    label: 'Govt/PSU',     color: 'var(--warn)'   },
  ];

  return (
    <div className="card r-panel">
      <div className="section-label" style={{ marginBottom: 12 }}>
        <span className="live-dot" style={{ marginRight: 6 }} />Live Counts
      </div>
      <div className="qs-grid">
        {stats.map(function(s) {
          var count = loading ? '...' : jobs.filter(function(j) {
            return (j.categories && j.categories.indexOf(s.key) !== -1) || j.level === s.key;
          }).length;
          return (
            <div key={s.key} className="qs-box">
              <div className="qs-val" style={{ color: s.color || 'var(--text)' }}>{count}</div>
              <div className="text-xs muted">{s.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SourceStatus() {
  var sources = [
    { name: 'Remotive',       status: 'ok',   info: 'Live',    count: 'Remote' },
    { name: 'The Muse',       status: 'ok',   info: 'Live',    count: 'Global' },
    { name: 'Arbeitnow',      status: 'ok',   info: 'Live',    count: 'Tech'   },
    { name: 'Internshala',    status: 'ok',   info: 'RSS',     count: 'India'  },
    { name: 'Sarkari Naukri', status: 'ok',   info: 'RSS',     count: 'Govt'   },
    { name: 'Adzuna India',   status: 'soon', info: 'API Key', count: 'India'  },
    { name: 'NCS Portal',     status: 'soon', info: 'Backend', count: 'India'  },
    { name: 'LinkedIn India',  status: 'soon', info: 'Backend', count: 'India' },
    { name: 'Naukri.com',     status: 'soon', info: 'Backend', count: 'India'  },
  ];

  var DOT = { ok: 'var(--accent)', soon: 'var(--warn)', err: 'var(--dim)' };

  return (
    <div className="card r-panel">
      <div className="section-head">
        <span className="section-label">Source Status</span>
        <span className="text-xs accent">3 live · 6 coming</span>
      </div>
      {sources.map(function(s) {
        return (
          <div key={s.name} className="crawl-row">
            <span className="text-sm">{s.name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: DOT[s.status], display: 'inline-block' }} />
              <span className="text-xs muted">{s.info}</span>
              <span className="text-xs mono" style={{ color: s.status === 'ok' ? 'var(--accent)' : 'var(--warn)' }}>{s.count}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SalaryInsights() {
  var roles = [
    { role: 'Fresher Dev',    min: '3.5', max: '6',  color: 'var(--accent)' },
    { role: 'Junior Dev',     min: '6',   max: '12', color: 'var(--accent)' },
    { role: 'Mid-level Dev',  min: '12',  max: '22', color: 'var(--a2)'     },
    { role: 'Senior Dev',     min: '22',  max: '40', color: 'var(--a3)'     },
    { role: 'Data Scientist', min: '8',   max: '25', color: 'var(--a2)'     },
    { role: 'HR Fresher',     min: '3',   max: '5',  color: 'var(--warn)'   },
    { role: 'Intern',         min: '10k', max: '25k/mo', color: 'var(--a2)' },
  ];

  return (
    <div className="card r-panel">
      <div className="section-label" style={{ marginBottom: 12 }}>
        Indian Salary Insights
      </div>
      {roles.map(function(r) {
        return (
          <div key={r.role} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
            <span className="text-sm">{r.role}</span>
            <span className="text-xs mono" style={{ color: r.color }}>
              {r.min.includes('k') ? r.min + ' – ' + r.max : 'Rs.' + r.min + 'L – Rs.' + r.max + 'L'}
            </span>
          </div>
        );
      })}
      <div className="text-xs muted mono" style={{ marginTop: 8 }}>
        Based on Indian market data 2024
      </div>
    </div>
  );
}

function TrendingRoles(props) {
  var jobs = props.jobs;

  var roleCounts = {};
  jobs.forEach(function(j) {
    var words = (j.title || '').split(/\s+/);
    words.forEach(function(w) {
      if (w.length > 4 && !['with','that','this','from','into','have','your','will'].includes(w.toLowerCase())) {
        roleCounts[w] = (roleCounts[w] || 0) + 1;
      }
    });
  });

  var top = Object.entries(roleCounts)
    .sort(function(a, b) { return b[1] - a[1]; })
    .slice(0, 7);

  var max = top.length > 0 ? top[0][1] : 1;

  return (
    <div className="card r-panel">
      <div className="section-label" style={{ marginBottom: 12 }}>Trending Today</div>
      {top.map(function(entry, i) {
        var role  = entry[0];
        var count = entry[1];
        return (
          <div key={role} className="trend-row">
            <span className="text-xs muted mono" style={{ width: 16 }}>{i + 1}</span>
            <span className="text-sm" style={{ flex: 1 }}>{role}</span>
            <div className="trend-bar">
              <div className="trend-fill" style={{ width: (count / max * 100) + '%' }} />
            </div>
            <span className="text-xs muted mono">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

function AlertSetup() {
  var [sent, setSent] = useState(false);
  var [email, setEmail] = useState('');
  var [role, setRole] = useState('');

  return (
    <div className="alert-box">
      <div className="alert-title">
        <span className="live-dot" /> Job Alert
      </div>
      <p className="alert-body">Get notified when new matching jobs are posted.</p>
      <input
        className="input"
        style={{ marginTop: 10 }}
        placeholder="Role: e.g. Python Fresher"
        value={role}
        onChange={function(e) { setRole(e.target.value); }}
      />
      <input
        className="input"
        style={{ marginTop: 6 }}
        type="email"
        placeholder="Your email"
        value={email}
        onChange={function(e) { setEmail(e.target.value); }}
      />
      <button className="alert-btn" onClick={function() { if (email && role) setSent(true); }}>
        {sent ? 'Alert set!' : 'Create Alert'}
      </button>
    </div>
  );
}