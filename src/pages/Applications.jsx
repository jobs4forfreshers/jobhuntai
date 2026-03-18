// ── src/pages/Applications.jsx ──
import { MOCK_JOBS } from '../utils/mockData';

const STATUS = ['Applied','Screening','Interview','Offered','Rejected'];
const COLOR  = { Applied:'var(--muted)', Screening:'var(--a2)', Interview:'var(--warn)', Offered:'var(--accent)', Rejected:'var(--dim)' };

export default function Applications() {
  const apps = MOCK_JOBS.slice(0, 7).map((j, i) => ({
    ...j,
    appliedDate: `${i + 1} day${i ? 's' : ''} ago`,
    status: STATUS[i % STATUS.length],
  }));

  return (
    <div style={{ padding: '28px 36px' }}>
      <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>My Applications</h1>
      <p className="text-xs muted mono" style={{ marginBottom: 24 }}>
        Track all your job applications in one place
      </p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 24 }}>
        {STATUS.map(s => (
          <div key={s} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 600, color: COLOR[s] }}>
              {apps.filter(a => a.status === s).length}
            </div>
            <div className="text-xs muted mono" style={{ marginTop: 3 }}>{s}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)' }}>
              {['Role','Company','Applied','Status','Action'].map(h => (
                <th key={h} style={{ padding: '12px 16px', fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'left', fontWeight: 400 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {apps.map(a => (
              <tr key={a.id} style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={{ padding: '12px 16px', fontSize: 13 }}>{a.title}</td>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)' }}>{a.company}</td>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>{a.appliedDate}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: 10, padding: '3px 8px',
                    borderRadius: 3, border: `1px solid ${COLOR[a.status]}`,
                    color: COLOR[a.status], background: COLOR[a.status] + '18',
                  }}>{a.status}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button className="btn btn-sm">View →</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
