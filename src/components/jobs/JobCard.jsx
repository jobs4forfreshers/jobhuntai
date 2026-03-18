// ── src/components/jobs/JobCard.jsx ──
import { useNavigate } from 'react-router-dom';
import { jobsAPI } from '../../api';
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
  const navigate = useNavigate();

  const handleClick = () => {
    jobsAPI.trackClick(job.id).catch(() => {});
    navigate(`/jobs/${job.id}`);
  };

  return (
    <div
      className={`jcard fade-up`}
      style={{ borderLeftColor: LEVEL_BORDER[job.level] || 'transparent', ...style }}
      onClick={handleClick}
    >
      <div className="jcard-body">
        {/* Badges row */}
        <div className="jcard-badges">
          {job.is_new    && <span className="badge badge-green">NEW · {job.posted_ago}</span>}
          {job.level === 'fresher' && <span className="badge badge-green">🟢 Fresher</span>}
          {job.level === 'intern'  && <span className="badge badge-purple">🟣 Internship</span>}
          {job.level === 'govt'    && <span className="badge badge-yellow">🏛 Government</span>}
          {job.level === 'senior'  && <span className="badge badge-orange">🔶 Senior</span>}
          {job.is_hot   && <span className="badge badge-red">🔥 {job.applicant_count}+ applied</span>}
          <span className="badge badge-gray">{job.source}</span>
          {job.remote   && <span className="badge badge-purple">{job.work_type}</span>}
        </div>

        {/* Title & company */}
        <div className="jcard-title">{job.title}</div>
        <div className="jcard-company">▸ {job.company} · {job.location}</div>

        {/* Meta */}
        <div className="jcard-meta">
          {job.experience_range && (
            <span className="meta-item">⚑ <span>{job.experience_range}</span></span>
          )}
          {job.salary_display && (
            <span className="meta-item">₹ <span>{job.salary_display}</span></span>
          )}
          {job.company_rating && (
            <span className="meta-item">◎ <span>{job.company_rating} ★</span></span>
          )}
          {job.company_stage && (
            <span className="meta-item">⬡ <span>{job.company_stage}</span></span>
          )}
          {job.deadline && (
            <span className="meta-item">📅 <span>Apply by {job.deadline}</span></span>
          )}
        </div>

        {/* Skills */}
        <div className="jcard-tags">
          {job.skills?.map(s => (
            <span key={s.name} className={`tag ${s.match ? 'tag-match' : ''}`}>
              {s.name}
            </span>
          ))}
        </div>
      </div>

      {/* AI Score + Apply */}
      <div className="jcard-aside">
        <div className={`ai-ring ${SCORE_CLASS(job.ai_score)}`}>
          {job.ai_score}
        </div>
        <span className="ring-label">AI SCORE</span>
        <button
          className="apply-btn"
          onClick={(e) => { e.stopPropagation(); window.open(job.apply_url, '_blank'); }}
        >
          Apply →
        </button>
      </div>
    </div>
  );
}
