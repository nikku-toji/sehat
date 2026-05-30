import { useEffect, useState } from 'react';
import Onboard from './pages/Onboard.jsx';
import Upload from './pages/Upload.jsx';
import Results from './components/Results.jsx';
import { devLogin, analyzeReport } from './api/client.js';

export default function App() {
  const [step, setStep] = useState('onboard'); // onboard | upload | results
  const [profile, setProfile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dev auth so the demo flow works without Cognito.
  useEffect(() => { devLogin().catch(() => {}); }, []);

  const startUpload = (p) => { setProfile(p); setStep('upload'); };

  const runAnalysis = async (file) => {
    setError(null);
    setLoading(true);
    try {
      // In demo mode the backend ignores file contents, but the API still
      // requires a file part — synthesize a tiny placeholder if none chosen.
      const f = file || new File([new Blob(['demo'])], 'sample-report.pdf', { type: 'application/pdf' });
      const data = await analyzeReport(f, profile);
      setResult(data);
      setStep('results');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrap">
      <div className="topbar">
        <div className="brand">Sehat<span className="dot">.</span></div>
        <div className="tag">AI insights from your blood report</div>
      </div>

      {step === 'onboard' && <Onboard onNext={startUpload} />}
      {step === 'upload' && <Upload onAnalyze={runAnalysis} loading={loading} error={error} />}
      {step === 'results' && result && <Results data={result} onReset={() => setStep('upload')} />}
    </div>
  );
}
