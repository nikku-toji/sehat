// Thin API client. Token is kept in memory only (never localStorage) — PHI app.
let token = null;

export function setToken(t) { token = t; }

export async function devLogin(email = 'demo@sehat.app') {
  const res = await fetch('/api/auth/dev-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  setToken(data.token);
  return data;
}

export async function analyzeReport(file, profile) {
  const form = new FormData();
  form.append('file', file);
  form.append('profile', JSON.stringify(profile));

  const res = await fetch('/api/reports', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Analysis failed');
  }
  return res.json();
}
