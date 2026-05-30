import ScoreGauge from './ScoreGauge.jsx';

export default function Results({ data, onReset }) {
  const { healthScore, markers, insights, plan, hereditaryRisk, summary, disclaimer, mock } = data;

  return (
    <div className="rise">
      {mock && <div className="mockbanner">Demo data — running in MOCK_MODE (no AWS configured)</div>}

      {/* Score */}
      <div className="card">
        <div className="score-wrap">
          <ScoreGauge score={healthScore.score} band={healthScore.band} />
          <div>
            <div className="section-title" style={{ marginBottom: 4 }}>Your health score</div>
            <p className="muted" style={{ maxWidth: '44ch' }}>
              A weighted read across {healthScore.coverage} markers. Higher is better.
              {summary.abnormal.length > 0 &&
                ` ${summary.abnormal.length} marker(s) need attention.`}
            </p>
            <button className="btn ghost" style={{ marginTop: 16 }} onClick={onReset}>
              Analyze another report
            </button>
          </div>
        </div>
      </div>

      {/* Markers */}
      <div className="card">
        <div className="section-title">Markers</div>
        <div className="markers">
          {markers.map((m) => (
            <div className="marker" key={m.key}>
              <span>{m.label}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="m-val">{m.value} {m.unit}</span>
                <span className={`pill ${m.status}`}>{m.status}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      {insights?.length > 0 && (
        <div className="card">
          <div className="section-title">What this means</div>
          <div className="markers">
            {insights
              .filter((i) => i.status !== 'optimal')
              .map((i, idx) => (
                <div className="marker" key={idx} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <strong>{i.marker} <span className="muted">· {i.value}</span></strong>
                    <span className={`pill ${i.status}`}>{i.status}</span>
                  </div>
                  <span className="muted" style={{ marginTop: 6 }}>{i.meaning}</span>
                  <span style={{ marginTop: 4 }}>{i.whatToDo}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Plan */}
      {plan?.diet && (
        <div className="card">
          <div className="section-title">Your personalized plan</div>
          <div className="plan-grid">
            <div className="plan-block">
              <h4>Eat more</h4>
              <ul className="eat">{plan.diet.eat?.map((x, i) => <li key={i}>{x}</li>)}</ul>
            </div>
            <div className="plan-block">
              <h4>Cut back</h4>
              <ul className="avoid">{plan.diet.avoid?.map((x, i) => <li key={i}>{x}</li>)}</ul>
            </div>
            <div className="plan-block">
              <h4>Move</h4>
              <ul>{plan.activity?.map((x, i) => <li key={i}>{x}</li>)}</ul>
            </div>
            <div className="plan-block">
              <h4>Sleep & water</h4>
              <ul>{plan.sleep?.map((x, i) => <li key={i}>{x}</li>)}<li>{plan.hydration}</li></ul>
            </div>
          </div>
          {plan.diet.sampleDay && (
            <div className="plan-block" style={{ marginTop: 16 }}>
              <h4>A sample day</h4>
              <p className="muted">{plan.diet.sampleDay}</p>
            </div>
          )}
          {plan.retest?.length > 0 && (
            <div className="plan-block" style={{ marginTop: 16 }}>
              <h4>Retest</h4>
              <ul>{plan.retest.map((x, i) => <li key={i}>{x}</li>)}</ul>
            </div>
          )}
        </div>
      )}

      {/* Hereditary */}
      {hereditaryRisk?.length > 0 && (
        <div className="card">
          <div className="section-title">Hereditary risk to watch</div>
          <div className="markers">
            {hereditaryRisk.map((h, i) => (
              <div className="marker" key={i} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <strong>{h.condition}</strong>
                <span className="muted" style={{ marginTop: 4 }}>{h.basis}</span>
                <span style={{ marginTop: 4 }}>{h.suggestion}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="disclaimer">{disclaimer}</p>
    </div>
  );
}
