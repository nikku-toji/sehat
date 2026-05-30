import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

/**
 * Verifies a bearer token and attaches req.user.
 *
 * Dev: HMAC-signed local JWT (see /api/auth/dev-login).
 * Prod: swap to Cognito JWKS verification — Cognito issues RS256 tokens; verify
 * against the pool's JWKS endpoint and trust `sub` as the user id. Left as a
 * single integration point so nothing else changes.
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing bearer token' });

  try {
    const payload = jwt.verify(token, config.jwt.secret, { issuer: config.jwt.issuer });
    req.user = { id: payload.sub, email: payload.email, tier: payload.tier || 'free' };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
