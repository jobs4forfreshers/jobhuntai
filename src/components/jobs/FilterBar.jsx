// ── src/components/jobs/FilterBar.jsx ──
import './FilterBar.css';

const EXP_OPTIONS     = [['fresher','Fresher (0–1yr)'],['1-3','1–3 yrs'],['3-5','3–5 yrs'],['5+','5+ yrs']];
const WORK_OPTIONS    = [['remote','Remote'],['hybrid','Hybrid'],['onsite','On-site']];
const SALARY_OPTIONS  = [
  [null, 5,  'Stipend / ₹0–5L'],
  [5,   12,  '₹5–12L'],
  [12,  25,  '₹12–25L'],
  [25, null, '₹25L+'],
];
const CITY_OPTIONS    = ['Hyderabad','Bangalore','Mumbai','Delhi NCR','Chennai','Pune','Pan India'];
const COMPANY_OPTIONS = [['startup','Startup'],['mnc','MNC'],['unicorn','Unicorn'],['faang','FAANG']];

export default function FilterBar({ filters, toggleArrayFilter, setFilter, reset, activeCount }) {
  const { level, workType, locations, companySize, salaryMin, salaryMax } = filters;

  const isSalaryActive = (min, max) => salaryMin === min && salaryMax === max;
  const toggleSalary = (min, max) => {
    if (isSalaryActive(min, max)) { setFilter('salaryMin', null); setFilter('salaryMax', null); }
    else { setFilter('salaryMin', min); setFilter('salaryMax', max); }
  };

  return (
    <div className="filter-bar">
      <Group label="Exp">
        {EXP_OPTIONS.map(([val, lbl]) => (
          <Chip key={val} active={level.includes(val)} onClick={() => toggleArrayFilter('level', val)}>
            {lbl}
          </Chip>
        ))}
      </Group>
      <Sep />
      <Group label="Work">
        {WORK_OPTIONS.map(([val, lbl]) => (
          <Chip key={val} active={workType.includes(val)} onClick={() => toggleArrayFilter('workType', val)}>
            {lbl}
          </Chip>
        ))}
      </Group>
      <Sep />
      <Group label="Salary">
        {SALARY_OPTIONS.map(([min, max, lbl]) => (
          <Chip key={lbl} active={isSalaryActive(min, max)} onClick={() => toggleSalary(min, max)}>
            {lbl}
          </Chip>
        ))}
      </Group>
      <Sep />
      <Group label="City">
        {CITY_OPTIONS.map(city => (
          <Chip key={city} active={locations.includes(city)} onClick={() => toggleArrayFilter('locations', city)}>
            {city}
          </Chip>
        ))}
      </Group>
      <Sep />
      <Group label="Company">
        {COMPANY_OPTIONS.map(([val, lbl]) => (
          <Chip key={val} active={companySize.includes(val)} onClick={() => toggleArrayFilter('companySize', val)}>
            {lbl}
          </Chip>
        ))}
      </Group>

      {activeCount > 0 && (
        <>
          <Sep />
          <button className="clear-btn" onClick={reset}>✕ Clear {activeCount}</button>
        </>
      )}
    </div>
  );
}

function Group({ label, children }) {
  return (
    <div className="filter-group">
      <span className="filter-label">{label}</span>
      {children}
    </div>
  );
}

function Sep() { return <div className="filter-sep" />; }

function Chip({ active, onClick, children }) {
  return (
    <button className={`chip ${active ? 'active' : ''}`} onClick={onClick}>
      {children}
    </button>
  );
}
