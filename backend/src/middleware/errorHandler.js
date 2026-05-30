/** Wrap async route handlers so thrown errors hit the error middleware. */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  // Never leak PHI or stack traces to the client.
  if (status >= 500) console.error('[error]', err);
  res.status(status).json({
    error: status >= 500 ? 'Internal server error' : err.message,
  });
}
