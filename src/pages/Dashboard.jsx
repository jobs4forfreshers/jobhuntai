// ── src/pages/Dashboard.jsx ──
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePersonalizedMatches } from '../hooks/useJobs';
import { useLiveJobs } from '../hooks/useWebSocket';
import { MOCK_JOBS } from '../utils/mockData';
import JobCard from '../components/jobs/JobCard';
import './Dashboard.css';

const STAT_CARDS = [
  { label: 'Jobs Found',   val: '1,247', sub: '↑ 83 in last hour',   accent: true  },
  { label: 'AI Matches',   val: '38',    sub: 'Score >85% match',     purple: true  },
  { label: 'Avg Salary',   val: '₹22L',  sub: 'Range ₹14–38L',       orange: true  },
  { label: 'New Today',    val: '247',   sub: '+31% vs yesterday',    warn: true    },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { liveJobs } = useLiveJobs(5);
  const topJobs = MOCK_JOBS.slice(0, 5);
  const [query, setQuery] = useState('');

  return (
    <div className="dashboard">

      {/* TOPBAR */}
      <div className="db-topbar">
        <div className="db-search-wrap">
          <span className="db-search-icon">⌕</span>
          <input
            className="input db-search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && navigate(`/jobs?q=${query}`)}
            placeholder="Python backend developer Hyderabad 3–5 years · AI semantic search active"
          />
        </div>
        <button className="btn btn-primary" onClick={() => navigate(`/jobs?q=${query}`)}>
          Search ↵
        </button>
        <button className="btn">⚙ Filters</button>
      </div>

      {/* FILTER CHIPS */}
      <div className="db-chips">
        {['Remote','Hybrid','3–5 yrs','₹15–25L','Startup','Series B+','Hyderabad'].map(c => (
          <button key={c} className="chip active">{c}</button>
        ))}
        {['On-site','₹25–40L','MNC'].map(c => (
          <button key={c} className="chip">{c}</button>
        ))}
      </div>

      {/* STAT CARDS */}
      <div className="db-stats">
        {STAT_CARDS.map(s => (
          <div key={s.label} className={`stat-card ${s.purple?'p':s.orange?'o':s.warn?'w':''}`}>
            <div className="sc-label">{s.label}</div>
            <div className="sc-val">{s.val}</div>
            <div className="sc-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* TWO COL */}
      <div className="db-grid">
        {/* Job list */}
        <div>
          <div className="section-head">
            <span className="section-label">Results <span>1,247 jobs</span></span>
            <div style={{ display: 'flex', gap: 6 }}>
              {['AI Relevance','Date','Salary'].map((s,i) => (
                <button key={s} className={`chip ${i===0?'active':''}`} style={{ fontSize: 10 }}>{s}</button>
              ))}
            </div>
          </div>
          {topJobs.map((job, i) => (
            <JobCard key={job.id} job={job} style={{ animationDelay: `${i * 0.06}s` }} />
          ))}
          <div style={{ textAlign: 'center', padding: '12px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>
            Showing 5 of 1,247 ·{' '}
            <span className="accent" style={{ cursor: 'pointer' }} onClick={() => navigate('/jobs')}>
              View all in Jobs Hub →
            </span>
          </div>
        </div>

        {/* Right panels */}
        <div>
          <LiveFeedPanel jobs={liveJobs} />
          <SkillsPanel />
          <SalaryPanel />
          <CrawlPanel />
        </div>
      </div>
    </div>
  );
}

function LiveFeedPanel({ jobs }) {
  const placeholders = [
    { title: 'Senior Python Dev', co: 'Razorpay',  loc: 'Hyderabad', s: '₹22–30L',  t: '8s',  c: 'var(--accent)' },
    { title: 'Backend Engineer',  co: 'Meesho',    loc: 'Remote',    s: '₹18–26L',  t: '34s', c: 'var(--a2)' },
    { title: 'Data Scientist',    co: 'Groww',     loc: 'Bangalore', s: '₹20–28L',  t: '1m',  c: 'var(--a3)' },
    { title: 'Platform Engineer', co: 'Zepto',     loc: 'Hyderabad', s: '₹18–25L',  t: '2m',  c: 'var(--accent)' },
  ];
  const items = jobs.length > 0
    ? jobs.map(j => ({ title: j.title, co: j.company, loc: j.location, s: j.salary_display, t: 'just now', c: 'var(--accent)' }))
    : placeholders;

  return (
    <div className="card db-panel">
      <div className="section-head">
        <span className="section-label"><span className="live-dot" style={{marginRight:6}}/>Live Feed</span>
        <span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--muted)',cursor:'pointer'}}>pause ⏸</span>
      </div>
      {items.map((j, i) => (
        <div key={i} className="live-item">
          <span className="live-dot" style={{ background: j.c, flexShrink: 0, marginTop: 4 }} />
          <div>
            <div style={{ fontSize: 12 }}>{j.title} @ {j.co}</div>
            <div className="text-xs muted mono">{j.loc} · {j.s} · {j.t} ago</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SkillsPanel() {
  const skills = [
    { name: 'Python',        n: 1104, pct: 89, color: 'var(--accent)' },
    { name: 'FastAPI/Django',n: 820,  pct: 66, color: 'var(--accent)' },
    { name: 'PostgreSQL',    n: 714,  pct: 57, color: 'var(--a2)' },
    { name: 'Redis',         n: 610,  pct: 49, color: 'var(--a2)' },
    { name: 'Docker / K8s',  n: 530,  pct: 43, color: 'var(--a3)' },
    { name: 'AWS / GCP',     n: 480,  pct: 38, color: 'var(--warn)' },
  ];
  return (
    <div className="card db-panel">
      <div className="section-label" style={{ marginBottom: 12 }}>Top Skills in Results</div>
      {skills.map(s => (
        <div key={s.name} className="skill-row">
          <div className="skill-head">
            <span className="text-sm">{s.name}</span>
            <span className="text-xs muted mono">{s.n.toLocaleString()} jobs</span>
          </div>
          <div className="skill-bar">
            <div className="skill-fill" style={{ width: `${s.pct}%`, background: s.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function SalaryPanel() {
  const bars = [25, 42, 78, 100, 68, 35, 18];
  const labels = ['₹10L','₹15L','₹20L','₹25L','₹30L','₹35L','₹40L+'];
  return (
    <div className="card db-panel">
      <div className="section-label" style={{ marginBottom: 12 }}>Salary Distribution</div>
      <div className="salary-bars">
        {bars.map((h, i) => (
          <div key={i} className={`s-bar ${i === 3 || i === 4 ? 'active' : ''}`} style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="salary-lbls">
        {labels.map(l => <span key={l} className="text-xs muted mono">{l}</span>)}
      </div>
      <div className="text-xs muted mono" style={{ marginTop: 8 }}>
        Most openings: <span className="accent">₹20–30 LPA range</span>
      </div>
    </div>
  );
}

function CrawlPanel() {
  const rows = [
    { name: 'LinkedIn',       ok: true,  time: '2m ago',    n: '+143' },
    { name: 'Naukri.com',     ok: true,  time: '4m ago',    n: '+89'  },
    { name: 'Indeed India',   ok: true,  time: '7m ago',    n: '+67'  },
    { name: 'Company Portals',warn: true, time: 'Rate limit',n: '+12'  },
    { name: 'Upwork',         ok: true,  time: '11m ago',   n: '+28'  },
    { name: 'X / Twitter',    err: true,  time: 'API down',  n: '—'    },
  ];
  return (
    <div className="card db-panel">
      <div className="section-head">
        <span className="section-label">Crawl Status</span>
        <span className="text-xs accent">14/16 active</span>
      </div>
      {rows.map(r => (
        <div key={r.name} className="crawl-row">
          <span className="text-sm">{r.name}</span>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', display:'inline-block',
              background: r.ok ? 'var(--accent)' : r.warn ? 'var(--warn)' : 'var(--dim)' }} />
            <span className="text-xs muted mono">{r.time}</span>
            <span className="text-xs accent mono">{r.n}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
