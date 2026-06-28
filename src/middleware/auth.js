const API_KEYS = new Set(
  (process.env.API_KEYS || '').split(',').map(k => k.trim()).filter(Boolean)
);
export function apiKeyAuth(req, res, next) {
  const key = req.headers['x-api-key'];
  if (!key || !API_KEYS.has(key)) {
    return res.status(401).json({ error: '无效或缺失 API Key' });
  }
  next();
}
