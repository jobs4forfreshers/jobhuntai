// src/api/liveJobs.js
// Uses CORS-friendly APIs that work directly from browser

// ── Normalize job shape ──
const normalize = (job) => ({
  id:               job.id,
  title:            job.title,
  company:          job.company,
  location:         job.location || 'Remote',
  level:            detectLevel(job.title),
  categories:       detectCategories(job.title, job.tags || []),
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

// ── Jobicy via CORS proxy ──
export async function fetchJobicy(query = '') {
  try {
    const base = `https://jobicy.com/api/v2/remote-jobs?count=50&tag=${encodeURIComponent(query)}`;
    const url  = `https://api.allorigins.win/get?url=${encodeURIComponent(base)}`;
    const res  = await fetch(url);
    const data = await res.json();
    const jobs = JSON.parse(data.contents);

    return (jobs.jobs || []).map(j => normalize({
      id:        'jobicy-' + j.id,
      title:     j.jobTitle,
      company:   j.companyName,
      location:  j.jobGeo || 'Remote',
      source:    'Jobicy',
      salary:    j.annualSalaryMin
        ? `$${(j.annualSalaryMin/1000).toFixed(0)}k–$${(j.annualSalaryMax/1000).toFixed(0)}k`
        : null,
      tags:      [j.jobIndustry, j.jobType].filter(Boolean),
      date:      j.pubDate,
      apply_url: j.url,
    }));
  } catch (e) {
    console.error('Jobicy error:', e);
    return [];
  }
}

// ── RemoteOK via CORS proxy ──
export async function fetchRemoteOK(query = '') {
  try {
    const base = `https://remoteok.com/api`;
    const url  = `https://api.allorigins.win/get?url=${encodeURIComponent(base)}`;
    const res  = await fetch(url);
    const data = await res.json();
    const jobs = JSON.parse(data.contents);

    return jobs
      .slice(1)
      .filter(j => j.position && (!query ||
        j.position?.toLowerCase().includes(query.toLowerCase()) ||
        j.tags?.some(t => t?.toLowerCase().includes(query.toLowerCase()))
      ))
      .slice(0, 40)
      .map(j => normalize({
        id:        'remoteok-' + j.id,
        title:     j.position,
        company:   j.company,
        location:  'Remote',
        source:    'RemoteOK',
        salary:    j.salary_min
          ? `$${(j.salary_min/1000).toFixed(0)}k–$${(j.salary_max/1000).toFixed(0)}k`
          : null,
        tags:      j.tags || [],
        date:      j.date,
        apply_url: j.url || `https://remoteok.com/l/${j.id}`,
      }));
  } catch (e) {
    console.error('RemoteOK error:', e);
    return [];
  }
}

// ── Fetch ALL sources ──
export async function fetchAllLiveJobs(query = '') {
  const [jobicy, remoteok] = await Promise.allSettled([
    fetchJobicy(query),
    fetchRemoteOK(query),
  ]);

  const jobs = [
    ...(jobicy.status   === 'fulfilled' ? jobicy.value   : []),
    ...(remoteok.status === 'fulfilled' ? remoteok.value : []),
  ];

  return jobs.sort((a, b) => b.ai_score - a.ai_score);
}

// ── Helpers ──
function detectLevel(title = '') {
  const t = title.toLowerCase();
  if (t.match(/intern/))                                    return 'intern';
  if (t.match(/junior|fresher|entry|trainee/))              return 'fresher';
  if (t.match(/senior|lead|principal|staff|architect/))     return 'senior';
  return 'mid';
}

function detectCategories(title = '', tags = []) {
  const t = (title + ' ' + tags.join(' ')).toLowerCase();
  const cats = [];
  if (t.match(/python|java|node|react|backend|frontend|engineer|developer|software|devops/)) cats.push('it');
  if (t.match(/data|ml|machine.learning|ai|analytics|scientist|nlp/)) cats.push('data');
  if (t.match(/hr|marketing|finance|sales|content|seo/))   cats.push('nonit');
  if (t.match(/intern/))                                    cats.push('intern');
  if (t.match(/junior|fresher|entry/))                      cats.push('fresher');
  if (t.match(/senior|lead|principal/))                     cats.push('senior');
  return cats.length ? [...new Set(cats)] : ['it'];
}

function detectExp(title = '') {
  const t = title.toLowerCase();
  if (t.includes('intern'))         return 'Internship';
  if (t.match(/junior|entry/))      return '0–2 yrs';
  if (t.match(/senior|lead/))       return '5+ yrs';
  return '2–5 yrs';
}

function isNew(dateStr) {
  if (!dateStr) return false;
  return (Date.now() - new Date(dateStr)) / 1000 / 3600 < 24;
}

function timeAgo(dateStr) {
  if (!dateStr) return 'recently';
  const mins = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (mins < 60)   return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins/60)}h ago`;
  return `${Math.floor(mins/1440)}d ago`;
}