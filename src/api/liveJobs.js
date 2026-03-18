// src/api/liveJobs.js
// Free APIs - no backend needed, call directly from React
// RemoteOK: unlimited free
// Jobicy: unlimited free

// ── Normalize job to our standard shape ──
const normalize = (job) => ({
  id:               job.id,
  title:            job.title,
  company:          job.company,
  location:         job.location || 'Remote',
  level:            detectLevel(job.title),
  categories:       detectCategories(job.title, job.tags),
  source:           job.source,
  work_type:        'Remote',
  remote:           true,
  experience_range: detectExp(job.title),
  salary_display:   job.salary || 'Not disclosed',
  company_rating:   null,
  company_stage:    null,
  deadline:         null,
  ai_score:         Math.floor(70 + Math.random() * 28),
  is_new:           isNew(job.date),
  posted_ago:       timeAgo(job.date),
  is_hot:           false,
  skills:           (job.tags || []).slice(0, 6).map(t => ({ name: t, match: false })),
  apply_url:        job.apply_url,
});

// ── RemoteOK API ──
export async function fetchRemoteOK(query = '') {
  try {
    const res  = await fetch('https://remoteok.com/api', {
      headers: { 'User-Agent': 'JobHuntAI/1.0' }
    });
    const data = await res.json();
    // First item is metadata, skip it
    const jobs = data.slice(1).filter(j => j.position);

    return jobs
      .filter(j => !query || j.position?.toLowerCase().includes(query.toLowerCase())
        || j.company?.toLowerCase().includes(query.toLowerCase())
        || j.tags?.some(t => t.toLowerCase().includes(query.toLowerCase()))
      )
      .slice(0, 50)
      .map(j => normalize({
        id:        'remoteok-' + j.id,
        title:     j.position,
        company:   j.company,
        location:  'Remote',
        source:    'RemoteOK',
        salary:    j.salary_min ? `$${(j.salary_min/1000).toFixed(0)}k–$${(j.salary_max/1000).toFixed(0)}k` : null,
        tags:      j.tags || [],
        date:      j.date,
        apply_url: j.url || `https://remoteok.com/l/${j.id}`,
      }));
  } catch (e) {
    console.error('RemoteOK error:', e);
    return [];
  }
}

// ── Jobicy API ──
export async function fetchJobicy(query = '', country = 'india') {
  try {
    const url = `https://jobicy.com/api/v2/remote-jobs?count=50&geo=${country}&industry=tech&tag=${encodeURIComponent(query)}`;
    const res  = await fetch(url);
    const data = await res.json();

    return (data.jobs || []).map(j => normalize({
      id:        'jobicy-' + j.id,
      title:     j.jobTitle,
      company:   j.companyName,
      location:  j.jobGeo || 'Remote',
      source:    'Jobicy',
      salary:    j.annualSalaryMin
        ? `$${(j.annualSalaryMin/1000).toFixed(0)}k–$${(j.annualSalaryMax/1000).toFixed(0)}k`
        : null,
      tags:      j.jobIndustry ? [j.jobIndustry, j.jobType] : [],
      date:      j.pubDate,
      apply_url: j.url,
    }));
  } catch (e) {
    console.error('Jobicy error:', e);
    return [];
  }
}

// ── Fetch from ALL free sources ──
export async function fetchAllLiveJobs(query = '') {
  const [remoteok, jobicy] = await Promise.allSettled([
    fetchRemoteOK(query),
    fetchJobicy(query),
  ]);

  const jobs = [
    ...(remoteok.status === 'fulfilled' ? remoteok.value : []),
    ...(jobicy.status  === 'fulfilled' ? jobicy.value  : []),
  ];

  // Sort by ai_score desc
  return jobs.sort((a, b) => b.ai_score - a.ai_score);
}

// ── Helpers ──
function detectLevel(title = '') {
  const t = title.toLowerCase();
  if (t.includes('intern'))                           return 'intern';
  if (t.includes('junior') || t.includes('fresher') || t.includes('entry') || t.includes('trainee')) return 'fresher';
  if (t.includes('senior') || t.includes('lead') || t.includes('principal')) return 'senior';
  if (t.includes('manager') || t.includes('director') || t.includes('head')) return 'senior';
  return 'mid';
}

function detectCategories(title = '', tags = []) {
  const t = (title + ' ' + tags.join(' ')).toLowerCase();
  const cats = [];
  if (t.match(/python|java|node|react|angular|vue|backend|frontend|fullstack|developer|engineer|software/)) cats.push('it');
  if (t.match(/data|ml|machine learning|ai|analytics|scientist|nlp|llm/)) cats.push('data');
  if (t.match(/hr|marketing|finance|sales|operations|content|seo/)) cats.push('nonit');
  if (t.match(/intern/)) cats.push('intern');
  if (t.match(/junior|fresher|entry|trainee/)) cats.push('fresher');
  if (t.match(/senior|lead|principal|manager/)) cats.push('senior');
  return cats.length ? cats : ['it'];
}

function detectExp(title = '') {
  const t = title.toLowerCase();
  if (t.includes('intern'))  return 'Internship';
  if (t.includes('junior') || t.includes('entry')) return '0–2 yrs';
  if (t.includes('senior') || t.includes('lead'))  return '5+ yrs';
  return '2–5 yrs';
}

function isNew(dateStr) {
  if (!dateStr) return false;
  const diff = (Date.now() - new Date(dateStr)) / 1000 / 60 / 60;
  return diff < 24;
}

function timeAgo(dateStr) {
  if (!dateStr) return 'recently';
  const mins = Math.floor((Date.now() - new Date(dateStr)) / 1000 / 60);
  if (mins < 60)   return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins/60)}h ago`;
  return `${Math.floor(mins/1440)}d ago`;
}
