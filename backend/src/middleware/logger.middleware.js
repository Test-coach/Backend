const requestLogger = (req, res, next) => {
  console.log({
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    duration: `${Date.now() - req._startTime}ms`,
    userAgent: req.get('user-agent'),
    ip: req.ip
  });
  next();
};

module.exports = { requestLogger }; 