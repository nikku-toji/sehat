import { useState } from 'react';

export default function Onboard({ onNext }) {
  const [profile, setProfile] = useState({
    age: 32, sex: 'male', weightKg: 84,
    goals: 'Lose weight, improve cholesterol',
    familyHistory: [
      { relation: 'father', living: false, causeOfDeath: 'cardiac arrest', condition: 'cardiac disease' },
      { relation: 'mother', living: true, condition: 'type 2 diabetes' },
    ],
  });

  const set = (k, v) => setProfile((p) => ({ ...p, [k]: v }));
  const setFam = (i, k, v) =>
    setProfile((p) => {
      const fh = [...p.familyHistory];
      fh[i] = { ...fh[i], [k]: v };
      return { ...p, familyHistory: fh };
    });

  const submit = () =>
    onNext({
      age: Number(profile.age),
      sex: profile.sex,
      weightKg: Number(profile.weightKg),
      goals: String(profile.goals).split(',').map((s) => s.trim()).filter(Boolean),
      familyHistory: profile.familyHistory.map((f) => ({
        relation: f.relation,
        living: f.living,
        causeOfDeath: f.causeOfDeath,
        condition: f.condition,
      })),
    });

  return (
    <div className="rise">
      <h1 className="hero">Read your blood,<br /><em>change your life.</em></h1>
      <p className="lede">
        Upload a blood report and get plain-language insights, a health score, and a plan built
        for your body — and your family's history.
      </p>

      <div className="card" style={{ marginTop: 28 }}>
        <div className="section-title">A little about you</div>
        <div className="row">
          <div>
            <label>Age</label>
            <input type="number" value={profile.age} onChange={(e) => set('age', e.target.value)} />
          </div>
          <div>
            <label>Sex</label>
            <select value={profile.sex} onChange={(e) => set('sex', e.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div className="row">
          <div>
            <label>Weight (kg)</label>
            <input type="number" value={profile.weightKg} onChange={(e) => set('weightKg', e.target.value)} />
          </div>
          <div>
            <label>Goals (comma separated)</label>
            <input value={profile.goals} onChange={(e) => set('goals', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">Family history</div>
        <p className="muted" style={{ marginBottom: 8 }}>
          Including parents who've passed — this helps the AI reason about hereditary risk.
        </p>
        {profile.familyHistory.map((f, i) => (
          <div className="row" key={i} style={{ marginBottom: 6 }}>
            <div>
              <label>{f.relation}</label>
              <input
                value={f.condition || ''}
                placeholder="condition (e.g. type 2 diabetes)"
                onChange={(e) => setFam(i, 'condition', e.target.value)}
              />
            </div>
            <div>
              <label>{f.living ? 'Living' : 'Cause of death'}</label>
              <input
                value={f.living ? '—' : (f.causeOfDeath || '')}
                disabled={f.living}
                onChange={(e) => setFam(i, 'causeOfDeath', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      <button className="btn accent" onClick={submit}>Continue to upload →</button>
    </div>
  );
}
