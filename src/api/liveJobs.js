// src/api/liveJobs.js
// All job sources - Indian + Global + Govt

// ── Company data for Indian companies (Glassdoor-style) ──
var COMPANY_DATA = {
  'tcs': { rating: '3.8', stage: 'MNC · 600K+', salaryRange: '₹3.5–12 LPA', interview: 'Easy' },
  'infosys': { rating: '3.7', stage: 'MNC · 300K+', salaryRange: '₹3.5–10 LPA', interview: 'Easy' },
  'wipro': { rating: '3.6', stage: 'MNC · 250K+', salaryRange: '₹3.5–9 LPA', interview: 'Easy' },
  'hcl': { rating: '3.7', stage: 'MNC · 220K+', salaryRange: '₹3.5–11 LPA', interview: 'Moderate' },
  'accenture': { rating: '4.0', stage: 'MNC · 300K+', salaryRange: '₹4–15 LPA', interview: 'Moderate' },
  'cognizant': { rating: '3.8', stage: 'MNC · 350K+', salaryRange: '₹3.5–12 LPA', interview: 'Easy' },
  'capgemini': { rating: '3.9', stage: 'MNC · 200K+', salaryRange: '₹4–14 LPA', interview: 'Moderate' },
  'zoho': { rating: '4.1', stage: 'Product · 15K+', salaryRange: '₹4–18 LPA', interview: 'Hard' },
  'swiggy': { rating: '4.0', stage: 'Series H', salaryRange: '₹8–30 LPA', interview: 'Hard' },
  'zomato': { rating: '3.9', stage: 'Listed', salaryRange: '₹8–28 LPA', interview: 'Hard' },
  'flipkart': { rating: '4.1', stage: 'Walmart · Listed', salaryRange: '₹10–40 LPA', interview: 'Hard' },
  'amazon': { rating: '4.0', stage: 'FAANG', salaryRange: '₹15–60 LPA', interview: 'Very Hard' },
  'google': { rating: '4.5', stage: 'FAANG', salaryRange: '₹20–80 LPA', interview: 'Very Hard' },
  'microsoft': { rating: '4.4', stage: 'FAANG', salaryRange: '₹18–70 LPA', interview: 'Very Hard' },
  'razorpay': { rating: '4.3', stage: 'Unicorn', salaryRange: '₹12–40 LPA', interview: 'Hard' },
  'phonepe': { rating: '4.2', stage: 'Walmart', salaryRange: '₹12–35 LPA', interview: 'Hard' },
  'paytm': { rating: '3.7', stage: 'Listed', salaryRange: '₹8–25 LPA', interview: 'Moderate' },
  'byju': { rating: '3.2', stage: 'Startup', salaryRange: '₹4–15 LPA', interview: 'Easy' },
  'upgrad': { rating: '3.5', stage: 'Series F', salaryRange: '₹5–18 LPA', interview: 'Moderate' },
  'myntra': { rating: '4.0', stage: 'Flipkart', salaryRange: '₹10–30 LPA', interview: 'Hard' },
  'default': { rating: null, stage: null, salaryRange: null, interview: null },
};

function getCompanyData(companyName) {
  if (!companyName) return COMPANY_DATA['default'];
  var key = companyName.toLowerCase().split(' ')[0];
  return COMPANY_DATA[key] || COMPANY_DATA['default'];
}

// ── Normalize job shape ──
var normalize = function(job) {
  var co = getCompanyData(job.company);
  return {
    id: job.id,
    title: job.title || '',
    company: job.company || '',
    location: job.location || 'India',
    level: detectLevel(job.title || '', job.exp || ''),
    categories: detectCategories(job.title || '', job.tags || []),
    source: job.source,
    work_type: job.remote ? 'Remote' : (job.hybrid ? 'Hybrid' : 'On-site'),
    remote: job.remote || false,
    hybrid: job.hybrid || false,
    experience_range: job.exp || detectExp(job.title || ''),
    salary_display: job.salary || co.salaryRange || 'Not disclosed',
    company_rating: job.rating || co.rating,
    company_stage: job.stage || co.stage,
    interview_difficulty: co.interview,
    deadline: job.deadline || null,
    ai_score: Math.floor(68 + Math.random() * 30),
    is_new: isNew(job.date),
    posted_ago: timeAgo(job.date),
    is_hot: false,
    skills: (job.tags || []).slice(0, 6).map(function(t) { return { name: t, match: false }; }),
    apply_url: job.apply_url || '#',
    is_indian: job.is_indian || false,
  };
};

