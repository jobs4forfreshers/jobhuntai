// ── src/pages/Profile.jsx ──
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api';

export default function Profile() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    // await userAPI.updateProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ padding: '28px 36px' }}>
      <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>My Profile</h1>
      <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginBottom: 24 }}>
        Complete your profile to improve AI match accuracy
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16 }}>
        {/* Left — identity card */}
        <div>
          <div className="card" style={{ textAlign: 'center', marginBottom: 14 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', margin: '0 auto 12px',
              background: 'linear-gradient(135deg,rgba(0,229,160,.3),rgba(124,111,255,.3))',
              border: '2px solid var(--accent)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 20,
              fontWeight: 600, color: 'var(--accent)'
            }}>
              {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
            </div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{user?.firstName || 'Arjun'} {user?.lastName || 'Sharma'}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)', margin: '4px 0' }}>
              Senior Python Developer
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>
              ◎ Hyderabad, Telangana
            </div>
          </div>

          <div className="card">
            <div className="section-label" style={{ marginBottom: 12 }}>Profile Score</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 600, color: 'var(--accent)' }}>78%</div>
              <div className="text-xs muted mono">complete</div>
            </div>
            {[
              [true,  'Basic info'],
              [true,  'Skills added'],
              [true,  'Resume uploaded'],
              [false, 'Portfolio / GitHub'],
              [false, 'Certifications'],
            ].map(([done, lbl]) => (
              <div key={lbl} style={{ display: 'flex', gap: 8, padding: '4px 0', fontFamily: 'var(--mono)', fontSize: 11 }}>
                <span style={{ color: done ? 'var(--accent)' : 'var(--dim)' }}>{done ? '✓' : '○'}</span>
                <span style={{ color: done ? 'var(--muted)' : 'var(--text)' }}>{lbl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — form */}
        <div>
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="section-label" style={{ marginBottom: 14 }}>Personal Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                ['First name','Arjun'],['Last name','Sharma'],
                ['Email','arjun@example.com'],['Phone','+91 98765 43210'],
                ['Current role','Python Backend Developer'],['Location','Hyderabad, Telangana'],
              ].map(([lbl, ph]) => (
                <div key={lbl}>
                  <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 7 }}>{lbl}</label>
                  <input className="input" defaultValue={ph} />
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginBottom: 14 }}>
            <div className="section-label" style={{ marginBottom: 12 }}>Skills</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['Python','FastAPI','Django','PostgreSQL','Redis','Celery','REST APIs'].map(s => (
                <span key={s} className="tag tag-match">{s}</span>
              ))}
              {['Docker','AWS EC2','Git','Linux','Elasticsearch'].map(s => (
                <span key={s} className="tag" style={{ borderColor: 'rgba(124,111,255,.2)', color: 'var(--a2)' }}>{s}</span>
              ))}
              <span className="tag" style={{ cursor: 'pointer', color: 'var(--muted)' }}>+ Add skill</span>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 14 }}>
            <div className="section-label" style={{ marginBottom: 14 }}>Job Preferences</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[['Current CTC','₹16 LPA'],['Expected CTC','₹22–28 LPA']].map(([l, v]) => (
                <div key={l}>
                  <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 7 }}>{l}</label>
                  <input className="input" defaultValue={v} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button className="btn">Discard</button>
            <button className="btn btn-primary" onClick={handleSave}>
              {saved ? '✓ Saved!' : 'Save Profile →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
