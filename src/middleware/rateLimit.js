const requestCounts = new Map();
export function rateLimiter(maxRequests, windowSeconds) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    if (!requestCounts.has(ip)) requestCounts.set(ip, []);
    const timestamps = requestCounts.get(ip).filter(t => now - t < windowMs);
    timestamps.push(now);
    requestCounts.set(ip, timestamps);
    if (timestamps.length > maxRequests) {
      return res.status(429).json({ error: '请求过于频繁。限制: ' + maxRequests + ' 次/' + windowSeconds + '秒' });
    }
    next();
  };
}
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of requestCounts.entries()) {
    const valid = timestamps.filter(t => now - t < 60000);
    if (valid.length === 0) requestCounts.delete(ip);
    else requestCounts.set(ip, valid);
  }
}, 60000);
