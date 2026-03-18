// ── src/pages/JobDetail.jsx ──
// Full implementation mirrors job-detail.html
// Wired to useJob(id) hook which calls GET /api/jobs/:id
import { useParams, useNavigate } from 'react-router-dom';
import { useJob } from '../hooks/useJobs';
import { MOCK_JOBS } from '../utils/mockData';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  // const { data: job, isLoading } = useJob(id);        // ← REAL API
  const job = MOCK_JOBS.find(j => j.id === id) || MOCK_JOBS[8]; // ← MOCK

  if (!job) return <div style={{ padding: 40, color: 'var(--muted)' }}>Job not found.</div>;

  return (
    <div style={{ padding: '28px 36px', maxWidth: 900 }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginBottom: 20, display: 'flex', gap: 8 }}>
        <span style={{ cursor: 'pointer', color: 'var(--muted)' }} onClick={() => navigate('/jobs')}>⌕ Search</span>
        <span>/</span>
        <span>{job.title}</span>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              {job.is_new && <span className="badge badge-green">NEW · {job.posted_ago}</span>}
              <span className="badge badge-gray">{job.source}</span>
              {job.remote && <span className="badge badge-purple">{job.work_type}</span>}
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>{job.title}</h1>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--accent)', marginBottom: 12 }}>
              ▸ {job.company} · {job.location}
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                job.experience_range && `⚑ ${job.experience_range}`,
                job.salary_display   && `₹ ${job.salary_display}`,
                job.company_rating   && `◎ ${job.company_rating} ★`,
                job.company_stage    && `⬡ ${job.company_stage}`,
              ].filter(Boolean).map(m => (
                <span key={m} style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>{m}</span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', border: '2px solid var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 600, color: 'var(--accent)',
              background: 'rgba(0,229,160,.07)'
            }}>{job.ai_score}</div>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)' }}>AI MATCH</span>
            <button className="btn btn-primary btn-sm" onClick={() => window.open(job.apply_url,'_blank')}>
              Apply Now →
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="section-label" style={{ marginBottom: 12 }}>Skills Match</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {job.skills.map(s => (
            <span key={s.name} className={`tag ${s.match ? 'tag-match' : ''}`}>{s.name}</span>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="section-label" style={{ marginBottom: 14 }}>Job Description</div>
        <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.8 }}>
          <p>This is a high-relevance role matched by JobHuntAI's semantic search engine.</p>
          <p style={{ marginTop: 12 }}>
            Connect your FastAPI backend to serve full JD content via <code style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--accent)', background: 'var(--bg3)', padding: '1px 6px', borderRadius: 3 }}>GET /api/jobs/{'{id}'}</code> and replace the mock data in this component.
          </p>
        </div>
      </div>
    </div>
  );
}
