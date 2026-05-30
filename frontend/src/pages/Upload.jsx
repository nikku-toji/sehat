import { useRef, useState } from 'react';

export default function Upload({ onAnalyze, loading, error }) {
  const [file, setFile] = useState(null);
  const [over, setOver] = useState(false);
  const inputRef = useRef(null);

  const pick = (f) => { if (f) setFile(f); };
  const onDrop = (e) => {
    e.preventDefault();
    setOver(false);
    pick(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="rise">
      <div className="card">
        <div className="section-title">Upload your blood report</div>
        <p className="muted" style={{ marginBottom: 16 }}>
          PDF or photo. In demo mode a sample report is analyzed automatically.
        </p>

        <div
          className={`drop ${over ? 'over' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={onDrop}
        >
          <div className="big">{file ? file.name : 'Drop your report here'}</div>
          <small>{file ? `${(file.size / 1024).toFixed(0)} KB · ready` : 'or click to browse — PDF, PNG, JPEG'}</small>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,image/png,image/jpeg"
            style={{ display: 'none' }}
            onChange={(e) => pick(e.target.files?.[0])}
          />
        </div>

        {error && <p style={{ color: 'var(--clay)', marginTop: 14 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
          <button className="btn accent" disabled={loading} onClick={() => onAnalyze(file)}>
            {loading ? 'Analyzing…' : file ? 'Analyze report' : 'Analyze sample report'}
          </button>
        </div>

        <p className="disclaimer">
          Your report is encrypted and used only to generate your insights. Sehat provides
          wellness information, not medical advice.
        </p>
      </div>
    </div>
  );
}
