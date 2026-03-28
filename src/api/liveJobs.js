const normalize = (job) => ({
  id: job.id,
  title: job.title || '',
  company: job.company || '',
  location: job.location || 'Remote',
  level: detectLevel(job.title || ''),
  categories: detectCategories(job.title || '', job.tags || []),
  source: job.source,
  work_type: job.remote ? 'Remote' : 'On-site',
  remote: job.remote || false,
  experience_range: detectExp(job.title || ''),
  salary_display: job.salary || 'Not disclosed',
  company_rating: null,
  company_stage: null,
  deadline: null,
  ai_score: Math.floor(68 + Math.random() * 30),
  is_new: isNew(job.date),
  posted_ago: timeAgo(job.date),
  is_hot: false,
  skills: (job.tags || []).slice(0, 6).map(t => ({ name: t, match: false })),
  apply_url: job.apply_url || '#',
});

export async function fetchRemotive(query) {
  try {
    var q = query || '';
    var url = q
      ? 'https://remotive.com/api/remote-jobs?search=' + encodeURIComponent(q) + '&limit=50'
      : 'https://remotive.com/api/remote-jobs?limit=50';
    var res = await fetch(url);
    if (!res.ok) throw new Error('Status ' + res.status);
    var data = await res.json();
    var jobs = data.jobs || [];
    return jobs.map(function(j) {
      return normalize({
        id: 'remotive-' + j.id,
        title: j.title,
        company: j.company_name,
        location: j.candidate_required_location || 'Worldwide',
        remote: true,
        source: 'Remotive',
        salary: j.salary || null,
        tags: j.tags || [],
        date: j.publication_date,
        apply_url: j.url,
      });
    });
  } catch (e) {
    console.error('Remotive error:', e.message);
    return [];
  }
}

export async function fetchTheMuse(query) {
  try {
    var q = query || '';
    var url = 'https://www.themuse.com/api/public/jobs?page=1&descending=true'
      + (q ? '&query=' + encodeURIComponent(q) : '');
    var res = await fetch(url);
    if (!res.ok) throw new Error('Status ' + res.status);
    var data = await res.json();
    var jobs = (data.results || []).slice(0, 30);
    return jobs.map(function(j) {
      var loc = j.locations && j.locations[0] ? j.locations[0].name : 'Remote';
      return normalize({
        id: 'muse-' + j.id,
        title: j.name,
        company: j.company ? j.company.name : 'Company',
        location: loc,
        remote: loc.toLowerCase().indexOf('remote') !== -1,
        source: 'The Muse',
        salary: null,
        tags: j.categories ? j.categories.map(function(c) { return c.name; }) : [],
        date: j.publication_date,
        apply_url: j.refs ? j.refs.landing_page : '#',
      });
    });
  } catch (e) {
    console.error('TheMuse error:', e.message);
    return [];
  }
}

export async function fetchArbeitnow(query) {
  try {
    var res = await fetch('https://www.arbeitnow.com/api/job-board-api');
    if (!res.ok) throw new Error('Status ' + res.status);
    var data = await res.json();
    var jobs = data.data || [];
    if (query) {
      var q = query.toLowerCase();
      jobs = jobs.filter(function(j) {
        return (j.title && j.title.toLowerCase().indexOf(q) !== -1)
          || (j.company_name && j.company_name.toLowerCase().indexOf(q) !== -1)
          || (j.tags && j.tags.some(function(t) { return t && t.toLowerCase().indexOf(q) !== -1; }));
      });
    }
    return jobs.slice(0, 30).map(function(j) {
      return normalize({
        id: 'arbeitnow-' + j.slug,
        title: j.title,
        company: j.company_name,
        location: j.location || 'Remote',
        remote: j.remote || false,
        source: 'Arbeitnow',
        salary: null,
        tags: j.tags || [],
        date: new Date(j.created_at * 1000).toISOString(),
        apply_url: j.url,
      });
    });
  } catch (e) {
    console.error('Arbeitnow error:', e.message);
    return [];
  }
}

export async function fetchAllLiveJobs(query) {
  console.log('Fetching jobs...');
  var results = await Promise.allSettled([
    fetchRemotive(query),
    fetchTheMuse(query),
    fetchArbeitnow(query),
  ]);
  var jobs = [];
  results.forEach(function(r) {
    if (r.status === 'fulfilled') {
      jobs = jobs.concat(r.value);
    }
  });
  console.log('Total jobs loaded:', jobs.length);
  jobs.sort(function(a, b) { return b.ai_score - a.ai_score; });
  return jobs;
}

function detectLevel(title) {
  var t = title.toLowerCase();
  if (t.indexOf('intern') !== -1) return 'intern';
  if (t.match(/junior|fresher|entry|trainee|graduate/)) return 'fresher';
  if (t.match(/senior|lead|principal|staff|architect/)) return 'senior';
  if (t.match(/manager|director|head/)) return 'senior';
  return 'mid';
}

function detectCategories(title, tags) {
  var t = (title + ' ' + tags.join(' ')).toLowerCase();
  var cats = [];
  if (t.match(/python|java|node|react|angular|vue|backend|frontend|fullstack|developer|engineer|software|devops|cloud|aws/)) {
    cats.push('it');
  }
  if (t.match(/data|ml|machine|learning|ai|analytics|scientist|nlp|llm/)) {
    cats.push('data');
  }
  if (t.match(/hr|marketing|finance|sales|operations|content|seo/)) {
    cats.push('nonit');
  }
  if (t.indexOf('intern') !== -1) cats.push('intern');
  if (t.match(/junior|fresher|entry|graduate/)) cats.push('fresher');
  if (t.match(/senior|lead|principal/)) cats.push('senior');
  if (cats.length === 0) cats.push('it');
  return cats.filter(function(v, i, a) { return a.indexOf(v) === i; });
}

function detectExp(title) {
  var t = title.toLowerCase();
  if (t.indexOf('intern') !== -1) return 'Internship';
  if (t.match(/junior|entry|fresher/)) return '0-2 yrs';
  if (t.match(/senior|lead/)) return '5+ yrs';
  return '2-5 yrs';
}

function isNew(dateStr) {
  if (!dateStr) return false;
  return (Date.now() - new Date(dateStr).getTime()) / 3600000 < 48;
}

function timeAgo(dateStr) {
  if (!dateStr) return 'recently';
  var mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 60) return mins + 'm ago';
  if (mins < 1440) return Math.floor(mins / 60) + 'h ago';
  return Math.floor(mins / 1440) + 'd ago';
}