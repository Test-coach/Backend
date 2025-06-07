const corsOptions = {
    origin: (origin, callback) => {
      // Read env and normalise: "a.com, b.com" → ["a.com", "b.com"]
      const envOrigins = (process.env.ALLOWED_ORIGINS || '')
        .split(',')
        .map(o => o.trim())
        .filter(Boolean);
  
      // If the only entry is '*', allow everything
      if (envOrigins.includes('*')) {
        return callback(null, true);
      }
  
      // Default whitelist for local development
      const defaultOrigins = [
        'http://localhost:3000',
        'http://localhost:5173'
      ];
  
      const allowedOrigins = envOrigins.length ? envOrigins : defaultOrigins;
  
      // Allow requests that have no Origin header (curl, Postman, mobile apps)
      if (!origin) return callback(null, true);
  
      // Match exact origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
  
      // Otherwise, block the request
      return callback(new Error('Not allowed by CORS'));
    },
  
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-Access-Token',
      'X-API-Key'
    ],
  
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 86_400,        // 24 h
    preflightContinue: false,
    optionsSuccessStatus: 204
};

module.exports = corsOptions; 