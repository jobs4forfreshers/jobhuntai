// src/components/jobs/JobCard.jsx
import './JobCard.css';

var LEVEL_BORDER = {
  fresher: 'var(--accent)',
  intern:  'var(--a2)',
  govt:    'var(--warn)',
  senior:  'var(--a3)',
  mid:     'var(--a2)',
};

var INTERVIEW_COLOR = {
  'Easy':      'var(--accent)',
  'Moderate':  'var(--warn)',
  'Hard':      'var(--a3)',
  'Very Hard': 'var(--red)',
};

function scoreClass(s) {
  return s >= 90 ? 'hi' : s >= 75 ? 'mid' : 'lo';
}

export default function JobCard(props) {
  var job   = props.job;
  var style = props.style;

  function handleClick() {
    if (job.apply_url && job.apply_url !== '#') {
      window.open(job.apply_url, '_blank', 'noopener,noreferrer');
    }
  }

  function handleApply(e) {
    e.stopPropagation();
    if (job.apply_url && job.apply_url !== '#') {
      window.open(job.apply_url, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <div
      className="jcard fade-up"
      style={Object.assign({ borderLeftColor: LEVEL_BORDER[job.level] || 'transparent' }, style)}
      onClick={handleClick}
    >
      <div className="jcard-body">

        {/* Badges */}
        <div className="jcard-badges">
          {job.is_new    && <span className="badge badge-green">NEW</span>}
          {job.level === 'fresher' && <span className="badge badge-green">Fresher</span>}
          {job.level === 'intern'  && <span className="badge badge-purple">Internship</span>}
          {job.level === 'govt'    && <span className="badge badge-yellow">Govt</span>}
          {job.level === 'senior'  && <span className="badge badge-orange">Senior</span>}
          {job.remote              && <span className="badge badge-purple">Remote</span>}
          {job.hybrid              && <span className="badge badge-purple">Hybrid</span>}
          {job.is_indian           && <span className="badge badge-green">India</span>}
          <span className="badge badge-gray">{job.source}</span>
        </div>

        {/* Title & Company */}
        <div className="jcard-title">{job.title}</div>
        <div className="jcard-company">
          {job.company}
          {job.company_stage && (
            <span style={{ color: 'var(--muted)', marginLeft: 8, fontSize: 10 }}>
              · {job.company_stage}
            </span>
          )}
        </div>

        {/* Location */}
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', marginBottom: 8 }}>
          📍 {job.location}
          {job.work_type && <span style={{ marginLeft: 8 }}>· {job.work_type}</span>}
        </div>

        {/* Glassdoor-style info row */}
        <div className="jcard-glassdoor">
          {job.company_rating && (
            <span className="gd-item">
              <span className="gd-icon">⭐</span>
              {job.company_rating} rating
            </span>
          )}
          {job.salary_display && job.salary_display !== 'Not disclosed' && (
            <span className="gd-item">
              <span className="gd-icon">💰</span>
              {job.salary_display}
            </span>
          )}
          {job.interview_difficulty && (
            <span className="gd-item" style={{ color: INTERVIEW_COLOR[job.interview_difficulty] || 'var(--muted)' }}>
              <span className="gd-icon">🎯</span>
              {job.interview_difficulty} interview
            </span>
          )}
          {job.experience_range && (
            <span className="gd-item">
              <span className="gd-icon">⚑</span>
              {job.experience_range}
            </span>
          )}
        </div>

        {/* Skills */}
        {job.skills && job.skills.length > 0 && (
          <div className="jcard-tags">
            {job.skills.map(function(s, i) {
              return (
                <span key={i} className="tag">
                  {typeof s === 'string' ? s : s.name}
                </span>
              );
            })}
          </div>
        )}

        {/* Posted time */}
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--dim)', marginTop: 8 }}>
          🕐 {job.posted_ago}
          {job.deadline && <span style={{ marginLeft: 12, color: 'var(--a3)' }}>⏰ Apply by {job.deadline}</span>}
        </div>
      </div>

      {/* Right — AI Score + Apply */}
      <div className="jcard-aside">
        <div className={'ai-ring ' + scoreClass(job.ai_score)}>
          {Math.round(job.ai_score)}
        </div>
        <span className="ring-label">AI MATCH</span>
        <button className="apply-btn" onClick={handleApply}>
          Apply →
        </button>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', textAlign: 'center' }}>
          opens job page
        </span>
      </div>
    </div>
  );
}