// ── 1. Remotive (Remote global jobs) ──
export async function fetchRemotive(query) {
  try {
    var q = query || '';
    var url = q
      ? 'https://remotive.com/api/remote-jobs?search=' + encodeURIComponent(q) + '&limit=40'
      : 'https://remotive.com/api/remote-jobs?limit=40';
    var res = await fetch(url);
    if (!res.ok) throw new Error('Status ' + res.status);
    var data = await res.json();
    return (data.jobs || []).map(function(j) {
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

// ── 2. The Muse (Global jobs) ──
export async function fetchTheMuse(query) {
  try {
    var q = query || '';
    var url = 'https://www.themuse.com/api/public/jobs?page=1&descending=true'
      + (q ? '&query=' + encodeURIComponent(q) : '');
    var res = await fetch(url);
    if (!res.ok) throw new Error('Status ' + res.status);
    var data = await res.json();
    return (data.results || []).slice(0, 25).map(function(j) {
      var loc = j.locations && j.locations[0] ? j.locations[0].name : 'Remote';
      return normalize({
        id: 'muse-' + j.id,
        title: j.name,
        company: j.company ? j.company.name : 'Company',
        location: loc,
        remote: loc.toLowerCase().indexOf('remote') !== -1,
        source: 'The Muse',
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

// ── 3. Arbeitnow (Tech jobs) ──
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
    return jobs.slice(0, 25).map(function(j) {
      return normalize({
        id: 'arbeitnow-' + j.slug,
        title: j.title,
        company: j.company_name,
        location: j.location || 'Remote',
        remote: j.remote || false,
        source: 'Arbeitnow',
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

// ── 4. Adzuna India (Real Indian jobs) ──
export async function fetchAdzunaIndia(query) {
  try {
    // Free API - get key at adzuna.com/api
    var APP_ID  = process.env.REACT_APP_ADZUNA_ID  || 'demo';
    var APP_KEY = process.env.REACT_APP_ADZUNA_KEY || 'demo';
    var q = query || 'developer';
    var url = 'https://api.adzuna.com/v1/api/jobs/in/search/1'
      + '?app_id=' + APP_ID
      + '&app_key=' + APP_KEY
      + '&results_per_page=30'
      + '&what=' + encodeURIComponent(q)
      + '&content-type=application/json';

    var res = await fetch(url);
    if (!res.ok) throw new Error('Status ' + res.status);
    var data = await res.json();

    return (data.results || []).map(function(j) {
      var salMin = j.salary_min ? Math.round(j.salary_min / 100000) : null;
      var salMax = j.salary_max ? Math.round(j.salary_max / 100000) : null;
      var salDisplay = salMin && salMax
        ? 'Rs.' + salMin + 'L - Rs.' + salMax + 'L PA'
        : 'Not disclosed';

      return normalize({
        id: 'adzuna-' + j.id,
        title: j.title,
        company: j.company ? j.company.display_name : 'Company',
        location: j.location ? j.location.display_name : 'India',
        remote: j.title.toLowerCase().indexOf('remote') !== -1,
        source: 'Adzuna',
        salary: salDisplay,
        tags: j.category ? [j.category.label] : [],
        date: j.created,
        apply_url: j.redirect_url,
        is_indian: true,
        exp: detectExpFromDesc(j.description || ''),
      });
    });
  } catch (e) {
    console.error('Adzuna error:', e.message);
    return [];
  }
}

// ── 5. Indian Govt Jobs (NCS Portal RSS) ──
export async function fetchGovtJobs() {
  try {
    // NCS Portal - National Career Service
    var feeds = [
      'https://www.sarkariresult.com/feed/',
      'https://www.freejobalert.com/feed/',
    ];

    var results = [];
    for (var i = 0; i < feeds.length; i++) {
      try {
        var proxyUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feeds[i]);
        var res = await fetch(proxyUrl);
        if (!res.ok) continue;
        var data = await res.json();
        var items = data.items || [];

        items.slice(0, 15).forEach(function(item) {
          results.push(normalize({
            id: 'govt-' + Math.random().toString(36).substr(2, 9),
            title: item.title || 'Government Job',
            company: 'Government of India',
            location: 'All India',
            remote: false,
            source: 'Sarkari Naukri',
            tags: ['Government', 'PSU', 'Sarkari'],
            date: item.pubDate,
            apply_url: item.link || 'https://www.ncs.gov.in',
            is_indian: true,
            stage: 'Central Govt',
            exp: 'Fresher / Any Graduate',
          }));
        });
      } catch (feedErr) {
        console.error('Govt feed error:', feedErr.message);
      }
    }
    return results;
  } catch (e) {
    console.error('Govt jobs error:', e.message);
    return [];
  }
}

// ── 6. Internshala Jobs (via RSS) ──
export async function fetchInternshalaJobs() {
  try {
    var feeds = [
      'https://internshala.com/rss/jobs',
      'https://internshala.com/rss/internships',
    ];
    var results = [];

    for (var i = 0; i < feeds.length; i++) {
      try {
        var proxyUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feeds[i]);
        var res = await fetch(proxyUrl);
        if (!res.ok) continue;
        var data = await res.json();
        var items = data.items || [];
        var isIntern = feeds[i].indexOf('internships') !== -1;

        items.slice(0, 20).forEach(function(item) {
          results.push(normalize({
            id: 'internshala-' + Math.random().toString(36).substr(2, 9),
            title: item.title || 'Job Opening',
            company: item.author || 'Company',
            location: 'India',
            remote: item.title && item.title.toLowerCase().indexOf('work from home') !== -1,
            source: 'Internshala',
            tags: isIntern ? ['Internship', 'Fresher'] : ['Job', 'Fresher'],
            date: item.pubDate,
            apply_url: item.link || 'https://internshala.com',
            is_indian: true,
            exp: isIntern ? 'Students / Fresher' : '0-1 yr',
          }));
        });
      } catch (feedErr) {
        console.error('Internshala feed error:', feedErr.message);
      }
    }
    return results;
  } catch (e) {
    console.error('Internshala error:', e.message);
    return [];
  }
}

// ── Fetch ALL sources ──
export async function fetchAllLiveJobs(query) {
  console.log('Fetching all jobs, query:', query || 'all');

  var promises = [
    fetchRemotive(query),
    fetchTheMuse(query),
    fetchArbeitnow(query),
    fetchGovtJobs(),
    fetchInternshalaJobs(),
  ];

  // Add Adzuna only if API key is set
  if (process.env.REACT_APP_ADZUNA_ID && process.env.REACT_APP_ADZUNA_ID !== 'demo') {
    promises.push(fetchAdzunaIndia(query));
  }

  var results = await Promise.allSettled(promises);
  var jobs = [];

  results.forEach(function(r) {
    if (r.status === 'fulfilled' && Array.isArray(r.value)) {
      jobs = jobs.concat(r.value);
    }
  });

  // Remove duplicates by title+company
  var seen = {};
  jobs = jobs.filter(function(j) {
    var key = (j.title + j.company).toLowerCase().replace(/\s/g, '');
    if (seen[key]) return false;
    seen[key] = true;
    return true;
  });

  console.log('Total jobs loaded:', jobs.length);
  jobs.sort(function(a, b) { return b.ai_score - a.ai_score; });
  return jobs;
}

// ── Helpers ──
function detectLevel(title, exp) {
  var t = (title + ' ' + (exp || '')).toLowerCase();
  if (t.indexOf('intern') !== -1) return 'intern';
  if (t.match(/junior|fresher|entry|trainee|graduate|0.1 year|0-1/)) return 'fresher';
  if (t.match(/senior|lead|principal|staff|architect|manager|director|head/)) return 'senior';
  return 'mid';
}

function detectCategories(title, tags) {
  var t = (title + ' ' + (tags || []).join(' ')).toLowerCase();
  var cats = [];
  if (t.match(/python|java|node|react|angular|vue|backend|frontend|fullstack|developer|engineer|software|devops|cloud|aws|php|dotnet|android|ios|flutter/)) {
    cats.push('it');
  }
  if (t.match(/data|ml|machine|learning|ai|analytics|scientist|nlp|llm|tableau|power.bi/)) {
    cats.push('data');
  }
  if (t.match(/hr|human.resource|marketing|finance|sales|operations|content|seo|mba|ca|accountant|bcom|bba/)) {
    cats.push('nonit');
  }
  if (t.match(/government|ssc|upsc|psu|railway|bank|ias|sarkari|ncs|defence|police/)) {
    cats.push('govt');
  }
  if (t.indexOf('intern') !== -1) cats.push('intern');
  if (t.match(/junior|fresher|entry|graduate|trainee/)) cats.push('fresher');
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

function detectExpFromDesc(desc) {
  var match = desc.match(/(\d+)\s*[\-to]+\s*(\d+)\s*year/i);
  if (match) return match[1] + '-' + match[2] + ' yrs';
  var single = desc.match(/(\d+)\+?\s*year/i);
  if (single) return single[1] + '+ yrs';
  return '';
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