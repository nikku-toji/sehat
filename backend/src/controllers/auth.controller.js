import jwt from 'jsonwebtoken';
import { asyncHandler } from '../middleware/errorHandler.js';
import { config } from '../config/index.js';

/**
 * POST /api/auth/dev-login   { email }
 * DEV ONLY. Issues a short-lived local JWT so the frontend flow works without
 * Cognito. In production this endpoint does not exist — auth is the Cognito
 * Hosted UI / OAuth flow, and the API only verifies Cognito-issued tokens.
 */
export const devLogin = asyncHandler(async (req, res) => {
  if (config.env === 'production') {
    return res.status(404).json({ error: 'Not available' });
  }
  const email = (req.body?.email || 'demo@sehat.app').toLowerCase();
  const token = jwt.sign(
    { sub: `user_${Buffer.from(email).toString('hex').slice(0, 10)}`, email, tier: 'free' },
    config.jwt.secret,
    { issuer: config.jwt.issuer, expiresIn: '12h' }
  );
  res.json({ token, email });
});
