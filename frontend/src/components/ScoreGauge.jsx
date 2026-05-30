import { useEffect, useState } from 'react';

const COLORS = {
  excellent: 'var(--vital)',
  good: 'var(--vital-2)',
  fair: 'var(--amber)',
  'needs attention': 'var(--clay)',
};

export default function ScoreGauge({ score, band }) {
  const [shown, setShown] = useState(0);
  const r = 74;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score || 0));

  useEffect(() => {
    let raf;
    const start = performance.now();
    const dur = 900;
    const tick = (t) => {
      const k = Math.min(1, (t - start) / dur);
      setShown(Math.round(pct * (1 - Math.pow(1 - k, 3)))); // ease-out cubic
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pct]);

  return (
    <div className="gauge">
      <svg width="168" height="168" viewBox="0 0 168 168">
        <circle cx="84" cy="84" r={r} fill="none" stroke="var(--line)" strokeWidth="12" />
        <circle
          cx="84" cy="84" r={r} fill="none"
          stroke={COLORS[band] || 'var(--vital)'}
          strokeWidth="12" strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (shown / 100) * c}
          style={{ transition: 'stroke-dashoffset .05s linear' }}
        />
      </svg>
      <div className="num">
        <b>{shown}</b>
        <span>{band}</span>
      </div>
    </div>
  );
}
