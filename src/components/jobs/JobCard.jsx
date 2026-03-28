import './JobCard.css';

const LEVEL_BORDER = {
  fresher: 'var(--accent)',
  intern:  'var(--a2)',
  govt:    'var(--warn)',
  senior:  'var(--a3)',
  mid:     'var(--a2)',
};

const SCORE_CLASS = (s) => s >= 90 ? 'hi' : s >= 75 ? 'mid' : 'lo';

export default function JobCard({ job, style }) {

  const handleClick = () => {
    if (job.apply_url && job.apply_url !== '#') {
      window.open(job.apply_url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleApply = (e) => {
    e.stopPropagation();
    if (job.apply_url && job.apply_url !== '#') {
      window.open(job.apply_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className="jcard fade-up"
      style={{ borderLeftColor: LEVEL_BORDER[job.level] || 'transparent', ...style }}
      onClick={handleClick}
    >
      <div className="jcard-body">
        <div className="jcard-badges">
          {job.is_new && <span className="badge badge-green">NEW · {job.posted_ago}</span>}
          {job.level === 'fresher' && <span className="badge badge-green">🟢 Fresher</span>}
          {job.level === 'intern'  && <span className="badge badge-purple">🟣 Internship</span>}
          {job.level === 'govt'    && <span className="badge badge-yellow">🏛 Govt</span>}
          {job.level === 'senior'  && <span className="badge badge-orange">🔶 Senior</span>}
          {job.is_hot              && <span className="badge badge-red">🔥 Hot</span>}
          <span className="badge badge-gray">{job.source}</span>
          {job.remote && <span className="badge badge-purple">Remote</span>}
        </div>

        <div className="jcard-title">{job.title}</div>
        <div className="jcard-company">▸ {job.company} · {job.location}</div>

        <div className="jcard-meta">
          {job.experience_range && (
            <span className="meta-item">⚑ <span>{job.experience_range}</span></span>
          )}
          {job.salary_display && job.salary_display !== 'Not disclosed' && (
            <span className="meta-item">💰 <span>{job.salary_display}</span></span>
          )}
          {job.company_rating && (
            <span className="meta-item">◎ <span>{job.company_rating} ★</span></span>
          )}
          {job.deadline && (
            <span className="meta-item">📅 <span>Apply by {job.deadline}</span></span>
          )}
        </div>

        {job.skills?.length > 0 && (
          <div className="jcard-tags">
            {job.skills.map((s, i) => (
              <span key={i} className="tag">
                {typeof s === 'string' ? s : s.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="jcard-aside">
        <div className={`ai-ring ${SCORE_CLASS(job.ai_score)}`}>
          {Math.round(job.ai_score)}
        </div>
        <span className="ring-label">AI SCORE</span>
        <button className="apply-btn" onClick={handleApply}>
          Apply →
        </button>
      </div>
    </div>
  );
}